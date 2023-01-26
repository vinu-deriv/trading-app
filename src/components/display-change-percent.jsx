import { Show, createEffect, createSignal } from "solid-js";

import Loader from "./loader";
import { is_loading } from "../stores";
import { market_ticks } from "../stores";
import shared from "../styles/shared.module.scss";
import styles from "../styles/watchlist.module.scss";

const DisplayChangePercent = (props) => {
  const [difference, setDifference] = createSignal({ value: 0 });

  createEffect(() => {
    if (
      props.data &&
      Object.keys(market_ticks()).length &&
      market_ticks()[props.data]
    ) {
      const { previous, current } = market_ticks()[props.data];
      if (isNaN(previous) && isNaN(current)) {
        setDifference({ value: 0, status: "same" });
      }
      const rate_change =
        current === 0 || previous === 0
          ? 0
          : ((current - previous) / previous) * 100;
      if (current < previous) {
        setDifference({ value: rate_change, status: "decrease" });
      } else if (current > previous) {
        setDifference({ value: rate_change, status: "increase" });
      }
    }
  });

  return (
    <Show
      when={!is_loading()}
      fallback={<Loader class={shared["spinner"]} type="1" size="1.5rem" />}
    >
      <b class={styles[`text--${difference().status}`]}>
        {difference()["value"].toFixed(2)} %
      </b>
    </Show>
  );
};

export default DisplayChangePercent;
