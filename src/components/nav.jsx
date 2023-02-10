import { Show, createSignal, onMount } from "solid-js";
import {
  balance_of_all_accounts,
  login_information,
  logout,
} from "Stores/base-store";
import { isDesktop, isMobile } from "Utils/responsive";
import { is_light_theme, setIsLightTheme } from "../stores";
import { Button } from "../components";
import Logo from "../../src/assets/logo2.png";
import { loginUrl } from "Constants/deriv-urls";
import { setshowAccountSwitcher } from "Stores/ui-store";
import styles from "../styles/navbar.module.scss";
import { useNavigate } from "solid-app-router";
import MoonIcon from "Assets/svg/action/moon.svg";
import SunIcon from "Assets/svg/action/sun.svg";

const NavBar = () => {
  const navigate = useNavigate();
  const current_acc_data = () => {
    const account = JSON.parse(login_information?.active_account);
    if (account) return balance_of_all_accounts()[account.loginid];

    logout();
  };

  const [checked, setChecked] = createSignal(false);

  const AccountHeader = () => {
    return (
      <Show
        when={login_information.is_logged_in && balance_of_all_accounts()}
        fallback={<>Waiting for Accounts</>}
      >
        <div class={styles.account_wrapper}>
          <span>
            {current_acc_data()?.balance} {current_acc_data()?.currency}
          </span>
          <i class={styles.arrow_down} />
        </div>
      </Show>
    );
  };

  return (
    <section
      id="app_navbar"
      class={isDesktop() ? styles.topnav_desktop : styles.topnav_mobile}
    >
      {isMobile() && (
        <>
          <input
            id={styles.menu_toggle}
            type="checkbox"
            checked={checked()}
            onClick={() => {
              setChecked(!checked());
            }}
          />
          <label class={styles.menu_button_container} for={styles.menu_toggle}>
            <div class={styles.menu_button} />
          </label>

        </>
      )}
      <ul class={styles.menu}>
        {isDesktop() && (
          <li>
            <a href="/" class={styles.logo}>
              <img src={Logo} class={styles.logo} />
            </a>
          </li>
        )}
        {
          isMobile() && checked() && (
            <li>
              <a href="/" class={styles.logo}>
                <img src={Logo} class={styles.logo} />
              </a>
            </li>
          )
        }
        <li
          onClick={() => {
            navigate("/trade", { replace: true });
            setChecked(false);
          }}
        >
          Trade
        </li>
        {login_information.is_logged_in && (
          <li
            onClick={() => {
              navigate("/reports", { replace: true });
              setChecked(false);
            }}
          >
            Report
          </li>
        )}

        {login_information.is_logged_in && <li onClick={logout}> Sign Out</li>}
      </ul>

      <div class={styles.theme}>
        <ThemeToggle />
        {login_information.is_logged_in ? (
          <Button
            category="secondary"
            onClick={() => setshowAccountSwitcher(true)}
          >
            <div class={styles.account_wrapper}>
              <AccountHeader />
            </div>
          </Button>
        ) : (
          !login_information.is_logging_in && (
            <div
              onClick={() =>
                (window.location.href = loginUrl({ language: "en" }))
              }
            >
              <b>Log In</b>
            </div>
          )
        )}
      </div>
    </section>
  );
};
const toggleThemeHandler = (event) => {
  setIsLightTheme(event.target.checked);
  localStorage.setItem("dark_theme", event.target.checked);
};

const ThemeToggle = () => {
  onMount(() => {
    const is_dark_theme = JSON.parse(localStorage.getItem("dark_theme"));
    setIsLightTheme(is_dark_theme ?? true);
  });

  return (
    <label class={styles["switch"]}>
      <input
        type={"checkbox"}
        checked={is_light_theme()}
        onChange={toggleThemeHandler}
      />
      {is_light_theme() ? <SunIcon height="40" width="50" />: <MoonIcon height="30" width="30" />}
    </label>


  );
};

export default NavBar;