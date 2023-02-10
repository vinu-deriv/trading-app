import { For } from "solid-js";
import styles from "Styles/dropdown-list.module.scss";

const DropdownList = (props) => {
  return (
    <div id="list-wrapper" class={styles["wrapper"]}>
      <For each={props.items}>
        {(item) => (
          <div
            class={styles["item"]}
            onClick={() => props.onClickDropdownItem(item)}
          >
            {item.text}
          </div>
        )}
      </For>
    </div>
  );
};
export default DropdownList;
