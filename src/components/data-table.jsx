/* eslint-disable no-console */
import { For, Show } from "solid-js";

import classNames from "classnames";
import styles from "../styles/data-table.module.scss";

const DataTable = (props) => {
  return (
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
              onDragStart={() => console.log("onDragStart")}
              onTouchMove={() => console.log("onTouchMove")}
              onTouchStart={() => console.log("onTouchStart")}
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
  );
};

export default DataTable;
