import styles from "./App.module.scss";
import { Routes, Route } from "solid-app-router";
import { createEffect } from "solid-js";
import { loginUrl } from "Constants/deriv-urls";
import Endpoint from "Routes/endpoint";
import { endpoint, init, login_information, logout } from "Stores/base-store";

function App() {
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
