import styles from "accordion.module.scsss";
import { Index } from "solid-js";
import { createEffect } from "solid-js";
import { createSignal } from "solid-js";
import { onMount } from "solid-js";
import { activeSymbols } from "../stores";

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
  const [submarketList, setSubMarketList] = createSignal([]);

  onMount(() => {
    setMarkets(getMarketTypes(activeSymbols()));
  });

  createEffect(() => {
    setMarketList(Object.keys(markets()));
  });

  const getSubmarkets = (market) =>
    setSubMarketList(Object.keys(markets()[market]));

  return (
    <div class={styles["accordion"]}>
      <Index each={marketList()}>
        {(market) => (
          <div class={styles["container"]}>
            <div
              class={styles["label"]}
              onClick={() => getSubmarkets(market())}
            >
              {market()}
            </div>
            <div class={styles["content"]}>
              <Index each={submarketList()}>
                {(marketData) => (
                  <div>{marketData().submarket_display_name}</div>
                )}
              </Index>
            </div>
          </div>
        )}
      </Index>
    </div>
  );
};

export default Accordion;
