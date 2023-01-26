import classNames from "classnames";
import styles from "./tabs.module.scss";

const TabTitle = (props) => {
  return (
    <li
      class={classNames(styles["tab-title"], {
        [styles["tab-title--active"]]: props.active,
      })}
      onClick={() => {
        props.setSelectedTab(props.index);
        props.onClick?.({ index: props.index(), id: props.id });
      }}
    >
      {props.label}
    </li>
  );
};

export default TabTitle;
