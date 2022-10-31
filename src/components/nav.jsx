import Logo from "../../src/assets/favicon.ico";
import styles from "../styles/navbar.module.scss";
import { loginUrl } from "Constants/deriv-urls";
import { login_information, logout } from "Stores/base-store";
import classNames from "classnames";
import { is_light_theme, setIsLightTheme } from "../stores";

const account_balance = 100000;

const NavBar = () => {
  return (
    <>
      <div id={styles.desktop}>
        <section class={styles.topnav_desktop}>
          <a href="#" class={styles.logo}>
            <img src={Logo} class={styles.logo} />
          </a>
          <ul class={styles.menu}>
            <li>Trade</li>
            <li>Report</li>
            {login_information.is_logged_in ? (
              <li onClick={logout}> Sign Out</li>
            ) : (
              <li
                onClick={() =>
                  (window.location.href = loginUrl({ language: "en" }))
                }
              >
                Log In
              </li>
            )}
          </ul>
          <button class={styles.account_info}>
            <div class={styles.account_wrapper}>
              {account_balance}
              <span>USD</span>
            </div>
            <i class={styles.arrow_down} />
          </button>
        </section>
      </div>

      <div id={styles.mobile}>
        <section class={styles.topnav_mobile}>
          <input id={styles.menu_toggle} type="checkbox" />
          <label class={styles.menu_button_container} for={styles.menu_toggle}>
            <div class={styles.menu_button} />
          </label>
          <ul class={styles.menu}>
            <li>Trade</li>
            <li>Report</li>
            {login_information.is_logged_in ? (
              <li onClick={logout}> Sign Out</li>
            ) : (
              <li
                onClick={() =>
                  (window.location.href = loginUrl({ language: "en" }))
                }
              >
                Log In
              </li>
            )}
            <li>
              <ThemeToggle />
            </li>
          </ul>
          <a href="#" class={styles.logo}>
            <img src={Logo} class={styles.logo} />
          </a>
          <button class={styles.account_info}>
            <div class={styles.account_wrapper}>
              {account_balance}
              <span>USD</span>
            </div>
            <i class={styles.arrow_down} />
          </button>
        </section>
      </div>
    </>
  );
};

const toggleThemeHandler = (event) => {
  setIsLightTheme(event.target.checked);
};

const ThemeToggle = () => {
  return (
    <label class={styles["switch"]}>
      <input
        type={"checkbox"}
        checked={is_light_theme()}
        onChange={toggleThemeHandler}
      />
      <span class={classNames(styles["slider"], styles["round"])} />
    </label>
  );
};

export default NavBar;
