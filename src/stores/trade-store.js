import { sendRequest, subscribe } from "../utils/socket-base";

import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";

const [activeSymbols, setActiveSymbols] = createSignal([]);
const [selectedTradeType, setSelectedTradeType] = createSignal({});
const [selectedTrade, setSelectedTrade] = createSignal({
  market: "",
  sub_market: "",
  trade_type: "",
});

const [is_stake, setIsStake] = createSignal(true);
const [symbol, setSymbol] = createSignal();
const [trade_types, setTradeTypes] = createStore({ trade_types: [] });
const [banner_message, setBannerMessage] = createSignal();
const [open_contract_ids, setOpenContractId] = createSignal([]);
const [open_contract_info, setOpenContractInfo] = createSignal({});
const [statements, setStatements] = createSignal([]);
const [is_loading, setIsLoading] = createSignal(false);
const [market_ticks, setMarketTicks] = createSignal({});
const [selected_markets, setSelectedMarkets] = createSignal([]);

const fetchActiveSymbols = async () => {
  try {
    const response = await sendRequest({
      active_symbols: "brief",
      product_type: "basic",
    });
    setActiveSymbols(response.active_symbols);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log("error:", err);
  }
};

const buyContract = async (id, amount, token) => {
  try {
    const response = await sendRequest({
      buy: id,
      price: Number(amount),
    });

    if (response?.buy) {
      setOpenContractId([...open_contract_ids(), response.buy.contract_id]);
    }
  } catch (error) {
    setBannerMessage(error.error.message);
  }
};

const fetchMarketTick = (symbol, marketTickHandler) => {
  const market_tick_subscription_ref = subscribe(
    {
      ticks: symbol,
      subscribe: 1,
    },
    marketTickHandler
  );
  return market_tick_subscription_ref;
};

const getTradeTimings = async (date_string) => {
  const data = await sendRequest({ trading_times: date_string });
  if (data.error) {
    return { api_initial_load_error: data.error.message };
  }
  return data;
};

export {
  activeSymbols,
  setActiveSymbols,
  fetchActiveSymbols,
  selectedTradeType,
  setSelectedTradeType,
  selectedTrade,
  setSelectedTrade,
  is_stake,
  setIsStake,
  symbol,
  setSymbol,
  trade_types,
  setTradeTypes,
  banner_message,
  setBannerMessage,
  buyContract,
  open_contract_ids,
  setOpenContractId,
  open_contract_info,
  setOpenContractInfo,
  statements,
  setStatements,
  fetchMarketTick,
  is_loading,
  setIsLoading,
  market_ticks,
  setMarketTicks,
  getTradeTimings,
  selected_markets,
  setSelectedMarkets,
};
