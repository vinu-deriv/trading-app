import { Match, Switch } from "solid-js";
import classNames from "classnames";
import styles from "../styles/loader.module.scss";

const Loader = (props) => (
  <Switch
    fallback={<div class={classNames(styles["loader-2"], props.class)} />}
  >
    <Match when={props.type === "1"}>
      <div class={classNames(styles["loader-1"], props.class)}>
        <span
          style={{
            width: props.size ?? "2rem",
            height: props.size ?? "2rem",
            "border-color": `transparent ${props.color ?? "var(--loader)"} ${
              props.color ?? "var(--loader)"
            }`,
          }}
        />
      </div>
    </Match>
    <Match when={props.type === "2"}>
      <div class={classNames(styles["loader-2"], props.class)} />
    </Match>
  </Switch>
);

export default Loader;
