import { Match, Switch } from "solid-js";
import {
  prev_watch_list,
  selected_markets,
  setSelectedMarkets,
  watch_list,
  watch_list_ref,
} from "../stores";

import { Button } from "../components";
import classNames from "classnames";
import { sendRequest } from "../utils/socket-base";
import styles from "../styles/watchlist.module.scss";

const MarketValue = (props) => {
  const difference = () => {
    if (
      isNaN(watch_list()[props.symbol]) &&
      isNaN(prev_watch_list()[props.symbol])
    ) {
      return { value: 0, status: "" };
    }
    let status = "same";
    const rateChange =
      watch_list()[props.symbol] && prev_watch_list()[props.symbol]
        ? ((watch_list()[props.symbol] - prev_watch_list()[props.symbol]) /
            prev_watch_list()[props.symbol]) *
          100
        : 0;
    if (watch_list()[props.symbol] < prev_watch_list()[props.symbol]) {
      status = "decrease";
    } else if (watch_list()[props.symbol] > prev_watch_list()[props.symbol]) {
      status = "increase";
    }
    return { value: rateChange ?? 0, status };
  };

  return (
    <section class={styles["market-value"]}>
      <span
        class={classNames(
          styles["badge"],
          styles[`badge--${difference().status}`]
        )}
      >
        {watch_list()[props.symbol]}
      </span>
      <span
        class={classNames(styles.text, styles[`text--${difference().status}`])}
      >
        <b>{difference()["value"].toFixed(2)} %</b>
        <Switch>
          <Match when={difference().status === "increase"}>
            <div class={styles["arrow-up"]} />
          </Match>
          <Match when={difference().status === "decrease"}>
            <div class={styles["arrow-down"]} />
          </Match>
        </Switch>
      </span>
    </section>
  );
};

const Watchlist = (props) => {
  const active_user = localStorage.getItem("userId") ?? "guest";
  const removeWatchlistHandler = (symbol) => {
    const newList = JSON.parse(
      localStorage.getItem(`${active_user}-favourites`)
    ).filter((sym) => sym !== symbol);
    localStorage.setItem(`${active_user}-favourites`, JSON.stringify(newList));
    setSelectedMarkets(
      selected_markets().filter((mkt) => mkt.symbol !== symbol)
    );
    sendRequest({ forget: watch_list_ref()[symbol] });
  };

  return (
    <div class={styles["card"]} onClick={() => props.onClick()}>
      <div class={styles["card--title"]}>
        <span class={styles["card--title-name"]}>{props.name}</span>
        <span class={styles["card--title-symbol"]}>{props.symbol}</span>
      </div>
      <div class={styles["container"]}>
        <section class={styles["market-info"]}>
          <p class={styles["market-info-data"]}>Market: {props.market}</p>
          <p class={styles["market-info-data"]}>
            Sub market: {props.submarket}
          </p>
        </section>
        <MarketValue symbol={props.symbol} />
      </div>
      <Button
        type="primary"
        onClick={(event) => {
          event.stopPropagation();
          removeWatchlistHandler(props.symbol);
        }}
      >
        Remove from Watchlist
      </Button>
    </div>
  );
};

export default Watchlist;
