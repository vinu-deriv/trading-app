import { Route, Routes, useLocation } from "@solidjs/router";
import {
  Show,
  createEffect,
  lazy,
  createSignal,
  onCleanup,
  ErrorBoundary,
} from "solid-js";
import {
  activeSymbols,
  banner_message,
  fetchActiveSymbols,
  is_light_theme,
  setIsMobileView,
  showAccountSwitcher,
} from "Stores";
import { configureEndpoint, getAppId, getSocketUrl } from "Utils/config";
import { endpoint, init, login_information } from "Stores/base-store";
import { selected_markets, setSelectedMarkets } from "Stores/trade-store";
import { loginUrl } from "Constants/deriv-urls";
import {
  AccountSwitcher,
  EmptyView,
  ErrorBoundaryComponent,
} from "./components";
import BannerComponent from "./components/banner-component";
import { MAX_MOBILE_WIDTH } from "Utils/responsive";
import NavBar from "./components/nav";
import { Portal } from "solid-js/web";
import { banner_category } from "./constants/banner-category";
import classNames from "classnames";
import { getFavourites } from "Utils/map-markets";
import { mapMarket } from "Utils/map-markets";
import monitorNetwork from "Utils/network-status";
import { onMount } from "solid-js";
import { RouteGuard } from "./routes/route-guard.jsx";
import styles from "./App.module.scss";

const Endpoint = lazy(() => import("Routes/endpoint"));
const MarketList = lazy(() => import("Routes/market-list"));
const Trade = lazy(() => import("Routes/trade/trade"));
const Reports = lazy(() => import("Routes/reports/reports"));

function App() {
  const { network_status } = monitorNetwork();
  const isSandbox = () => /dev$/.test(endpoint().server_url);
  const location = useLocation();
  const pathname = location.pathname;
  const [isViewSupported, setIsViewSupported] = createSignal(true);

  const handleWindowResize = () => {
    setIsViewSupported(window.innerWidth < MAX_MOBILE_WIDTH);
    setIsMobileView(isViewSupported());
  };

  const fetchActiveSymbolsHandler = async () => {
    await fetchActiveSymbols();
  };

  onMount(async () => {
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    // Remove lastpass iframe that prevents users from interacting with app
    const lastpass_iframe = document.querySelector("[data-lastpass-root]");
    if (lastpass_iframe) lastpass_iframe.remove();

    configureEndpoint(getAppId(), getSocketUrl());
    await fetchActiveSymbolsHandler();
    const map_market = mapMarket(activeSymbols());
    const getFavs = JSON.parse(localStorage.getItem("favourites"));
    if (getFavs?.length) {
      getFavs.forEach((marketSymbol) =>
        setSelectedMarkets([...selected_markets(), map_market[marketSymbol]])
      );
    }
  });

  createEffect(() => {
    init().then(async () => {
      if (pathname.match(/(trade|reports)/) && !login_information.is_logged_in)
        window.location.href = loginUrl({ language: "en" });
      await fetchActiveSymbolsHandler();
      const map_market = mapMarket(activeSymbols());
      const get_favs = getFavourites();
      if (get_favs?.length) {
        get_favs.forEach((marketSymbol) =>
          setSelectedMarkets([...selected_markets(), map_market[marketSymbol]])
        );
      }
    });
  });

  onCleanup(() => {
    window.removeEventListener("resize", handleWindowResize);
  });

  return (
    <div
      class={classNames(styles.App, {
        "theme-light": is_light_theme(),
        "theme-dark": !is_light_theme(),
      })}
    >
      <Show when={banner_message()}>
        <BannerComponent
          message={banner_message()}
          category={banner_category.ERROR}
          showCloseButton
        />
      </Show>
      <NavBar />
      <ErrorBoundary fallback={<ErrorBoundaryComponent />}>
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
            <Route path="/endpoint" component={Endpoint} />
            <Route path="/" component={RouteGuard}>
              <Route path="/home" component={MarketList} />
              <Route path="/trade" component={Trade} />
              <Route path="/reports" component={Reports} />
            </Route>
            <Route path="*" component={MarketList} />
          </Routes>
        </section>
      </ErrorBoundary>
      <footer>
        <Show when={isSandbox()} fallback={<div>Connected to Prod</div>}>
          <div>
            The server <a href="/endpoint">endpoint</a> is: &nbsp;
            <span>{endpoint().server_url}</span>
          </div>
        </Show>
      </footer>
      <Show when={!isViewSupported()}>
        <EmptyView />
      </Show>
    </div>
  );
}

export default App;
