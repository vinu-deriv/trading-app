import styles from "../styles/error-component.module.scss";
import { onCleanup, Show } from "solid-js";
import { setErrorMessage } from "./../stores";
import { Button } from "./button";

const ErrorComponent = (props) => {
  onCleanup(() => {
    setErrorMessage(null);
  });
  return (
    <Show when={props.message}>
      <div class={styles["popup__div"]} onClick={() => setErrorMessage(null)}>
        <div class={styles["popup"]}>
          <Button type="secondrary" onClick={() => setErrorMessage(null)}>
            X
          </Button>
          <p class={styles["popup__text"]}>{props.message}</p>
        </div>
      </div>
    </Show>
  );
};
export default ErrorComponent;
