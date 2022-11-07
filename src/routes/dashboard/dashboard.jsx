import { Show, For, onMount, createSignal } from "solid-js";
import { useNavigate } from "solid-app-router";
import { Watchlist, Loader } from "../../components";
import {
  selectedMarkets,
  setPrevWatchList,
  prevWatchList,
  watchList,
  setWatchList,
  setWatchListRef,
  watchListRef,
  setSelectedTradeType,
} from "../../stores";
import styles from "../../styles/dashboard.module.scss";
import { subscribe } from "../../utils/socket-base";
import { login_information } from "Stores/base-store";

const Dashboard = () => {
  const navigate = useNavigate();

  const is_watchlist = () => selectedMarkets().length || null;

  const [is_loading, setIsLoading] = createSignal(false);

  const getMarketTick = (market) => {
    setIsLoading(true);
    setWatchList({ ...watchList(), [market]: 0 });
    subscribe(
      {
        ticks: market,
        subscribe: 1,
      },
      (resp) => {
        const prev_value = watchList()[market];
        const new_value = resp.tick.quote;
        setIsLoading(false);
        setPrevWatchList({
          ...prevWatchList(),
          [market]: prev_value ?? 0,
        });
        if (Object.values(watchListRef()).length !== selectedMarkets().length) {
          setWatchListRef({ ...watchListRef(), [market]: resp.tick.id });
        }
        setTimeout(() => {
          setWatchList({ ...watchList(), [market]: new_value });
        });
      }
    );
  };

  onMount(() => {
    const getFavs = JSON.parse(localStorage.getItem("favourites"));
    if (getFavs?.length) {
      getFavs.forEach((marketSymbol) => getMarketTick(marketSymbol));
    }
  });

  return (
    <Show
      when={!login_information.is_logging_in && !is_loading()}
      fallback={<Loader class={styles["loader-position"]} />}
    >
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
              onClick={() => {
                setSelectedTradeType(marketInfo);
                navigate("/trade", { replace: true });
              }}
            />
          )}
        </For>
      </Show>
    </Show>
  );
};

export default Dashboard;
