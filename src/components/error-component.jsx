import { Show, onCleanup } from "solid-js";

import { Button } from "../components";
import { setErrorMessage } from "./../stores";
import styles from "../styles/error-component.module.scss";

const ErrorComponent = (props) => {
  onCleanup(() => {
    setErrorMessage(null);
  });
  return (
    <Show when={props.message}>
      <div class={styles["popup__div"]} onClick={() => setErrorMessage(null)}>
        <div class={styles["popup"]}>
          <Button category="secondary" onClick={() => setErrorMessage(null)}>
            X
          </Button>
          <p class={styles["popup__text"]}>{props.message}</p>
        </div>
      </div>
    </Show>
  );
};
export default ErrorComponent;
