import { createSignal, For, onMount, Show  } from "solid-js";
import classNames from "classnames";
import { activeSymbols, setStatements, statements } from "../stores";
import { login_information } from "../stores/base-store";
import Loader from "./loader";
import { getContractConfig, isHighLow } from "../utils/contract";
import { sendRequest } from "../utils/socket-base";
import { addComma } from "../utils/format-value";
import { getMarketInformation } from "../utils/map-markets";

import styles from "Styles/open-position.module.scss";

const Statements = () => {
  const [statement_count, setStatementCount] = createSignal(null);

  onMount(() => {
    const active_account = JSON.parse(login_information?.active_account);
    if (active_account) {
      sendRequest({
        statement: 1,
        description: 1,
        limit: 100,
        offset: 0,
      }).then((resp) => {
        const { transactions = [], count = 0 } = resp.statement;
        transactions.forEach((transaction) => {
          const shortcode = ["buy", "sell"].includes(transaction.action_type)
            ? transaction.shortcode
            : null;
          if (shortcode) {
            const { category, underlying } = getMarketInformation(shortcode);
            transaction.display_name = underlying
              ? getDisplayName(underlying, activeSymbols())
              : null;
            transaction.contract_type = getContractConfig(
              isHighLow({ shortcode })
            )[category.toUpperCase()];
          }
        });
        setStatements(transactions);
        setStatementCount(count);
      });
    }
  });

  const getDisplayName = (symbol, activeSymbols) => {
    if (symbol && activeSymbols.length) {
      const required_symbol = activeSymbols.find(
        (active_symbol) => active_symbol.symbol === symbol
      );
      if (required_symbol) {
        return required_symbol.display_name;
      }
    }
    return null;
  };

  return (
    <Show
      when={statement_count()}
      fallback={
        statement_count ? (
          <Loader class={styles["loader-position"]} />
        ) : (
          <div class={styles["no-list"]}>
            <div>You have not made any transactions.</div>
          </div>
        )
      }
    >
      <For each={statements()}>
        {(statement) => (
          <StatementItems
            action_type={statement.action_type}
            display_name={statement.display_name}
            contract_type={statement.contract_type}
            transaction_id={statement.transaction_id}
            contract_id={statement.contract_id}
            transaction_time={new Date(
              statement.transaction_time * 1000
            ).toLocaleString()}
            amount={statement.amount}
            balance_after={statement.balance_after}
            currency={JSON.parse(login_information?.active_account)?.currency}
          />
        )}
      </For>
    </Show>
  );
};

export default Statements;

const StatementItems = (props) => {
  return (
    <div class={classNames(styles["open-position"], styles["statement"])}>
      <div class={styles["market"]}>
        <strong>Market</strong>
        <div>{props.display_name}</div>
      </div>
      <div class={styles["trade-type"]}>
        <strong>Type</strong>
        <div>{props.contract_type}</div>
      </div>
      <div class={styles["trans-id"]}>
        <strong>Ref. Id</strong>
        <div>{props.transaction_id}</div>
      </div>
      <div class={styles["currency"]}>
        <div>
          <strong>Currency</strong>
          <div>{props.currency}</div>
        </div>
        <div
          class={classNames(styles["action"], {
            [styles.action]: props.action_type === "sell",
            [styles["action--buy"]]: props.action_type === "buy",
            [styles["action--hold"]]: props.action_type === "hold",
          })}
        >
          <strong>{props.action_type?.toUpperCase()}</strong>
        </div>
      </div>
      <div class={styles["date-time"]}>
        <strong>Transaction time</strong>
        <div>{props.transaction_time}</div>
      </div>
      <div class={styles["credit"]}>
        <strong>Credit/Debit</strong>
        <div
          class={classNames({
            [styles["profit-value"]]: Math.sign(props.amount) >= 0,
            [styles["loss-value"]]: Math.sign(props.amount) < 0,
          })}
        >
          {props.amount}
        </div>
      </div>
      <strong class={styles["balance--text"]}>Balance</strong>
      <div class={styles["balance--value"]}>
        {addComma(props.balance_after)}
      </div>
    </div>
  );
};
