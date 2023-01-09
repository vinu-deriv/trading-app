import { Route, Routes } from "solid-app-router";
import { Show, createEffect, lazy } from "solid-js";
import {
  activeSymbols,
  error_message,
  fetchActiveSymbols,
  is_light_theme,
  selectedMarkets,
  setSelectedMarkets,
  showAccountSwitcher,
  watchListRef,
} from "./stores";
import { configureEndpoint, getAppId, getSocketUrl } from "./utils/config";
import { endpoint, init } from "Stores/base-store";

import { AccountSwitcher } from "./components";
import ErrorComponent from "./components/error-component";
import NavBar from "./components/nav";
import { Portal } from "solid-js/web";
import classNames from "classnames";
import { mapMarket } from "./utils/map-markets";
import monitorNetwork from "Utils/network-status";
import { onCleanup } from "solid-js";
import { onMount } from "solid-js";
import { sendRequest } from "./utils/socket-base";
import styles from "./App.module.scss";

const Endpoint = lazy(() => import("Routes/endpoint"));
const Dashboard = lazy(() => import("Routes/dashboard/dashboard"));
const Trade = lazy(() => import("Routes/trade/trade"));
const Reports = lazy(() => import("Routes/reports/reports"));

function App() {
  const { network_status } = monitorNetwork();
  const isSandbox = () => /dev$/.test(endpoint().server_url);

  onMount(async () => {
    configureEndpoint(getAppId(), getSocketUrl());
    await fetchActiveSymbols();
    const map_market = mapMarket(activeSymbols());
    const getFavs = JSON.parse(localStorage.getItem("favourites"));
    if (getFavs?.length) {
      getFavs.forEach((marketSymbol) =>
        setSelectedMarkets([...selectedMarkets(), map_market[marketSymbol]])
      );
    }
  });

  createEffect(() => {
    init();
  });

  onCleanup(() => {
    Object.values(watchListRef()).forEach((symbol) =>
      sendRequest({ forget: watchListRef()[symbol] })
    );
  });

  return (
    <div
      class={classNames(styles.App, {
        "theme-light": is_light_theme(),
        "theme-dark": !is_light_theme(),
      })}
    >
      <Show when={error_message()}>
        <ErrorComponent message={error_message()} />
      </Show>
      <NavBar />
      <section
        class={classNames(styles.content, {
          [styles["is-acc-switcher-open"]]: showAccountSwitcher(),
        })}
      >
        <Portal>
          {network_status.is_disconnected && (
            <div class={styles.banner}>
              <div class={styles.caret} />
              <div class={styles.disconnected}>You seem to be offline.</div>
            </div>
          )}
        </Portal>
        {showAccountSwitcher() && <AccountSwitcher />}
        <Routes>
          <Route element={<Endpoint />} path="/endpoint" />
          <Route path="/" element={<Dashboard />} />
          <Route path="/trade" element={<Trade />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </section>
      <footer>
        <Show when={isSandbox()} fallback={<div>Connected to Prod</div>}>
          <div>
            The server <a href="/endpoint">endpoint</a> is: &nbsp;
            <span>{endpoint().server_url}</span>
          </div>
        </Show>
      </footer>
    </div>
  );
}

export default App;
