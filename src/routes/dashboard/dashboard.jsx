import { Show, For } from "solid-js";
import { useNavigate } from "solid-app-router";
import Watchlist from "../../components/watchlist";
import {
  selectedMarkets,
  setPrevWatchList,
  prevWatchList,
  watchList,
  setWatchList,
  setWatchListRef,
  watchListRef,
} from "../../stores";
import styles from "../../styles/dashboard.module.scss";
import { createEffect } from "solid-js";
import { subscribe } from "../../utils/socket-base";

const Dashboard = () => {
  const navigate = useNavigate();

  const is_watchlist = () => selectedMarkets().length || null;

  const getMarketTick = (market) => {
    subscribe(
      {
        ticks: market,
        subscribe: 1,
      },
      (resp) => {
        setPrevWatchList({
          ...prevWatchList(),
          [market]: watchList()[market] ?? 0,
        });
        setWatchList({ ...watchList(), [market]: resp.tick.quote });
        if (Object.values(watchListRef()).length !== selectedMarkets().length) {
          setWatchListRef({ ...watchListRef(), [market]: resp.tick.id });
        }
      }
    );
  };

  createEffect(() => {
    const getFavs = JSON.parse(localStorage.getItem("favourites"));
    if (getFavs?.length) {
      getFavs.forEach((marketSymbol) => getMarketTick(marketSymbol));
    }
  });

  return (
    <Show
      when={is_watchlist()}
      fallback={
        <div class={styles["no-list"]}>
          <div>You have not added anything to your Watchlist</div>
          <button
            class={styles["trade--button"]}
            onClick={() => navigate("/trade", { replace: true })}
          >
            {" "}
            Go to Trading
          </button>
        </div>
      }
    >
      <For each={selectedMarkets()}>
        {(marketInfo) => (
          <Watchlist
            name={marketInfo.display_name}
            symbol={marketInfo.symbol}
            market={marketInfo.market_display_name}
            submarket={marketInfo.submarket_display_name}
          />
        )}
      </For>
    </Show>
  );
};

export default Dashboard;
