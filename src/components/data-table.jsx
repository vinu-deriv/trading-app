import { For, Show } from "solid-js";
import classNames from "classnames";
import styles from "../styles/data-table.module.scss";
import { login_information } from "Stores/base-store";
import { setBannerMessage } from "Stores/trade-store";
import { ERROR_MESSAGE } from "Constants/error-codes";
import { isFavourites } from "Utils/map-markets";

const DataTable = (props) => {
  const handleRowClick = (cell_value) => {
    if (!login_information.is_logged_in) {
      setBannerMessage(ERROR_MESSAGE.login_error);
    } else {
      props.onRowClick(cell_value);
    }
  };

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
              <tr>
                <td>
                  <div
                    class={classNames(styles["data-layout"], {
                      [styles["data-layout--fav"]]: isFavourites(
                        props.config.ref
                      ),
                      [styles["data-layout--market"]]: !isFavourites(
                        props.config.ref
                      ),
                    })}
                    onClick={() => handleRowClick(cell_value)}
                  >
                    <For each={props.headers}>
                      {(header) =>
                        header.cell_content ? (
                          <div>
                            <header.cell_content
                              data={cell_value[header.ref]}
                              config={{
                                ...props.config,
                                symbol: cell_value.tick,
                              }}
                            />
                          </div>
                        ) : (
                          <div>{cell_value[header.ref]}</div>
                        )
                      }
                    </For>
                  </div>
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
