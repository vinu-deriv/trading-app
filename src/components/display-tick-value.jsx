import { Match, Show, Switch, createEffect, createSignal } from "solid-js";

import Loader from "./loader";
import classNames from "classnames";
import { market_ticks } from "../stores";
import shared from "../styles/shared.module.scss";
import styles from "../styles/watchlist.module.scss";

const DisplayTickValue = (props) => {
  const [difference, setDifference] = createSignal({ value: 0 });

  createEffect(() => {
    if (
      props.data &&
      Object.keys(market_ticks()).length &&
      market_ticks()[props.data]
    ) {
      const { previous, current, is_closed, opens_at } =
        market_ticks()[props.data];
      if (is_closed) {
        setDifference({
          value: `Open in ${opens_at.days}D:${opens_at.hours}h`,
          status: "same",
        });
      } else if (isNaN(previous) && isNaN(current)) {
        setDifference({ value: 0, status: "same" });
      } else {
        const rate_change = current ?? 0;
        if (current < previous) {
          setDifference({ value: rate_change, status: "decrease" });
        } else if (current > previous) {
          setDifference({ value: rate_change, status: "increase" });
        }
      }
    }
  });

  return (
    <Show
      when={!!market_ticks()[props.data]}
      fallback={<Loader class={shared["spinner"]} type="1" size="1.5rem" />}
    >
      <Switch>
        <Match when={market_ticks()[props.data]["is_closed"] === true}>
          <span class={shared["market-closed"]}>
            <b>{difference()["value"]}</b>
          </span>
        </Match>
        <Match when={market_ticks()[props.data]["is_closed"] === false}>
          <b
            class={classNames(
              styles.badge,
              styles[`badge--${difference().status}`],
              styles["badge-align"]
            )}
          >
            {difference()["value"]}
          </b>
        </Match>
      </Switch>
    </Show>
  );
};

export default DisplayTickValue;
