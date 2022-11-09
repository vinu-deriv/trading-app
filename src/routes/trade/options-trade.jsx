import styles from "./trade.module.scss";
import { createSignal, createEffect } from "solid-js";
import { createStore } from "solid-js/store";
import { Show } from "solid-js";
import { sendRequest } from "Utils/socket-base";
import {
  selectedTradeType,
  is_stake,
  setIsStake,
  symbol,
  setSymbol,
  trade_types,
  buy_error_message,
  setBuyErrorMessage,
  buyContract,
} from "../../stores";
import { useNavigate } from "solid-app-router";
import classNames from "classnames";

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

const getProposal = async (currency, symbol, trade_type, is_option) => {
  if (duration_unit() && symbol && is_option) {
    try {
      const response = await sendRequest({
        proposal: 1,
        amount: amount(),
        basis: is_stake() ? "stake" : "payout",
        contract_type: trade_type,
        currency,
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

const OptionsTrade = () => {
  const navigate = useNavigate();
  const { currency, token } = JSON.parse(
    localStorage.getItem("active_account")
  );

  createEffect(() => {
    setSymbol(selectedTradeType().symbol);
    setProposalBuy({ id: "", ask_price: "", payout: "" });
    setProposalSell({ id: "", ask_price: "", payout: "" });
    setProposalErrorMessage(null);
    setBuyErrorMessage(null);
    if (trade_types.trade_types.length > 0) {
      const getProposals = async () => {
        const { id, ask_price, payout } = await getProposal(
          currency,
          symbol(),
          trade_types.trade_types[0],
          true
        );

        if (id) setProposalBuy({ id, ask_price, payout });

        const proposal_sell_local = await getProposal(
          currency,
          symbol(),
          trade_types.trade_types[1],
          true
        );

        if (proposal_sell_local.id) setProposalSell(proposal_sell_local);
      };

      getProposals();
    }
  });

  const handleBuyContractClicked = async (id) => {
    await buyContract(id, amount(), token);

    if (!buy_error_message()) navigate("/reports", { replace: true });
  };

  return (
    <Show when={symbol() && trade_types.trade_types.length}>
      <div class={styles["trading-layout"]}>
        <select
          class={styles["duration-dropdown"]}
          onChange={(event) => setDurationUnit(event.target.value)}
        >
          <option selected="true" disabled="disabled">
            Select Duration
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
        <div class={`${classNames(styles["button"], styles["stake-payout"])}`}>
          <button
            class={`${classNames(
              styles["stake-payout__button"],
              is_stake() ? styles["stake-payout--selected"] : ""
            )}`}
            onClick={() => setIsStake(true)}
          >
            Stake
          </button>
          <button
            class={`${classNames(
              styles["stake-payout__button"],
              is_stake() ? "" : styles["stake-payout--selected"]
            )}`}
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

        <div class={`${classNames(styles["button"], styles["buy-sell"])}`}>
          <div class={styles["buy-sell__buy-wrapper"]}>
            {buySellButtonWrapper(proposal_buy)}
            <button
              class={`${classNames(
                styles["buy-sell__buy"],
                !proposal_buy.id ? styles["buy-sell__buy--disabled"] : ""
              )}`}
              disabled={!proposal_buy.id}
              onClick={() => {
                handleBuyContractClicked(proposal_buy?.id);
              }}
            >
              {trade_types.title.split("/")[0]}
            </button>
          </div>
          <div class={styles["buy-sell__sell-wrapper"]}>
            {buySellButtonWrapper(proposal_sell)}
            <button
              class={`${classNames(
                styles["buy-sell__sell"],
                !proposal_sell.id ? styles["buy-sell__sell--disabled"] : ""
              )}`}
              disabled={!proposal_sell.id}
              onClick={() => handleBuyContractClicked(proposal_sell?.id)}
            >
              {trade_types.title.split("/")[1]}
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
    </Show>
  );
};

export default OptionsTrade;
