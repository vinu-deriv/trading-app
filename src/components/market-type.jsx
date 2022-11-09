import styles from "../styles/accordion.module.scss";
import shared from "../styles/shared.module.scss";
import { createSignal, createEffect, Show, Index } from "solid-js";
import {
  activeSymbols,
  setSelectedTradeType,
  setSelectedMarkets,
  selectedMarkets,
  selectedTradeType,
  selectedTrade,
  setSelectedTrade,
  subscribe_id,
  setSubscribeId,
} from "../stores";
import classNames from "classnames";
import HeartIcon from "../assets/svg/heart.svg";
import TrashBinIcon from "../assets/svg/trash.svg";
import ActivityIcon from "../assets/svg/activity.svg";
import { SVGWrapper, Loader } from "../components";
import { sendRequest } from "../utils/socket-base";

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

  const [activeSection, setActiveSection] = createSignal([]);

  createEffect(() => {
    setMarkets(getMarketTypes(activeSymbols()));
    setMarketList(Object.keys(markets()));
  });

  const expand = (section, check) => {
    if (check === 0) {
      return;
    }
    if (activeSection().includes(section)) {
      setActiveSection(activeSection().filter((sect) => sect !== section));
    } else {
      setActiveSection([...activeSection(), section]);
    }
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
  };

  const addToWatchlist = (evnt, index) => {
    const is_trade_exisit = selectedMarkets().some(
      (trade) => trade.symbol === tradeList()[index].symbol
    );

    const storage_list = JSON.parse(localStorage.getItem("favourites") ?? "[]");
    if (is_trade_exisit) {
      setSelectedMarkets([
        ...selectedMarkets().filter(
          (trade) => trade.symbol !== tradeList()[index].symbol
        ),
      ]);
      const newList = storage_list.filter(
        (sym) => sym !== tradeList()[index].symbol
      );
      localStorage.setItem("favourites", JSON.stringify(newList));
    } else {
      setSelectedMarkets([...selectedMarkets(), tradeList()[index]]);
      localStorage.setItem(
        "favourites",
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
            [styles["active"]]: activeSection().includes("markets"),
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
            [styles["active"]]: activeSection().includes("submarkets"),
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
            [styles["active"]]: activeSection().includes("trades"),
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
                    <button
                      class={classNames(styles.button, styles["button--trade"])}
                      onClick={(evnt) => selectTrade(evnt, index)}
                      disabled={!tradeTypes().exchange_is_open}
                    >
                      <SVGWrapper
                        id={`trade-icon-${index}`}
                        icon={ActivityIcon}
                        stroke="green"
                      />
                      Open trade
                    </button>
                    <button
                      class={classNames(
                        styles.button,
                        styles["button--favourite"]
                      )}
                      onClick={(evnt) => addToWatchlist(evnt, index)}
                    >
                      <Show
                        when={selectedMarkets().find(
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
                    </button>
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
