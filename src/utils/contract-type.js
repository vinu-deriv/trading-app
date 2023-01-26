import { getPropertyValue, cloneObject } from "Utils/object";
import { toMoment } from "Utils/format-value";
import {
  getContractCategoriesConfig,
  getContractTypesConfig,
} from "Constants/trade-config";

import { sendRequest } from "Utils/socket-base";

const getDurationFromString = (duration_string) => {
  const duration = duration_string.toString().match(/[a-zA-Z]+|[0-9]+/g) || "";
  return {
    duration: +duration[0], // converts string to numbers
    unit: duration[1],
  };
};

const getDurationMaps = () => ({
  t: { display: "Ticks", order: 1, to_second: null },
  s: { display: "Seconds", order: 2, to_second: 1 },
  m: { display: "Minutes", order: 3, to_second: 60 },
  h: { display: "Hours", order: 4, to_second: 60 * 60 },
  d: { display: "Days", order: 5, to_second: 60 * 60 * 24 },
});

const convertDurationUnit = (value, from_unit, to_unit) => {
  if (!value || !from_unit || !to_unit || isNaN(value)) {
    return null;
  }
  const duration_maps = getDurationMaps();
  if (from_unit === to_unit || duration_maps[from_unit].to_second === null) {
    return value;
  }
  return (
    (value * (duration_maps[from_unit]?.to_second ?? 1)) /
    (duration_maps[to_unit]?.to_second ?? 1)
  );
};

const buildDurationConfig = (
  contract,
  durations = { min_max: { spot: {}, forward: {} }, units_display: {} }
) => {
  durations.units_display[contract.start_type] =
    durations.units_display[contract.start_type] || [];

  const obj_min = getDurationFromString(contract.min_contract_duration);
  const obj_max = getDurationFromString(contract.max_contract_duration);

  durations.min_max[contract.start_type][contract.expiry_type] = {
    min: convertDurationUnit(obj_min.duration, obj_min.unit, "s") || 0,
    max: convertDurationUnit(obj_max.duration, obj_max.unit, "s") || 0,
  };

  const arr_units = [];
  durations?.units_display?.[contract.start_type]?.forEach?.((obj) => {
    arr_units.push(obj.value);
  });

  const duration_maps = getDurationMaps();

  if (/^tick|daily$/.test(contract.expiry_type)) {
    if (arr_units.indexOf(obj_min.unit) === -1) {
      arr_units.push(obj_min.unit);
    }
  } else {
    Object.keys(duration_maps).forEach((u) => {
      if (
        u !== "d" &&
        arr_units.indexOf(u) === -1 &&
        duration_maps[u].order >= duration_maps[obj_min.unit].order &&
        duration_maps[u].order <= duration_maps[obj_max.unit].order
      ) {
        arr_units.push(u);
      }
    });
  }

  durations.units_display[contract.start_type] = arr_units
    .sort((a, b) => (duration_maps[a].order > duration_maps[b].order ? 1 : -1))
    .reduce((o, c) => [...o, { text: duration_maps[c].display, value: c }], []);
  return durations;
};

export const buildBarriersConfig = (
  contract,
  barriers = { count: contract.barriers }
) => {
  if (!contract.barriers) {
    return undefined;
  }

  const obj_barrier = {};

  ["barrier", "low_barrier", "high_barrier"].forEach((field) => {
    if (field in contract) obj_barrier[field] = contract[field];
  });

  return Object.assign(barriers || {}, {
    [contract.expiry_type]: obj_barrier,
  });
};

const buildForwardStartingConfig = (contract, forward_starting_dates) => {
  const forward_starting_config = [];

  if ((contract.forward_starting_options || []).length) {
    contract.forward_starting_options.forEach((option) => {
      const duplicated_option = forward_starting_config.find(
        (opt) => opt.value === parseInt(option.date)
      );
      const current_session = {
        open: toMoment(option.open),
        close: toMoment(option.close),
      };
      if (duplicated_option) {
        duplicated_option.sessions.push(current_session);
      } else {
        forward_starting_config.push({
          text: toMoment(option.date).format("ddd - DD MMM, YYYY"),
          value: parseInt(option.date),
          sessions: [current_session],
        });
      }
    });
  }

  return forward_starting_config.length
    ? forward_starting_config
    : forward_starting_dates;
};

const buildTradeTypesConfig = (contract, trade_types = {}) => {
  trade_types[contract.contract_type] = contract.contract_display;
  return trade_types;
};

