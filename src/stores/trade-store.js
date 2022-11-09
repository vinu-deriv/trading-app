import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { sendRequest, authorize } from "../utils/socket-base";

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
const [buy_error_message, setBuyErrorMessage] = createSignal();
const [open_contract_ids, setOpenContractId] = createSignal([]);
const [open_contract_info, setOpenContractInfo] = createSignal({});
const [statements, setStatements] = createSignal([]);

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
    const response = await sendRequest({
      buy: id,
      price: Number(amount),
    });

    if (response?.buy) {
      setOpenContractId(response.buy.contract_id);
    }
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
  selectedTrade,
  setSelectedTrade,
  is_stake,
  setIsStake,
  symbol,
  setSymbol,
  trade_types,
  setTradeTypes,
  buy_error_message,
  setBuyErrorMessage,
  buyContract,
  open_contract_ids,
  setOpenContractId,
  open_contract_info,
  setOpenContractInfo,
  statements,
  setStatements,
};
