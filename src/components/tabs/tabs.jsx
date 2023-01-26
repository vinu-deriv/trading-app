import { For, Show, children, createEffect, createSignal } from "solid-js";

import TabTitle from "./tab-title";
import styles from "./tabs.module.scss";

const toArray = (children) => (Array.isArray(children) ? children : [children]);

const Tabs = (props) => {
  const [selected_tab, setSelectedTab] = createSignal();
  const c = children(() => props.children);

  createEffect(() => {
    setSelectedTab(props.active_index ?? 0);
  });

  return (
    <div class={styles["tabs-container"]}>
      <div class={styles["tabs-container__header"]}>
        <ul>
          <For each={toArray(c())}>
            {(tab, index) => (
              <TabTitle
                active={index() === selected_tab()}
                index={index}
                id={tab.id}
                label={tab.label}
                setSelectedTab={setSelectedTab}
                onClick={props.onTabItemClick}
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
