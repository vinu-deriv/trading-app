import { For, Show, children, createSignal } from "solid-js";

import TabTitle from "./tab-title";
import styles from "./tabs.module.scss";

const toArray = (children) => (Array.isArray(children) ? children : [children]);

const Tabs = (props) => {
  const [selected_tab, setSelectedTab] = createSignal(0);
  const c = children(() => props.children);

  return (
    <div class={styles["tabs-container"]}>
      <div class={styles["tabs-container__header"]}>
        <ul>
          <For each={toArray(c())}>
            {(tab, index) => (
              <TabTitle
                active={index() === selected_tab()}
                index={index}
                label={tab.label}
                setSelectedTab={setSelectedTab}
              />
            )}
          </For>
        </ul>
      </div>
      <div class={styles["tabs-container__content"]}>
        <For each={toArray(c())}>
          {(tab, index) => (
            <Show when={index() === selected_tab()}>{tab.children}</Show>
          )}
        </For>
      </div>
    </div>
  );
};

export default Tabs;
