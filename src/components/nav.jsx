import styles from "../styles/navbar.module.scss";
import { loginUrl } from "Constants/deriv-urls";
import { login_information, logout } from "Stores/base-store";

const account_balance = 100000;

const Sidebar = () => {
  return (
    <ul class={styles.menu}>
      <li>Trade</li>
      <li>Report</li>
      {login_information.is_logged_in && <li onClick={logout}> Sign Out</li>}
    </ul>
  );
};

const NavBarHeader = () => {
  return (
    <>
      {login_information.is_logged_in ? (
        <button class={styles.account_info}>
          <div class={styles.account_wrapper}>
            {account_balance}
            <span>USD</span>
          </div>
          <i class={styles.arrow_down} />
        </button>
      ) : (
        <div
          onClick={() => (window.location.href = loginUrl({ language: "en" }))}
        >
          Log In
        </div>
      )}
    </>
  );
};

const NavBar = () => {
  return (
    <>
      <div id={styles.desktop}>
        <section class={styles.topnav_desktop}>
          <Sidebar />
          <NavBarHeader />
        </section>
      </div>

      <div id={styles.mobile}>
        <section class={styles.topnav_mobile}>
          <input id={styles.menu_toggle} type="checkbox" />
          <label class={styles.menu_button_container} for={styles.menu_toggle}>
            <div class={styles.menu_button} />
          </label>
          <Sidebar />
          <NavBarHeader />
        </section>
      </div>
    </>
  );
};

export default NavBar;
