import styles from "../styles/error-component.module.scss";
import { onCleanup, Show } from "solid-js";
import { setErrorMessage } from "./../stores";

const ErrorComponent = (props) => {
  onCleanup(() => {
    setErrorMessage(null);
  });
  return (
    <Show when={props.message}>
      <div
        class={styles["popup__div"]}
        onClick={() => setErrorMessage(null)}
      >
        <div class={styles["popup"]}>
          <button
            class={styles["popup__button"]}
            onClick={() => setErrorMessage(null)}
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
