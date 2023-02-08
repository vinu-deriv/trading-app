import { Show, createSignal } from "solid-js";

import { DropdownList } from "Components";
import styles from "Styles/dropdown-component.module.scss";

const DropdownComponent = (props) => {
  const [showDropdownList, setShowDropdownList] = createSignal(false);

  const onClickDropdownItem = (item) => {
    props.onSelect(item);
    setShowDropdownList(false);
  };

  const onClickSelectMenu = () => setShowDropdownList((toggle) => !toggle);

  return (
    <div class={styles["container"]}>
      <div class={styles["input-wrapper"]}>
        <input
          placeholder={props.placeholder}
          class={styles["input"]}
          disabled={true}
          value={props.value}
        />
        <div class={styles["overlay"]} onClick={onClickSelectMenu} />
        <i class={styles["arrow-down"]} />
        <Show when={showDropdownList()}>
          <DropdownList
            items={props.list_items}
            onClickDropdownItem={onClickDropdownItem}
          />
        </Show>
      </div>
    </div>
  );
};
export default DropdownComponent;
