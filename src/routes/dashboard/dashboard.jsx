import { Show, For } from "solid-js";
import { useNavigate } from "solid-app-router";
import Watchlist from "../../components/watchlist";
import { selectedMarkets } from "../../stores";
import styles from "../../styles/dashboard.module.scss";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Show
      when={selectedMarkets()}
      fallback={
        <div class={styles["no-list"]}>
          <div>You have not added anything to your Watchlist</div>
          <button
            class={styles["trade--button"]}
            onClick={() => navigate("/trade", { replace: true })}
          >
            {" "}
            Go to Trading
          </button>
        </div>
      }
    >
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
    </Show>
  );
};

export default Dashboard;
