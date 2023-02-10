import {
  For,
  Match,
  Show,
  Switch,
  onCleanup,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";
import { ERROR_CODE } from "Constants/error-codes";
import { Loader } from "Components";
import {
  is_loading,
  selectedTradeType,
  setSelectedTradeType,
  setTradeTypes,
  fetchMarketTick,
} from "Stores";
import { ContractType } from "Utils/contract-type";
import throttle from "lodash.throttle";

import OptionsTrade from "./options-trade";
import classNames from "classnames";
import dashboardStyles from "Styles/watchlist.module.scss";
import { getContractTypesConfig } from "Constants/trade-config";
import { login_information } from "Stores/base-store";
import shared from "Styles/shared.module.scss";
import styles from "./trade.module.scss";
import { forgetAll, wait } from "Utils/socket-base";
import { market_ticks, setMarketTicks } from "Stores/trade-store";
import {
  generateTickData,
  checkWhenMarketOpens,
  calculateTimeLeft,
} from "Utils/format-value";

const Trade = () => {
  const [durations_list, setDurationsList] = createSignal([]);
  const [selected_contract_type, setSelectedContractType] = createSignal();
  const [contract_config, setContractConfig] = createSignal();
  const [is_market_closed, setIsMarketClosed] = createSignal();

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

  onCleanup(() => {
    forgetAll("ticks");
    setMarketTicks({});
  });

  const marketDataHandler = async (response) => {
    if (!response.error) {
      const { quote, symbol } = response.tick;
      const prev_value = market_ticks()[symbol]?.current ?? 0;
      const current_value = quote;
      setMarketTicks({
        ...market_ticks(),
        [symbol]: generateTickData({
          previous: prev_value,
          current: current_value,
        }),
      });
    } else {
      const { echo_req, error } = response;
      if (error.code === ERROR_CODE.market_closed) {
        if (!is_market_closed()) {
          setIsMarketClosed(true);
          const time_left = await checkWhenMarketOpens(0, echo_req.ticks);
          setMarketTicks({
            ...market_ticks(),
            [echo_req.ticks]: generateTickData({
              is_closed: true,
              opens_at: calculateTimeLeft(time_left),
            }),
          });
        }
      }
    }
  };

  onMount(async () => {
    await wait("forget_all");
    await fetchMarketTick(
      selectedTradeType()?.symbol,
      throttle(marketDataHandler, 500)
    );
  });

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
              <DisplayTick symbol={selectedTradeType()?.symbol} />
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
                    <option disabled="disabled">Select Trade Types</option>
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

const DisplayTick = (props) => {
  const difference = () => {
    const { previous, current } = market_ticks()[props.symbol];
    if (isNaN(previous) && isNaN(current)) {
      return { value: 0, status: "" };
    }
    let status = "same";
    const rateChange =
      current && previous ? ((current - previous) / previous) * 100 : 0;
    if (current < previous) {
      status = "decrease";
    } else if (current > previous) {
      status = "increase";
    }
    return { value: rateChange ?? 0, status };
  };

  onCleanup(async () => {
    setSelectedTradeType({});
  });

  return (
    <Show
      when={!is_loading() && market_ticks()[props.symbol]}
      fallback={<Loader class={shared["loader-position"]} />}
    >
      <div class={styles["market-tick"]}>
        <span
          class={classNames(
            dashboardStyles["badge"],
            dashboardStyles[`badge--${difference().status}`]
          )}
        >
          {market_ticks()[props.symbol].current}
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
