import classNames from "classnames";
import styles from "./reports.module.scss";
import { OpenPosition, Statements } from "../../components";
import { Show, createSignal, onMount } from "solid-js";
import { redirectToLoggedOutUserToLogin } from "../../stores/base-store";

const Reports = () => {
  const [tab_index, setTabIndex] = createSignal(1);

  onMount(() => {
    redirectToLoggedOutUserToLogin();
  });
  return (
    <div class={classNames(styles["tabs"], styles["effect-3"])}>
      <input
        type="radio"
        class={styles["tab-1"]}
        name="tab-effect-3"
        checked="checked"
        onClick={() => setTabIndex(1)}
      />
      <span>Open position</span>

      <input
        type="radio"
        class={styles["tab-2"]}
        name="tab-effect-3"
        onClick={() => setTabIndex(2)}
      />
      <span>Statement</span>

      <div class={classNames(styles["line"], styles["ease"])} />
      <div class={styles["tab-content"]}>
        <section class={styles["tab-item-1"]}>
          <Show when={tab_index() === 1}>
            <OpenPosition />
          </Show>
        </section>
        <section class={styles["tab-item-2"]}>
          <Show when={tab_index() === 2}>
            <Statements />
          </Show>
        </section>
      </div>
    </div>
  );
};

export default Reports;
