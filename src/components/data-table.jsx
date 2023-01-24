/* eslint-disable no-console */
import { For, Show } from "solid-js";

import classNames from "classnames";
import styles from "../styles/data-table.module.scss";

const DataTable = (props) => {
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
            {(cell_value) => (
              <tr
                draggable="true"
                onDragCapture={() => console.log("onDragStart")}
                onTouchMove={(evnt) => console.log("onTouchMove: ", evnt)}
                style={{ border: "solid 1px black" }}
              >
                <For each={props.headers}>
                  {(header) =>
                    header.cell_content ? (
                      <td>
                        <header.cell_content data={cell_value[header.ref]} />
                      </td>
                    ) : (
                      <td>{cell_value[header.ref]}</td>
                    )
                  }
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>

      <table
        class={classNames(
          styles["data-table"],
          styles["action-table"],
          props.table_class
        )}
      >
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
            {(cell_value) => (
              <tr style={{ border: "solid 1px black" }}>
                <For each={props.headers}>
                  {(header, index) => (
                    <td>
                      <props.config.action_component
                        data={props.config.watchlist}
                        selected={cell_value.tick}
                        index={index()}
                        onAction={() => props.config.onAction(cell_value)}
                      />
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
