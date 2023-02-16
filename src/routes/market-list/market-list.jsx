import {
  DataTable,
  DisplayChangePercent,
  DisplayTickValue,
  Loader,
  Tab,
  Tabs,
} from "Components";
import { FAVOURITES, MARKET_TYPES } from "Constants/trade-config";
import {
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import classNames from "classnames";
import {
  activeSymbols,
  fetchMarketTick,
  market_ticks,
  setMarketTicks,
  setSelectedTradeType,
} from "Stores";
import {
  generateTickData,
  calculateTimeLeft,
  checkWhenMarketOpens,
} from "Utils/format-value";
import { forgetAll, wait } from "Utils/socket-base";
import { ERROR_CODE } from "Constants/error-codes";
import StarIcon from "Assets/svg/action/star.svg";
import TrashBinIcon from "Assets/svg/action/trash.svg";
import { getFavourites } from "Utils/map-markets";
import { segregateMarkets } from "Utils/map-markets";
import shared from "Styles/shared.module.scss";
import styles from "Styles/accordion.module.scss";
import throttle from "lodash.throttle";
import { useNavigate } from "solid-app-router";

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
  const [is_market_closed, setIsMarketClosed] = createSignal();
  const [watchlist, setWatchlist] = createSignal([]);

  const navigate = useNavigate();

  onMount(() => {
    setActiveTab(0);
    setIsMarketClosed(false);
    setWatchlist(getFavourites());
    getWatchList();
  });

  createEffect(() => {
    setAllMarkets(segregateMarkets(activeSymbols()));
  });

  onCleanup(() => {
    forgetAll("ticks");
    setMarketTicks({});
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

  const getMarketData = async (symbol_list) => {
    if (Object.keys(market_ticks()).length) {
      await forgetAll("ticks");
      await wait("forget_all");
    }

    setMarketData(generateDataSet());
    symbol_list.forEach(
      async (symbol) =>
        await fetchMarketTick(symbol, throttle(marketDataHandler, 500))
    );
  };

  const getAvailableMarkets = (market_type) =>
    setAvailableMarkets(all_markets()[market_type]);

  const fetchSelectedMarket = (tab_ref) => {
    setIsMarketClosed(false);
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
    const selected_markets = activeSymbols().filter((markets) =>
      watchlist().includes(markets.symbol)
    );
    setAvailableMarkets(selected_markets);
    getMarketData(watchlist());
  };

  const updateWatchlist = (row_data) => {
    const active_user = localStorage.getItem("userId") ?? "guest";
    const new_list = watchlist().includes(row_data.tick)
      ? watchlist().filter((sym) => sym !== row_data.tick)
      : [...watchlist(), row_data.tick];
    localStorage.setItem(`${active_user}-favourites`, JSON.stringify(new_list));
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
            setActiveTab(tab_ref.index);
            fetchSelectedMarket(tab_ref);
            setMarketTicks({});
          }}
          active_index={active_tab()}
          default_selected={default_tab.ref}
        >
          <For each={setTabList(all_markets())}>
            {(tabs) => (
              <Tab label={tabs.title} id={tabs.ref}>
                <Show when={tabs.ref === FAVOURITES && !market_data().length}>
                  <p class={styles["add-favourites-message"]}>
                    To add to <strong>Favourites</strong>, swipe left at the asset you like and
                    hit the star.
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
      onClick={() => props.onAction()}
      class={classNames(styles["action-cell"], {
        [styles.add]: !props.data.includes(props.selected),
        [styles.remove]: props.data.includes(props.selected),
      })}
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
        <TrashBinIcon
          id={`watch-icon-${props.index}`}
          stroke="white"
          height="24"
        />
      </Show>
    </div>
  );
};

export default MarketList;
