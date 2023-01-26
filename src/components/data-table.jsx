import { For, Show, createEffect, createSignal } from "solid-js";
import classNames from "classnames";
import { detectTouch } from "../utils/responsive";
import styles from "../styles/data-table.module.scss";
import { swipe_direction } from "../stores/ui-store";

const DataTable = (props) => {
  const [active_index, setActiveIndex] = createSignal(null);

  createEffect(() => {
    if (swipe_direction() === "RIGHT") {
      setActiveIndex(null);
    }
  });

  return (
    <div style={{ position: "relative" }}>
      <table class={classNames(styles["data-table"], props.table_class)}>
        <Show when={props.title}>
          <caption class={styles.title}>{props.title}</caption>
        </Show>
        <Show when={props.show_header}>
          <thead class={classNames(props.table_header_class)}>
            <tr>
              <For each={props.headers}>
                {(header) => <th scope="col">{header.title}</th>}
              </For>
            </tr>
          </thead>
        </Show>
        <tbody class={classNames(styles["table-body"], props.table_body_class)}>
          <For each={props.data}>
            {(cell_value, index) => (
              <tr
                draggable="true"
                onTouchStart={() => setActiveIndex(index())}
                ref={(el) => detectTouch(el)}
              >
                <td>
                  <div
                    class={classNames(styles["data-layout"], {
                      [styles["slider--active"]]:
                        swipe_direction() === "LEFT" &&
                        index() === active_index(),
                    })}
                    onClick = {()=>props.onRowClick(cell_value)}
                  >
                    <For each={props.headers}>
                      {(header) =>
                        header.cell_content ? (
                          <div>
                            <header.cell_content
                              data={cell_value[header.ref]}
                            />
                          </div>
                        ) : (
                          <div>{cell_value[header.ref]}</div>
                        )
                      }
                    </For>
                  </div>
                  <props.config.action_component
                    data={props.config.watchlist}
                    selected={cell_value.tick}
                    index={index()}
                    onAction={() => props.config.onAction(cell_value)}
                  />
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
