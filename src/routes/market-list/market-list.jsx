import {
  DataTable,
  DisplayChangePercent,
  DisplayTickValue,
  Loader,
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

import StarIcon from "Assets/svg/action/star.svg";
import classNames from "classnames";
import { forgetAll } from "Utils/socket-base";
import { getFavourites } from "Utils/map-markets";
import { segregateMarkets } from "Utils/map-markets";
import { setSwipeDirection } from "Stores/ui-store";
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
    }));
  };

  const fetchAvailableMarketSymbols = (market_type) => {
    const requiredMarkets = available_markets().filter(
      (market_data) => market_data.market === market_type
    );
    return requiredMarkets.map((market) => market.symbol);
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
      const symbol_list = fetchAvailableMarketSymbols(id);
      getMarketData(symbol_list);
    }
  };

  const getWatchList = () => {
    const selected_markets = activeSymbols()?.filter((markets) =>
      watchlist().includes(markets.symbol)
    );
    setAvailableMarkets(selected_markets);
    getMarketData(watchlist());
  };

  const updateWatchlist = (row_data) => {
    const new_list = watchlist().includes(row_data.tick)
      ? watchlist().filter((sym) => sym !== row_data.tick)
      : [...watchlist(), row_data.tick];
    localStorage.setItem("favourites", JSON.stringify(new_list));
    setWatchlist(new_list);
    if (active_tab() === 0) {
      getWatchList();
    }
  };

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
                <Show when={tabs.ref === FAVOURITES && !market_data()?.length}>
                  <p class={styles["add-favourites-message"]}>
                    To add to <strong>Favourites</strong>, swipe left at the
                    asset you like and hit the star.
                  </p>
                </Show>
                <Show when={market_data().length}>
                  <DataTable
                    headers={header_config}
                    data={market_data()}
                    show_header={true}
                    table_class={styles["market-list"]}
                    onRowClick={(trade_type) => {
                      setSelectedTradeType({
                        display_name: trade_type.display_name,
                        symbol: trade_type.tick,
                      });
                      navigate("/trade", { replace: true });
                    }}
                    config={{
                      watchlist: watchlist(),
                      action_component: MarketListAction,
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

const MarketListAction = (props) => {
  return (
    <div
      id="action"
      onClick={() => {
        setSwipeDirection("RIGHT");
        props.onAction();
      }}
      class={classNames(styles["action-cell"], [styles.add])}
    >
      <Show
        when={props.data.find((mkt) => mkt === props.selected)}
        fallback={
          <StarIcon
            height="24"
            stroke="white"
            id={`watch-icon-${props.index}`}
          />
        }
      >
        <StarIcon
          id={`watch-icon-${props.index}`}
          stroke="white"
          fill="white"
          height="24"
        />
      </Show>
    </div>
  );
};

export default MarketList;
