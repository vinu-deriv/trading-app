import styles from "../styles/error-component.module.scss";
import { onCleanup, Show } from "solid-js";
import { setBuyErrorMessage } from "./../stores";

const ErrorComponent = (props) => {
  onCleanup(() => {
    setBuyErrorMessage(null);
  });
  return (
    <Show when={props.message}>
      <div
        class={styles["popup__div"]}
        onClick={() => setBuyErrorMessage(null)}
      >
        <div class={styles["popup"]}>
          <button
            class={styles["popup__button"]}
            onClick={() => setBuyErrorMessage(null)}
          >
            X
          </button>
          <p class={styles["popup__text"]}>{props.message}</p>
        </div>
      </div>
    </Show>
  );
};
export default ErrorComponent;
