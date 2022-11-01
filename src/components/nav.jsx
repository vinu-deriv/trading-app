import Logo from "../../src/assets/favicon.ico";
import styles from "../styles/navbar.module.scss";
import { loginUrl } from "Constants/deriv-urls";
import { login_information, logout } from "Stores/base-store";
import { setshowAccountSwitcher } from "Stores/ui-store";

const NavBar = () => {
  const AccountHeader = () => (
    <>
      <div>{JSON.parse(login_information?.active_account)?.loginid}</div>
      <div>{JSON.parse(login_information?.active_account)?.balance}</div>
      <div>{JSON.parse(login_information?.active_account)?.currency}</div>
    </>
  );
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
          {login_information.is_logged_in && (
            <button
              class={styles.account_info}
              onClick={() => setshowAccountSwitcher(true)}
            >
              <div class={styles.account_wrapper}>
                <AccountHeader />
              </div>
              <i class={styles.arrow_down} />
            </button>
          )}
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
          </ul>
          <a href="#" class={styles.logo}>
            <img src={Logo} class={styles.logo} />
          </a>
          {login_information.is_logged_in && (
            <button
              class={styles.account_info}
              onClick={() => {
                setshowAccountSwitcher(true);
              }}
            >
              <div class={styles.account_wrapper}>
                <AccountHeader />
              </div>
              <i class={styles.arrow_down} />
            </button>
          )}
        </section>
      </div>
    </>
  );
};

export default NavBar;
