import { Index, Show, createEffect, createSignal, onMount } from "solid-js";
import { Loader, SVGWrapper } from "../components";
import {
  activeSymbols,
  current_tick,
  fetchMarketTick,
  selectedTrade,
  selectedTradeType,
  selected_markets,
  setCurrentTick,
  setIsLoading,
  setPrevTick,
  setSelectedMarkets,
  setSelectedTrade,
  setSelectedTradeType,
  setSubscribeId,
  subscribe_id,
} from "../stores";
import { login_information } from "../stores/base-store";

import ActivityIcon from "../assets/svg/activity.svg";
import HeartIcon from "../assets/svg/heart.svg";
import TrashBinIcon from "../assets/svg/trash.svg";
import classNames from "classnames";
import shared from "../styles/shared.module.scss";
import styles from "../styles/accordion.module.scss";
import { Button } from "./button";

const generateData = (data_set = {}, prop, item) =>
  prop in data_set ? [...data_set[prop], item] : [item];

const getMarketTypes = (active_symbols) =>
  active_symbols.reduce((markets, symbol) => {
    return {
      ...markets,
      [symbol.market_display_name]: {
        ...(markets[symbol.market_display_name] || {}),
        [symbol.submarket_display_name]: generateData(
          markets[symbol.market_display_name],
          symbol.submarket_display_name,
          symbol
        ),
      },
    };
  }, {});

