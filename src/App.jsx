import logo from "./logo.svg";
import styles from "./App.module.scss";
import Watchlist from "./components/watchlist";
import { init } from "./mocks/favourites";
import { For } from "solid-js";
import { selectedMarkets } from "./stores";

function App() {
  init();
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <p>
          Edit <code>src/App.jsx</code> and save to reload.
        </p>
        <a
          class={styles.link}
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Solids
        </a>
      </header>
      <br />
      <br />
      <For each={selectedMarkets()}>
        {(marketInfo) => (
          <Watchlist
            name={marketInfo.display_name}
            symbol={marketInfo.symbol}
            market={marketInfo.market_display_name}
            submarket={marketInfo.submarket_display_name}
          />
        )}
      </For>
      <br />
      <br />
    </div>
  );
}

export default App;
