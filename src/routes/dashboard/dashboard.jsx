import { Button, Loader, Watchlist } from "../../components";
import { For, Show, createSignal, onCleanup, onMount } from "solid-js";
import { selected_markets, setSelectedTradeType } from "../../stores";

import { createStore } from "solid-js/store";
import { login_information } from "Stores/base-store";
import monitorNetwork from "Utils/network-status";
import shared from "../../styles/shared.module.scss";
import styles from "../../styles/dashboard.module.scss";
import { useNavigate } from "solid-app-router";

const Dashboard = () => {
  const navigate = useNavigate();

  const is_watchlist = () => selected_markets().length || null;

  const [is_loading, setIsLoading] = createSignal();
  const [watchlist_symbol_stream_ref, setWatchListSymbolStreamRef] =
    createStore();

  const { network_status } = monitorNetwork();

  // const getMarketTick = (market) => {
  //   setIsLoading(true);
  //   setWatchList({ ...watch_list(), [market]: 0 });
  //   const unsubscribeRef = subscribe(
  //     {
  //       ticks: market,
  //       subscribe: 1,
  //     },
  //     (resp) => {
  //       const prev_value = watch_list()[market];
  //       const new_value = resp.tick.quote;
  //       setIsLoading(false);
  //       setPrevWatchList({
  //         ...prev_watch_list(),
  //         [market]: prev_value ?? 0,
  //       });
  //       if (
  //         Object.values(watch_list_ref()).length !== selected_markets().length
  //       ) {
  //         setWatchListRef({ ...watch_list_ref(), [market]: resp.tick.id });
  //       }
  //       setTimeout(() => {
  //         setWatchList({ ...watch_list(), [market]: new_value });
  //       });
  //     }
  //   );
  //   setWatchListSymbolStreamRef([
  //     ...watchlist_symbol_stream_ref,
  //     unsubscribeRef,
  //   ]);
  // };

  onMount(() => {
    if (!network_status.is_disconnected) {
      // const get_favs = getFavourites();
      setIsLoading(false);
      setWatchListSymbolStreamRef([]);
      // if (get_favs?.length) {
      //   get_favs.forEach((marketSymbol) => getMarketTick(marketSymbol));
      // }
    }
  });

  onCleanup(() => {
    if (watchlist_symbol_stream_ref.length) {
      watchlist_symbol_stream_ref.forEach(
        async (subscribe_ref) => await subscribe_ref.unsubscribe()
      );
    }
  });

  return (
    <Show
      when={!login_information.is_logging_in && !is_loading()}
      fallback={<Loader class={shared["loader-position"]} />}
    >
      <Show
        when={is_watchlist()}
        fallback={
          <div class={styles["no-list"]}>
            <div>You have not added anything to your Watchlist.</div>
            <Button
              type="primary"
              onClick={() => navigate("/trade", { replace: true })}
            >
              {" "}
              Go to Trading
            </Button>
          </div>
        }
      >
        <For each={selected_markets()}>
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
