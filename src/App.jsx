import styles from "./App.module.scss";
import { Routes, Route } from "solid-app-router";
import { createEffect } from "solid-js";
import { loginUrl } from "Constants/deriv-urls";
import Endpoint from "Routes/endpoint";
import { endpoint, init, login_information, logout } from "Stores/base-store";
import monitorNetwork from "Utils/network-status";

function App() {
  const { network_status } = monitorNetwork();

  createEffect(() => {
    init();
  });

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        {login_information.is_logged_in ? (
          <div onClick={logout}>Sign Out</div>
        ) : (
          <div
            onClick={() =>
              (window.location.href = loginUrl({ language: "en" }))
            }
          >
            Log In
          </div>
        )}
      </header>
      <Routes>
        <Route element={<Endpoint />} path="/endpoint" />
      </Routes>
      <div class={styles.body}>
        {network_status.is_disconnected && (
          <div class={styles.disconnected}>Connection lost.</div>
        )}
      </div>
      <footer>
        {endpoint.server_url && (
          <div>
            The server <a href="/endpoint">endpoint</a> is
            <span>{endpoint.server_url}</span>
          </div>
        )}
      </footer>
    </div>
  );
}

export default App;
