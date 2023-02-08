import { onCleanup } from "solid-js";
import styles from "Styles/input-component.module.scss";

const InputComponent = (props) => {
  onCleanup(() => {
    props.onCleanup();
  });

  return (
    <input
      type={props.type}
      class={styles["input"]}
      placeholder={props.placeholder}
      value={props.value}
      onChange={props.onChange}
    />
  );
};

export default InputComponent;