export const ContractType = (() => {
  let available_contract_types = {};
  let available_categories = {};
  let contract_types;
  let has_only_forward_starting_contracts = false;

  const buildContractTypesConfig = async (symbol) => {
    const r = await sendRequest({ contracts_for: symbol });
    const has_contracts = getPropertyValue(r, ["contracts_for"]);
    has_only_forward_starting_contracts =
      has_contracts &&
      !r.contracts_for.available.find(
        (contract) => contract.start_type !== "forward"
      );
    if (!has_contracts || has_only_forward_starting_contracts) return;
    const contract_categories = getContractCategoriesConfig();
    contract_types = getContractTypesConfig(symbol);

    available_contract_types = {};
    available_categories = cloneObject(contract_categories);

    r.contracts_for.available.forEach((contract) => {
      const type = Object.keys(contract_types).find(
        (key) =>
          contract_types[key].trade_types.indexOf(contract.contract_type) !==
            -1 &&
          (typeof contract_types[key].barrier_count === "undefined" ||
            +contract_types[key].barrier_count === contract.barriers)
      );

      if (!type) return;

      if (!available_contract_types[type]) {
        const sub_cats =
          available_categories[
            Object.keys(available_categories).find(
              (key) => available_categories[key].categories.indexOf(type) !== -1
            )
          ].categories;
        if (!sub_cats) return;
        sub_cats[sub_cats.indexOf(type)] = {
          value: type,
          text: contract_types[type].title,
        };
        available_contract_types[type] = cloneObject(contract_types[type]);
      }
      const config = available_contract_types[type].config || {};

      config.has_spot = config.has_spot || contract.start_type === "spot";
      config.durations =
        !config.hide_duration &&
        buildDurationConfig(contract, config.durations);
      config.trade_types = buildTradeTypesConfig(contract, config.trade_types);
      config.barriers = buildBarriersConfig(contract, config.barriers);
      config.multiplier_range = contract.multiplier_range;
      config.cancellation_range = contract.cancellation_range;
      config.forward_starting_dates = buildForwardStartingConfig(
        contract,
        config.forward_starting_dates
      );

      available_contract_types[type].config = config;
    });

    Object.keys(available_categories).forEach((key) => {
      available_categories[key].categories = available_categories[
        key
      ].categories?.filter((item) => typeof item === "object");
      if (available_categories[key].categories?.length === 0) {
        delete available_categories[key];
      }
    });
  };

  const getArrayDefaultValue = (arr_new_values, value) =>
    arr_new_values.indexOf(value) !== -1 ? value : arr_new_values[0];

  const getDurationUnitsList = (contract_type, contract_start_type) => {
    return {
      duration_units_list:
        getPropertyValue(available_contract_types, [
          contract_type,
          "config",
          "durations",
          "units_display",
          contract_start_type,
        ]) || [],
    };
  };

  const getDurationUnit = (
    duration_unit,
    contract_type,
    contract_start_type
  ) => {
    const duration_units =
      getPropertyValue(available_contract_types, [
        contract_type,
        "config",
        "durations",
        "units_display",
        contract_start_type,
      ]) || [];
    const arr_units = [];
    duration_units.forEach((obj) => {
      arr_units.push(obj.value);
    });

    return {
      duration_unit: getArrayDefaultValue(arr_units, duration_unit),
    };
  };

  const getDurationMinMax = (
    contract_type,
    contract_start_type,
    contract_expiry_type
  ) => {
    let duration_min_max =
      getPropertyValue(available_contract_types, [
        contract_type,
        "config",
        "durations",
        "min_max",
        contract_start_type,
      ]) || {};

    if (contract_expiry_type) {
      duration_min_max = duration_min_max[contract_expiry_type] || {};
    }

    return { duration_min_max };
  };

  const getFullContractTypes = () => available_contract_types;

  const getStartType = (start_date) => ({
    // Number(0) refers to 'now'
    contract_start_type: start_date === Number(0) ? "spot" : "forward",
  });

  const getStartDates = (contract_type, current_start_date) => {
    const config = getPropertyValue(available_contract_types, [
      contract_type,
      "config",
    ]);
    const start_dates_list = [];

    if (config?.has_spot) {
      // Number(0) refers to 'now'
      start_dates_list.push({ text: "Now", value: Number(0) });
    }
    if (config?.forward_starting_dates) {
      start_dates_list.push(...config.forward_starting_dates);
    }

    const start_date = start_dates_list.find(
      (item) => item.value === current_start_date
    )
      ? current_start_date
      : start_dates_list[0]?.value;

    return { start_date, start_dates_list };
  };

  const getSessions = (contract_type, start_date) => {
    const config =
      getPropertyValue(available_contract_types, [contract_type, "config"]) ||
      {};
    const sessions = (
      (config.forward_starting_dates || []).find(
        (option) => option.value === start_date
      ) || {}
    ).sessions;
    return { sessions };
  };

  const getExpiryType = (duration_units_list, expiry_type) => {
    if (duration_units_list) {
      if (
        (!expiry_type && duration_units_list.length > 0) ||
        (duration_units_list.length === 1 &&
          duration_units_list[0].value === "t")
      ) {
        return { expiry_type: "duration" };
      }
      if (duration_units_list.length === 0) {
        return {
          expiry_type: null,
        };
      }
    }

    return { expiry_type };
  };

  const getBarriers = (contract_type, expiry_type) => {
    const barriers =
      getPropertyValue(available_contract_types, [
        contract_type,
        "config",
        "barriers",
      ]) || {};
    const barrier_values = barriers[expiry_type] || {};
    const barrier_1 =
      barrier_values.barrier || barrier_values.high_barrier || "";
    const barrier_2 = barrier_values.low_barrier || "";
    return {
      barrier_count: barriers.count || 0,
      barrier_1: barrier_1.toString(),
      barrier_2: barrier_2.toString(),
    };
  };

  return {
    buildContractTypesConfig,
    getBarriers,
    getDurationMinMax,
    getDurationUnit,
    getDurationUnitsList,
    getFullContractTypes,
    getExpiryType,
    getSessions,
    getStartType,
    getStartDates,
    getContractCategories: () => ({
      contract_types_list: available_categories,
      has_only_forward_starting_contracts,
    }),
  };
})();
