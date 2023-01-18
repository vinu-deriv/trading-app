import classNames from "classnames";
import styles from "../styles/buttons.module.scss";

export const Button = (props) => {
  return (
    <button
      onClick={() => props.onClick()}
      type={props.type}
      disabled={props.is_disabled}
      class={`${classNames(styles.btn, {
        [styles.primary]: props.type === "primary",
        [styles.secondrary]: props.type === "secondrary",
        [styles.tertiary]: props.type === "tertiary",
        [styles.tertiary_light]: props.type === "teriary_light",
        [styles.flat]: props.type === "flat",
        [styles.trade]: props.type === "trade",
      })}`}
    >
      {props.children}
    </button>
  );
};