const Accordion = () => {
  const [markets, setMarkets] = createSignal({});
  const [marketList, setMarketList] = createSignal([]);

  const [subMarket, setSubMarket] = createSignal({});
  const [submarketList, setSubMarketList] = createSignal([]);

  const [tradeList, setTradeList] = createSignal([]);

  const [activeSection, setActiveSection] = createSignal("");

  createEffect(() => {
    setMarkets(getMarketTypes(activeSymbols()));
    setMarketList(Object.keys(markets()));
  });

  onMount(() => {
    if (Object.keys(selectedTradeType()).length) {
      getMarketData();
    }
  });

  const expand = (section, check) => {
    if (check === 0) {
      return;
    }
    setActiveSection(section);
  };

  const getSubmarkets = (evnt, market) => {
    setSubMarket(markets()[market]);
    setSelectedTrade({ ...selectedTrade(), market });
    setSubMarketList(Object.keys(markets()[market]));
    evnt.stopImmediatePropagation();
  };

  const getTradeTypes = (evnt, submarket) => {
    setTradeList(subMarket()[submarket]);
    setSelectedTrade({ ...selectedTrade(), sub_market: submarket });
    evnt.stopImmediatePropagation();
  };

  const selectTrade = (evnt, index) => {
    setSelectedTradeType(tradeList()[index]);
    evnt.stopImmediatePropagation();
    setSelectedTrade({
      ...selectedTrade(),
      trade_type: selectedTradeType().display_name,
    });
    getMarketData();
  };

  const getMarketData = async () => {
    if (subscribe_id()) {
      await subscribe_id().unsubscribe();
      setSubscribeId(null);
      fetchMarketTick(selectedTradeType()?.symbol, processTicks);
    } else {
      fetchMarketTick(selectedTradeType()?.symbol, processTicks);
    }
  };

  const processTicks = (resp) => {
    setIsLoading(false);
    const prev_value = current_tick();
    setPrevTick(prev_value);
    setTimeout(() => {
      setCurrentTick(resp.tick.quote);
    });
  };

  const addToWatchlist = (evnt, index) => {
    const is_trade_exisit = selected_markets().some(
      (trade) => trade.symbol === tradeList()[index].symbol
    );

    const active_user = localStorage.getItem("userId") ?? "guest";
    const storage_list = JSON.parse(
      localStorage.getItem(`${active_user}-favourites`) ?? "[]"
    );
    if (is_trade_exisit) {
      setSelectedMarkets([
        ...selected_markets().filter(
          (trade) => trade.symbol !== tradeList()[index].symbol
        ),
      ]);
      const newList = storage_list.filter(
        (sym) => sym !== tradeList()[index].symbol
      );
      const active_user = localStorage.setItem(
        `${active_user}-favourites`,
        JSON.stringify(newList)
      );
    } else {
      setSelectedMarkets([...selected_markets(), tradeList()[index]]);
      localStorage.setItem(
        `${active_user}-favourites`,
        JSON.stringify([...storage_list, tradeList()[index].symbol])
      );
    }
    evnt.stopImmediatePropagation();
  };

  return (
    <>
      <h3 class={styles["title"]}>What would you like to trade with?</h3>
      <div class={styles["accordion"]}>
        <hr />
        <div
          class={classNames(styles["container"], {
            [styles["active"]]: activeSection() === "markets",
          })}
          onClick={() => expand("markets", true)}
        >
          <div class={styles["label"]}>Markets</div>
          <div class={styles["content"]}>
            <Show
              when={marketList().length > 0}
              fallback={<Loader class={shared["loader-position"]} />}
            >
              <Index each={marketList()}>
                {(mkts) => (
                  <div
                    onClick={(evnt) => getSubmarkets(evnt, mkts())}
                    class={classNames(styles["item-list"], {
                      [styles["item-list--selected"]]:
                        mkts() === selectedTrade().market,
                    })}
                  >
                    {mkts()}
                  </div>
                )}
              </Index>
            </Show>
          </div>
        </div>
        <hr />
        <div
          class={classNames(styles["container"], {
            [styles["active"]]: activeSection() === "submarkets",
            [styles["disabled"]]: !submarketList().length,
          })}
          onClick={() => expand("submarkets", submarketList().length)}
        >
          <div class={styles["label"]}>Submarkets</div>
          <div class={styles["content"]}>
            <Index each={submarketList()}>
              {(subMkts) => (
                <div
                  onClick={(evnt) => getTradeTypes(evnt, subMkts())}
                  class={classNames(styles["item-list"], {
                    [styles["item-list--selected"]]:
                      subMkts() === selectedTrade().sub_market,
                  })}
                >
                  {subMkts()}
                </div>
              )}
            </Index>
          </div>
        </div>
        <hr />
        <div
          class={classNames(styles["container"], {
            [styles["active"]]: activeSection() === "trades",
            [styles["disabled"]]: !tradeList().length,
          })}
          onClick={() => expand("trades", tradeList().length)}
        >
          <div class={styles["label"]}>Trade types</div>
          <div class={styles["content"]}>
            <Index each={tradeList()}>
              {(tradeTypes, index) => (
                <div class={styles["item-list"]}>
                  <div class={styles["market-title"]}>
                    <span>{tradeTypes().display_name}</span>
                    {Boolean(!tradeTypes().exchange_is_open) && (
                      <span class={styles.closed}>CLOSED</span>
                    )}
                  </div>
                  <div class={styles.action}>
                    <Button
                      type="trade"
                      onClick={(evnt) => selectTrade(evnt, index)}
                      disabled={
                        !tradeTypes().exchange_is_open ||
                        !login_information.is_logged_in
                      }
                    >
                      <SVGWrapper
                        id={`trade-icon-${index}`}
                        icon={ActivityIcon}
                        stroke="green"
                      />
                      Open trade
                    </Button>
                    <Button
                      type="teriary_light"
                      onClick={(evnt) => addToWatchlist(evnt, index)}
                    >
                      <Show
                        when={selected_markets().find(
                          (mkt) => mkt.symbol === tradeList()[index].symbol
                        )}
                        fallback={
                          <>
                            <SVGWrapper
                              id={`watch-icon-${index}`}
                              icon={HeartIcon}
                              stroke="red"
                            />
                            <span>Add to Watchlist</span>
                          </>
                        }
                      >
                        <>
                          <SVGWrapper
                            id={`watch-icon-${index}`}
                            icon={TrashBinIcon}
                            stroke="red"
                          />
                          <span>Remove from Watchlist</span>
                        </>
                      </Show>
                    </Button>
                  </div>
                </div>
              )}
            </Index>
          </div>
        </div>
        <hr />
      </div>
    </>
  );
};

export default Accordion;
