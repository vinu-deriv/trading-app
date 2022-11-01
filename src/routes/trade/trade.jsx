import Accordion from "../../components/market-type";
import styles from "./trade.module.scss";
import { createSignal, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { Show } from "solid-js";
import { sendRequest } from "Utils/socket-base";
import { getContractTypesConfig } from "Constants/trade-config";

const [is_stake, setIsStake] = createSignal(true);
const [slider_value, setSliderValue] = createSignal(1);
const [duration_unit, setDurationUnit] = createSignal("");
const [duration_value, setDurationValue] = createSignal(0);
const [amount, setAmountValue] = createSignal(0);
const [proposal_buy, setProposalBuy] = createStore({
  id: "",
  ask_price: "",
  payout: "",
});
const [proposal_sell, setProposalSell] = createStore({
  id: "",
  ask_price: "",
  payout: "",
});
const [proposal_error_message, setProposalErrorMessage] = createSignal();
const [buy_error_message, setBuyErrorMessage] = createSignal();

const getProposal = async (currency, symbol, trade_type) => {
  if (duration_unit()) {
    try {
      const response = await sendRequest({
        proposal: 1,
        amount: amount(),
        basis: is_stake() ? "stake" : "payout",
        contract_type: trade_type,
        currency, // to be taken while integration
        duration: duration_unit() === "t" ? slider_value() : duration_value(),
        duration_unit: duration_unit(),
        symbol,
      });

      return response.proposal;
    } catch (error) {
      if (!proposal_error_message())
        setProposalErrorMessage(error.error.message);
    }
  }
  return { id: "", ask_price: "", payout: "" };
};

const buyContract = async (is_buy) => {
  // TODO to be removed
  await sendRequest({
    authorize: "a1-YbzClveZPSFtXadVNm4Shgn6ZBRUf",
  });

  try {
    await sendRequest({
      buy: is_buy ? proposal_buy?.id : proposal_sell?.id,
      price: Number(amount()),
    });
  } catch (error) {
    setBuyErrorMessage(error.error.message);
  }
};

const buySellButtonWrapper = (proposal) => (
  <Show
    when={is_stake()}
    fallback={
      <span class={styles["buy-sell__stake-payout"]}>
        Stake:{" "}
        <span class={styles["buy-sell__stake-payout--strong"]}>
          {" "}
          {proposal.ask_price ? proposal.ask_price : 0}
        </span>
        <span>
          {"  "}(
          {(
            ((proposal.payout - proposal.ask_price || 0) * 100) /
            (proposal.ask_price || 1)
          ).toFixed(2)}
          )
        </span>
      </span>
    }
  >
    <span class={styles["buy-sell__stake-payout"]}>
      Payout:{" "}
      <span class={styles["buy-sell__stake-payout--strong"]}>
        {" "}
        {proposal.payout ? proposal.payout : 0}
      </span>
      <span>
        {"  "}(
        {(
          ((proposal.payout - proposal.ask_price || 0) * 100) /
          (proposal.ask_price || 1)
        ).toFixed(2)}
        )
      </span>
    </span>
  </Show>
);

const Trade = (props) => {
  //TODO get values from props
  const currency = "USD";
  const symbol = "R_100";
  const trade_type = "rise_fall";
  const trade_types = getContractTypesConfig()[`${trade_type}`].trade_types;

  createEffect(() => {
    setProposalBuy({ id: "", ask_price: "", payout: "" });
    setProposalSell({ id: "", ask_price: "", payout: "" });
    setProposalErrorMessage(null);
    setBuyErrorMessage(null);
    const getProposals = async () => {
      const { id, ask_price, payout } = await getProposal(
        currency,
        symbol,
        trade_types[0]
      );

      if (id) setProposalBuy({ id, ask_price, payout });

      const proposal_sell_local = await getProposal(
        currency,
        symbol,
        trade_types[1]
      );

      if (proposal_sell_local.id) setProposalSell(proposal_sell_local);
    };

    getProposals();
  });

  return (
    <div>
      <Accordion />
      <div class={styles["trading-layout"]}>
        <select
          class={styles["duration-dropdown"]}
          onChange={(event) => setDurationUnit(event.target.value)}
        >
          <option selected="true" disabled="disabled">
            Duration
          </option>
          <option value="t">Ticks</option>
          <option value="s">Seconds</option>
          <option value="m">Minutes</option>
          <option value="h">Hours</option>
          <option value="d">Days</option>
        </select>
        <Show
          when={duration_unit() === "t"}
          fallback={
            <input
              class={styles["duration__input"]}
              type="number"
              onInput={(e) => setDurationValue(Number(e.target.value))}
              value={duration_value()}
            />
          }
        >
          <div class={styles["slider"]}>
            <label for="fader">Tick </label>
            <input
              type="range"
              min="1"
              max="10"
              value={slider_value()}
              id="fader"
              name="fader"
              step="1"
              list="ticks"
              onChange={(event) => setSliderValue(Number(event.target.value))}
            />
            <datalist id="ticks">
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
              <option>9</option>
              <option>10</option>
            </datalist>
            <p>{slider_value()}</p>
          </div>
        </Show>
        <div class={`${styles["button"]} ${styles["stake-payout"]}`}>
          <button
            class={`${styles["stake-payout__button"]} ${
              is_stake() ? styles["stake-payout--selected"] : ""
            }`}
            onClick={() => setIsStake(true)}
          >
            Stake
          </button>
          <button
            class={`${styles["stake-payout__button"]} ${
              is_stake() ? "" : styles["stake-payout--selected"]
            }`}
            onClick={() => setIsStake(false)}
          >
            Payout
          </button>
        </div>

        <div class={styles["amount"]}>
          <input
            class={styles["amount__input"]}
            type="number"
            value={amount()}
            onInput={(e) => setAmountValue(Number(e.target.value))}
          />
          <p>USD</p>
        </div>

        <div class={`${styles["button"]} ${styles["buy-sell"]}`}>
          <div class={styles["buy-sell__buy-wrapper"]}>
            {buySellButtonWrapper(proposal_buy)}
            <button
              class={`${styles["buy-sell__buy"]} ${
                !proposal_buy.id ? styles["buy-sell__buy--disabled"] : ""
              }`}
              disabled={!proposal_buy.id}
              onClick={() => buyContract(true)}
            >
              Buy
            </button>
          </div>
          <div class={styles["buy-sell__sell-wrapper"]}>
            {buySellButtonWrapper(proposal_sell)}
            <button
              class={`${styles["buy-sell__sell"]} ${
                !proposal_sell.id ? styles["buy-sell__sell--disabled"] : ""
              }`}
              disabled={!proposal_sell.id}
              onClick={() => buyContract()}
            >
              Sell
            </button>
          </div>
        </div>
        <Show when={proposal_error_message()}>
          <span class={styles["error-message"]}>
            {proposal_error_message()}
          </span>
        </Show>
        <Show when={buy_error_message()}>
          <span class={styles["error-message"]}>{buy_error_message()}</span>
        </Show>
      </div>
    </div>
  );
};

export default Trade;
