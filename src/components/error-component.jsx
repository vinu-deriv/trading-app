import styles from "../styles/error-component.module.scss";
import { onCleanup } from "solid-js";
import { setBuyErrorMessage } from "./../stores";

const ErrorComponent = ({ message }) => {
  onCleanup(() => {
    setBuyErrorMessage(null);
  });
  return (
    message && (
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
          <p class={styles["popup__text"]}>{message}</p>
        </div>
      </div>
    )
  );
};
export default ErrorComponent;
