import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { sendRequest, authorize } from "../utils/socket-base";

const [activeSymbols, setActiveSymbols] = createSignal([]);
const [selectedTradeType, setSelectedTradeType] = createSignal({});

const [is_stake, setIsStake] = createSignal(true);
const [symbol, setSymbol] = createSignal();
const [trade_types, setTradeTypes] = createStore({ trade_types: [] });
const [buy_error_message, setBuyErrorMessage] = createSignal();

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
    await authorize(token);
  } catch (error) {
    // To be changed once error component is ready
    setBuyErrorMessage(error.error.message);
  }

  try {
    await sendRequest({
      buy: id,
      price: Number(amount),
    });
  } catch (error) {
    setBuyErrorMessage(error.error.message);
  }
};

export {
  activeSymbols,
  setActiveSymbols,
  fetchActiveSymbols,
  selectedTradeType,
  setSelectedTradeType,
  is_stake,
  setIsStake,
  symbol,
  setSymbol,
  trade_types,
  setTradeTypes,
  buy_error_message,
  setBuyErrorMessage,
  buyContract,
};
