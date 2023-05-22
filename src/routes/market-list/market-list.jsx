import {
  DataTable,
  DisplayChangePercent,
  DisplayTickValue,
  Loader,
  MarkFavourites,
  Tab,
  Tabs,
} from "Components";
import { ERROR_CODE, ERROR_MESSAGE } from "Constants/error-codes";
import { FAVOURITES, MARKET_TYPES } from "Constants/trade-config";
import {
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import {
  activeSymbols,
  fetchMarketTick,
  market_ticks,
  setBannerMessage,
  setMarketTicks,
  setSelectedTradeType,
} from "Stores";
import { checkWhenMarketOpens, generateTickData } from "Utils/format-value";
import { routes } from "Constants/routes";

import { forgetAll } from "Utils/socket-base";
import { getFavourites, isFavourites } from "Utils/map-markets";
import { segregateMarkets } from "Utils/map-markets";
import shared from "Styles/shared.module.scss";
import styles from "Styles/accordion.module.scss";
import throttle from "lodash.throttle";
import { useNavigate } from "@solidjs/router";
import { errorCatcher } from "Utils/error-handler";

const MarketList = () => {
  const header_config = [
    { title: "Name", ref: "display_name" },
    { title: "Change %", ref: "change", cell_content: DisplayChangePercent },
    { title: "Price", ref: "tick", cell_content: DisplayTickValue },
    { title: "", ref: "selected", cell_content: MarkFavourites },
  ];

  const default_tab = {
    title: "Favourites",
    ref: "favs",
  };

  const [all_markets, setAllMarkets] = createSignal([]);
  const [available_markets, setAvailableMarkets] = createSignal([]);
  const [market_data, setMarketData] = createSignal(null);
  const [active_tab, setActiveTab] = createSignal(0);
  const [watchlist, setWatchlist] = createSignal([]);
  const [already_subscribed, setAlreadySubscribed] = createSignal([]);

  const navigate = useNavigate();

  onMount(() => {
    setActiveTab(0);
    setWatchlist(getFavourites());
    getWatchList();
  });

  createEffect(() => {
    setAllMarkets(segregateMarkets(activeSymbols()));
  });

  onCleanup(() => {
    forgetAll("ticks");
  });

  const generateDataSet = () => {
    return available_markets().map((markets) => ({
      display_name: markets.display_name,
      change: markets.symbol,
      tick: markets.symbol,
      selected: watchlist().find((mkt) => mkt === markets.symbol),
    }));
  };

  const setTabList = (abvl_markets) => [
    default_tab,
    ...MARKET_TYPES.filter((type) =>
      Object.keys(abvl_markets).includes(type.ref)
    ),
  ];

  const marketDataHandler = async (response) => {
    try {
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
          const time_left = await checkWhenMarketOpens(0, echo_req.ticks);
          setMarketTicks({
            ...market_ticks(),
            [echo_req.ticks]: generateTickData({
              is_closed: true,
              opens_at: time_left,
            }),
          });
        }
      }
    } catch (error) {
      errorCatcher(response);
    }
  };

  const getMarketData = async (symbol_list) => {
    try {
      setMarketData(generateDataSet());
      const new_set = symbol_list.filter(
        (symbol) => !already_subscribed().includes(symbol)
      );
      if (new_set.length) {
        setAlreadySubscribed([...already_subscribed(), ...new_set]);
        new_set.forEach(
          async (symbol) =>
            await fetchMarketTick(symbol, throttle(marketDataHandler, 500))
        );
      }
    } catch (error) {
      setBannerMessage(error?.error?.message ?? ERROR_MESSAGE.general_error);
    }
  };

  const getAvailableMarkets = (market_type) =>
    setAvailableMarkets(all_markets()[market_type]);

  const fetchSelectedMarket = (tab_ref) => {
    const { id } = tab_ref;
    if (id === FAVOURITES) {
      getWatchList();
    } else {
      getAvailableMarkets(id);
      setMarketData(generateDataSet());
    }
  };

  const getWatchList = () => {
    const selected_markets = activeSymbols()?.filter((markets) =>
      watchlist().includes(markets.symbol)
    );
    setAvailableMarkets(selected_markets);
    getMarketData(watchlist());
  };

  const updateWatchlist = (symbol) => {
    const new_list = watchlist().includes(symbol)
      ? watchlist().filter((sym) => sym !== symbol)
      : [...watchlist(), symbol];
    localStorage.setItem("favourites", JSON.stringify(new_list));
    setWatchlist(new_list);
    if (active_tab() === 0) {
      getWatchList();
    }
  };

  const getTableHeaders = (ref) =>
    isFavourites(ref)
      ? header_config
      : header_config.filter((header) =>
          ["display_name", "selected"].includes(header.ref)
        );

  return (
    <>
      <h3 class={styles["title"]}>What would you like to trade with?</h3>
      <Show
        when={Object.keys(all_markets()).length}
        fallback={<Loader class={shared["spinner"]} type="2" />}
      >
        <Tabs
          onTabItemClick={(tab_ref) => {
            fetchSelectedMarket(tab_ref);
            setActiveTab(tab_ref.index);
          }}
          active_index={active_tab()}
          default_selected={default_tab.ref}
        >
          <For each={setTabList(all_markets())}>
            {(tabs) => (
              <Tab label={tabs.title} id={tabs.ref}>
                <Show when={isFavourites(tabs.ref) && !market_data()?.length}>
                  <p class={styles["add-favourites-message"]}>
                    To add to <strong>Favourites</strong>, swipe left at the
                    asset you like and hit the star.
                  </p>
                </Show>
                <Show when={market_data().length}>
                  <DataTable
                    headers={getTableHeaders(tabs.ref)}
                    data={market_data()}
                    show_header={true}
                    table_class={styles["market-list"]}
                    table_header_class={
                      isFavourites(tabs.ref)
                        ? styles["favorites-header"]
                        : styles["market-header"]
                    }
                    onRowClick={(trade_type) => {
                      setSelectedTradeType({
                        display_name: trade_type.display_name,
                        symbol: trade_type.tick,
                      });
                      navigate(routes.TRADE);
                    }}
                    config={{
                      ref: tabs.ref,
                      watchlist: watchlist(),
                      onAction: (data) => updateWatchlist(data),
                    }}
                  />
                </Show>
              </Tab>
            )}
          </For>
        </Tabs>
      </Show>
    </>
  );
};

export default MarketList;
