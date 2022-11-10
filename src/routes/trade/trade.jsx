import { Accordion, Loader } from "../../components";
import styles from "./trade.module.scss";
import { For, Show, Match, Switch, onCleanup } from "solid-js";
import { getContractTypesConfig } from "Constants/trade-config";
import {
  selectedTradeType,
  setTradeTypes,
  setSubscribeId,
  subscribe_id,
  is_loading,
  current_tick,
  prev_tick,
} from "../../stores";
import OptionsTrade from "./options-trade";
import { login_information } from "../../stores/base-store";
import { sendRequest } from "../../utils/socket-base";
import shared from "../../styles/shared.module.scss";
import dashboardStyles from "../../styles/watchlist.module.scss";
import classNames from "classnames";

const Trade = () => {
  return (
    <div class={styles["trade-flex-layout"]}>
      <div class={styles["trade-flex-layout__accordion"]}>
        <Accordion />
      </div>
      {login_information.is_logged_in && (
        <div class={styles["trade-flex-layout__trade"]}>
          <section>
            <Show
              when={selectedTradeType()?.symbol}
              fallback={
                <p class={styles["error-message"]}>
                  Select a Market to trade with
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
            </Show>
          </section>
          <div class={styles["select-trade"]}>
            <select
              class={styles["trade-type-dropdown"]}
              onChange={(event) =>
                setTradeTypes(getContractTypesConfig()[`${event.target.value}`])
              }
            >
              <option selected="true" disabled="disabled">
                Select Trade Types
              </option>
              <For each={Object.keys(getContractTypesConfig())}>
                {(trade) => (
                  <option value={trade}>
                    {getContractTypesConfig()[`${trade}`].title}
                  </option>
                )}
              </For>
            </select>
            <Show when={selectedTradeType()?.symbol}>
              <p>
                Symbol : <b>{selectedTradeType()?.symbol}</b>
              </p>
            </Show>
          </div>
          <OptionsTrade />
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
    const rateChange = current_tick() - prev_tick();
    if (current_tick() < prev_tick()) {
      status = "decrease";
    } else if (current_tick() > prev_tick()) {
      status = "increase";
    }
    return { value: rateChange ?? 0, status };
  };

  onCleanup(() => {
    sendRequest({ forget: subscribe_id() }).then(() => {
      setSubscribeId(null);
    });
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
          <b>{difference()["value"].toFixed(2)}</b>
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
