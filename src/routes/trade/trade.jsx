import { Accordion, Loader } from "../../components";
import {
  For,
  Match,
  Show,
  Switch,
  onCleanup,
  createEffect,
  createSignal,
} from "solid-js";
import {
  current_tick,
  is_loading,
  prev_tick,
  selectedTradeType,
  setSelectedTradeType,
  setTradeTypes,
  subscribe_id,
} from "../../stores";
import { ContractType } from "Utils/contract-type";

import OptionsTrade from "./options-trade";
import classNames from "classnames";
import dashboardStyles from "../../styles/watchlist.module.scss";
import { getContractTypesConfig } from "Constants/trade-config";
import { login_information } from "../../stores/base-store";
import shared from "../../styles/shared.module.scss";
import styles from "./trade.module.scss";

const Trade = () => {
  const [durations_list, setDurationsList] = createSignal([]);
  const [selected_contract_type, setSelectedContractType] = createSignal();
  const [contract_config, setContractConfig] = createSignal();

  const getConfig = async () => {
    await ContractType.buildContractTypesConfig(selectedTradeType()?.symbol);
    const contract_config = ContractType.getFullContractTypes();
    setContractConfig(contract_config);
    if (Object.keys(contract_config).length) {
      setSelectedContractType(Object.keys(contract_config)[0]);
      setTradeTypes(contract_config[Object.keys(contract_config)[0]]);
      setDurationsList(
        ContractType.getDurationUnitsList(`${selected_contract_type()}`, "spot")
          .duration_units_list
      );
    }
  };

  createEffect(() => {
    if (selectedTradeType()?.symbol) {
      setContractConfig({});
      setSelectedContractType({});
      setDurationsList([]);
      setTradeTypes({});
      getConfig();
    }
  });

  createEffect(() => {
    if (selected_contract_type())
      setDurationsList(
        ContractType.getDurationUnitsList(`${selected_contract_type()}`, "spot")
          .duration_units_list
      );
  });

  return (
    <div class={styles["trade-flex-layout"]}>
      <div class={styles["trade-flex-layout__accordion"]}>
        <Accordion />
      </div>
      {login_information.is_logged_in && (
        <div class={styles["trade-flex-layout__trade"]}>
          <Show
            when={selectedTradeType()?.symbol}
            fallback={
              <p class={styles["error-message"]}>
                Select a market to trade with
              </p>
            }
          >
            <section
              class={classNames(
                styles.container,
                dashboardStyles["market-value"]
              )}
            >
              <strong class={styles["market-text"]}>Market price:</strong>
              <DisplayTick />
            </section>
            <Switch fallback={"Loading trade types"}>
              <Match when={JSON.stringify(contract_config()) === "{}"}>
                <p> No trade types supported</p>
              </Match>
              <Match when={contract_config()}>
                <div class={styles["select-trade"]}>
                  <select
                    class={styles["trade-type-dropdown"]}
                    onChange={(event) => {
                      setTradeTypes(contract_config()[`${event.target.value}`]);
                      setDurationsList(
                        ContractType.getDurationUnitsList(
                          `${event.target.value}`,
                          "spot"
                        ).duration_units_list
                      );
                      setSelectedContractType(`${event.target.value}`);
                    }}
                  >
                    <option selected="true" disabled="disabled">
                      Select Trade Types
                    </option>
                    <For each={Object.keys(contract_config())}>
                      {(trade) =>
                        !getContractTypesConfig()[`${trade}`]
                          .hide_from_dropdown && (
                          <option value={trade}>
                            {getContractTypesConfig()[`${trade}`].title}
                          </option>
                        )
                      }
                    </For>
                  </select>
                  <Show when={selectedTradeType()?.display_name}>
                    <p>
                      Symbol : <b>{selectedTradeType()?.display_name}</b>
                    </p>
                  </Show>
                </div>
                <OptionsTrade
                  durations_list={durations_list()}
                  selected_contract_type={selected_contract_type()}
                />
              </Match>
            </Switch>
          </Show>
        </div>
      )}
    </div>
  );
};

const DisplayTick = () => {
  const difference = () => {
    if (isNaN(current_tick()) && isNaN(prev_tick())) {
      return { value: 0, status: "" };
    }
    let status = "same";
    const rateChange =
      current_tick() && prev_tick()
        ? ((current_tick() - prev_tick()) / prev_tick()) * 100
        : 0;
    if (current_tick() < prev_tick()) {
      status = "decrease";
    } else if (current_tick() > prev_tick()) {
      status = "increase";
    }
    return { value: rateChange ?? 0, status };
  };

  onCleanup(async () => {
    await subscribe_id()?.unsubscribe();
    setSelectedTradeType({});
  });

  return (
    <Show
      when={!is_loading()}
      fallback={<Loader class={shared["loader-position"]} />}
    >
      <div class={styles["market-tick"]}>
        <span
          class={classNames(
            dashboardStyles["badge"],
            dashboardStyles[`badge--${difference().status}`]
          )}
        >
          {current_tick()}
        </span>
        <span
          class={classNames(
            dashboardStyles.text,
            dashboardStyles[`text--${difference().status}`]
          )}
        >
          <b>{difference()["value"].toFixed(2)} %</b>
          <Switch>
            <Match when={difference().status === "increase"}>
              <div class={dashboardStyles["arrow-up"]} />
            </Match>
            <Match when={difference().status === "decrease"}>
              <div class={dashboardStyles["arrow-down"]} />
            </Match>
          </Switch>
        </span>
      </div>
    </Show>
  );
};

export default Trade;
