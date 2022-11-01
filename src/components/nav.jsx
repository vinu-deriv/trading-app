import Logo from "../../src/assets/logo.png";
import styles from "../styles/navbar.module.scss";
import { loginUrl } from "Constants/deriv-urls";
import { login_information, logout } from "Stores/base-store";
import classNames from "classnames";
import { is_light_theme, setIsLightTheme } from "../stores";
import { isDesktop } from "Utils/responsive";
import { isMobile } from "../utils/responsive";

const account_balance = 100000;

const NavBar = () => {
  return (
    <section class={isDesktop() ? styles.topnav_desktop : styles.topnav_mobile}>
      {isMobile() && (
        <>
          <input id={styles.menu_toggle} type="checkbox" />
          <label class={styles.menu_button_container} for={styles.menu_toggle}>
            <div class={styles.menu_button} />
          </label>
        </>
      )}
      <ul class={styles.menu}>
        <li>Trade</li>
        <li>Report</li>
        {login_information.is_logged_in && <li onClick={logout}> Sign Out</li>}
        <li>
          <ThemeToggle />
        </li>
      </ul>
      <a href="#" class={styles.logo}>
        <img src={Logo} class={styles.logo} />
      </a>
      {login_information.is_logged_in ? (
        <button class={styles.account_info}>
          <div class={styles.account_wrapper}>
            {account_balance} USD
            <span>
              <i class={styles.arrow_down} />
            </span>
          </div>
        </button>
      ) : (
        <div
          onClick={() => (window.location.href = loginUrl({ language: "en" }))}
        >
          <b>Log In</b>
        </div>
      )}
    </section>
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
