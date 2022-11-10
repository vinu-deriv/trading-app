import { createSignal } from "solid-js";
import { onMount } from "solid-js";
import { setStatements, statements } from "../stores";
import { sendRequest, authorize } from "../utils/socket-base";
import styles from "Styles/open-position.module.scss";
import classNames from "classnames";
import { Show } from "solid-js";
import { For } from "solid-js";
import { addComma } from "../utils/format-value";
import { login_information } from "../stores/base-store";
import Loader from "./loader";

const Statements = () => {
  const [statement_count, setStatementCount] = createSignal(null);

  onMount(() => {
    const active_account = JSON.parse(login_information?.active_account);
    if (active_account) {
      authorize(active_account.token).then(() => {
        sendRequest({
          statement: 1,
          limit: 100,
          offset: 0,
        }).then((resp) => {
          const { transactions, count } = resp.statement;
          setStatements(transactions);
          setStatementCount(count);
        });
      });
    }
  });

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
          class={classNames(styles["type"], {
            [styles.action]: props.action_type !== "sell",
            [styles["action--buy"]]: props.action_type === "sell",
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
