import { createSignal } from "solid-js";
import { sendRequest } from "../utils/socket-base";

const [activeSymbols, setActiveSymbols] = createSignal([]);
const [selectedTradeType, setSelectedTradeType] = createSignal({});

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

export {
  activeSymbols,
  setActiveSymbols,
  fetchActiveSymbols,
  selectedTradeType,
  setSelectedTradeType,
};
