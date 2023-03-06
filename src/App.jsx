import { Route, Routes, useLocation, useNavigate } from "solid-app-router";
import { Show, createEffect, lazy, createSignal, onCleanup } from "solid-js";
import {
  activeSymbols,
  banner_message,
  fetchActiveSymbols,
  is_light_theme,
  showAccountSwitcher,
} from "./stores";
import { configureEndpoint, getAppId, getSocketUrl } from "./utils/config";
import { endpoint, init, login_information } from "Stores/base-store";
import {
  selected_markets,
  setBannerMessage,
  setSelectedMarkets,
} from "Stores/trade-store";
import { loginUrl } from "Constants/deriv-urls";
import { AccountSwitcher, EmptyView } from "./components";
import BannerComponent from "./components/banner-component";
import NavBar from "./components/nav";
import { Portal } from "solid-js/web";
import classNames from "classnames";
import { getFavourites } from "./utils/map-markets";
import { mapMarket } from "./utils/map-markets";
import monitorNetwork from "Utils/network-status";
import { onMount } from "solid-js";
import styles from "./App.module.scss";
import { banner_category } from "./constants/banner-category";
import { ERROR_CODE, ERROR_MESSAGE } from "Constants/error-codes";
import { setActionButtonValues } from "Stores/ui-store";

const Endpoint = lazy(() => import("Routes/endpoint"));
const MarketList = lazy(() => import("Routes/market-list"));
const Trade = lazy(() => import("Routes/trade/trade"));
const Reports = lazy(() => import("Routes/reports/reports"));

function App() {
  const { network_status } = monitorNetwork();
  const isSandbox = () => /dev$/.test(endpoint().server_url);
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [isViewSupported, setIsViewSupported] = createSignal(true);

  const handleWindowResize = () => {
    setIsViewSupported(window.innerWidth < 767);
  };

  const onClickHandler = () => navigate("/endpoint", { replace: true });

  const fetchActiveSymbolsHandler = async () => {
    try {
      await fetchActiveSymbols();
    } catch (error) {
      if (error?.error?.code === ERROR_CODE.invalid_app_id) {
        setBannerMessage(ERROR_MESSAGE.endpoint_redirect);
        setActionButtonValues({ text: "Set AppId", action: onClickHandler });
      } else {
        setBannerMessage(error?.error?.message ?? ERROR_MESSAGE.general_error);
      }
    }
  };

  onMount(async () => {
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
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
          <Route path="/" element={<MarketList />} />
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
      <Show when={!isViewSupported()}>
        <EmptyView />
      </Show>
    </div>
  );
}

export default App;
