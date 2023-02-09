import { Show, createSignal } from "solid-js";

import { DropdownList } from "Components";
import styles from "Styles/dropdown-component.module.scss";

const DropdownComponent = (props) => {
  const [show_dropdown_list, setShowDropdownList] = createSignal(false);

  const onClickDropdownItem = (item) => {
    props.onSelect(item);
    setShowDropdownList(false);
  };

  const onClickSelectMenu = () => {
    setShowDropdownList((toggle) => !toggle);
  };

  document.addEventListener("click", (event) => {
    if (
      !document
        .getElementById(`dropdown-wrapper-${props.el_id}`)
        ?.contains(event.target)
    ) {
      setShowDropdownList(false);
    }
  });

  return (
    <div id={`dropdown-wrapper-${props.el_id}`} class={styles["input-wrapper"]}>
      <input
        placeholder={props.placeholder}
        class={styles["input"]}
        disabled={true}
        value={props.value}
      />
      <div class={styles["overlay"]} onClick={onClickSelectMenu} />
      <i class={styles["arrow-down"]} />
      <Show when={show_dropdown_list()}>
        <DropdownList
          items={props.list_items}
          onClickDropdownItem={onClickDropdownItem}
        />
      </Show>
    </div>
  );
};
export default DropdownComponent;
