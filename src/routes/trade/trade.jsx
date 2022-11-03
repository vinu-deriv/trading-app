import Accordion from "../../components/market-type";
import styles from "./trade.module.scss";
import { For, Show } from "solid-js";
import { getContractTypesConfig } from "Constants/trade-config";
import { selectedTradeType, setTradeTypes } from "../../stores";
import OptionsTrade from "./options-trade";

const Trade = () => {
  return (
    <div class={styles["trade-flex-layout"]}>
      <div class={styles["trade-flex-layout__accordion"]}>
        <Accordion />
      </div>
      <div class={styles["trade-flex-layout__trade"]}>
        <section>
          <Show when={!selectedTradeType()?.symbol}>
            <p class={styles["error-message"]}>Select a Market to trade with</p>
          </Show>
        </section>
        <div class={styles["select-trade"]}>
          <select
            class={styles["trade-type-dropdown"]}
            onChange={(event) =>
              setTradeTypes(getContractTypesConfig()[`${event.target.value}`])
            }
          >
            <option selected="true" disabled="disabled">
              Select Trade Types
            </option>
            <For each={Object.keys(getContractTypesConfig())}>
              {(trade) => (
                <option value={trade}>
                  {getContractTypesConfig()[`${trade}`].title}
                </option>
              )}
            </For>
          </select>
          <Show when={selectedTradeType()?.symbol}>
            <p>
              Symbol : <b>{selectedTradeType()?.symbol}</b>
            </p>
          </Show>
        </div>
        <OptionsTrade />
      </div>
    </div>
  );
};

export default Trade;
