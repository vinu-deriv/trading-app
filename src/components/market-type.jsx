import styles from "../styles/accordion.module.scss";
import { Index } from "solid-js";
import { createSignal } from "solid-js";
import {
  activeSymbols,
  setSelectedTradeType,
  setSelectedMarkets,
  selectedMarkets,
} from "../stores";
import classNames from "classnames";
import HeartIcon from "../assets/svg/heart.svg";
import ActivityIcon from "../assets/svg/activity.svg";
import { SVGWrapper } from "../components";
import { createEffect } from "solid-js";

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
    setSubMarketList(Object.keys(markets()[market]));
    evnt.stopImmediatePropagation();
  };

  const getTradeTypes = (evnt, submarket) => {
    setTradeList(subMarket()[submarket]);
    evnt.stopImmediatePropagation();
  };

  const selectTrade = (evnt, index) => {
    setSelectedTradeType(tradeList()[index]);
    evnt.stopImmediatePropagation();
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
          <Index each={marketList()}>
            {(mkts, index) => (
              <div
                onClick={(evnt) => getSubmarkets(evnt, mkts())}
                class={styles["item-list"]}
              >
                {index + 1} - {mkts()}
              </div>
            )}
          </Index>
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
            {(subMkts, index) => (
              <div
                onClick={(evnt) => getTradeTypes(evnt, subMkts())}
                class={styles["item-list"]}
              >
                {index + 1} - {subMkts()}
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
                    <SVGWrapper
                      id={`heart-icon-${index}`}
                      icon={HeartIcon}
                      stroke="red"
                    />
                    Add to Watchlist
                  </button>
                </div>
              </div>
            )}
          </Index>
        </div>
      </div>
      <hr />
    </div>
  );
};

export default Accordion;
