import {
  For,
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { useNavigate } from "@solidjs/router";
import BackArrow from "Assets/svg/action/back-arrow.svg";
import { ERROR_CODE, ERROR_MESSAGE } from "Constants/error-codes";
import {
  calculateTimeLeft,
  checkWhenMarketOpens,
  generateTickData,
} from "Utils/format-value";
import {
  fetchMarketTick,
  is_loading,
  selectedTradeType,
  setSelectedTradeType,
  setTradeTypes,
} from "Stores";
import {
  market_ticks,
  setBannerMessage,
  setMarketTicks,
} from "Stores/trade-store";

import { ContractType } from "Utils/contract-type";
import { Loader, Slider } from "Components";
import OptionsTrade from "./options-trade";
import classNames from "classnames";
import dashboardStyles from "Styles/watchlist.module.scss";
import { getContractTypesConfig } from "Constants/trade-config";
import { login_information } from "Stores/base-store";
import shared from "Styles/shared.module.scss";
import styles from "./trade.module.scss";
import { subscribe } from "Utils/socket-base";
import throttle from "lodash.throttle";
import { wait } from "Utils/socket-base";

const Trade = () => {
  const [durations_list, setDurationsList] = createSignal([]);
  const [selected_contract_type, setSelectedContractType] = createSignal();
  const [contract_config, setContractConfig] = createSignal();
  const [is_market_closed, setIsMarketClosed] = createSignal();
  const [day_low, setDayLow] = createSignal("");
  const [day_high, setDayHigh] = createSignal("");
  const [step_value, setStepValue] = createSignal(1);
  const [status, setStatus] = createSignal("");

  const getConfig = async () => {
    try {
      await ContractType.buildContractTypesConfig(selectedTradeType()?.symbol);
    } catch (error) {
      setBannerMessage(error?.error?.message ?? ERROR_MESSAGE.general_error);
    }
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

  const fetchMarketValues = async (symbol, getOHLC) => {
    await subscribe(
      {
        ticks_history: symbol,
        style: "candles",
        end: "latest",
        count: 1000,
        granularity: 86400,
        adjust_start_time: 1,
        subscribe: 1,
      },
      getOHLC
    );
  };

  const navigate = useNavigate();

  const getOHLC = (resp) => {
    const { msg_type, ohlc } = resp;
    if (msg_type === "ohlc") {
      setDayLow(parseFloat(ohlc.low));
      setDayHigh(parseFloat(ohlc.high));
      setStepValue(ohlc.pip_size);
    }
  };

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
    await fetchMarketValues(
      selectedTradeType()?.symbol,
      throttle(getOHLC, 500)
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
            <Show when={selectedTradeType()?.display_name}>
              <div class={styles["instrument-title"]}>
                <div
                  onClick={() => navigate(-1)}
                  class={styles["instrument-btn"]}
                >
                  <BackArrow height="24" fill="var(--text-main)" />
                </div>
                <h4 class={styles["tick-text"]}>
                  <b>{selectedTradeType()?.display_name}</b>
                </h4>
              </div>
            </Show>
            <section
              class={classNames(
                styles.container,
                styles[`container--${status()}`]
              )}
            >
              <DisplayTick
                symbol={selectedTradeType()?.symbol}
                setStatusValue={setStatus}
              />
            </section>
            <div class={styles["trading-layout-slider"]}>
              {is_market_closed() ? (
                <p class={styles["error-message"]}>
                  This market is presently closed. Try out the derived indices
                  which are always open"
                </p>
              ) : (
                <Slider
                  day_low={day_low()}
                  day_high={day_high()}
                  step_value={step_value()}
                  ticks={market_ticks()[selectedTradeType()?.symbol]?.current}
                />
              )}
            </div>
            <Switch fallback={"Loading trade types"}>
              <Match when={JSON.stringify(contract_config()) === "{}"}>
                <p> No trade types supported</p>
              </Match>
              <Match when={contract_config()}>
                <div class={styles["select-trade"]}>
                  <h4>
                    <b>Select Trade Type:</b>
                  </h4>
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
      props.setStatusValue("decrease");
      status = "decrease";
    } else if (current > previous) {
      props.setStatusValue("increase");
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
        <span class={styles["tick-text"]}>
          {market_ticks()[props.symbol].current}
        </span>
        <span
          class={classNames(
            dashboardStyles.text,
            dashboardStyles[`text--${difference().status}`]
          )}
        >
          <b>({difference()["value"].toFixed(2)})</b>
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
