import { createEffect, createSignal, For, Show } from "solid-js";
import classNames from "classnames";
import {
  login_information,
  setLoginInformation,
  setLocalValues,
  balance_of_all_accounts,
} from "Stores/base-store";
import { currency_config } from "Constants/currency";
import { Portal } from "solid-js/web";
import { authorize } from "Utils/socket-base";
import { setshowAccountSwitcher } from "Stores/ui-store";
import Loader from "./loader";
import styles from "../styles/account-switcher.module.scss";

const getCurrencyDisplayCode = (currency = "") => {
  if (currency !== "eUSDT" && currency !== "tUSDT") {
    currency = currency.toUpperCase();
  }
  return currency_config[`${currency}`]?.name || currency;
};

const AccountSwitcher = () => {
  const [demo_accounts, setDemoAccounts] = createSignal([]);
  const [real_accounts, setRealAccounts] = createSignal([]);

  const is_balance_avbl = () =>
    Object.keys(balance_of_all_accounts()).length ?? null;

  createEffect(() => {
    const accounts = JSON.parse(login_information?.accounts);
    if (accounts) {
      setDemoAccounts(accounts.filter((acc) => acc.is_virtual === 1));
      setRealAccounts(accounts.filter((acc) => acc.is_virtual === 0));
    }
  });

  const doSwitch = async (loginid) => {
    if (loginid === login_information.active_loginid) return;
    else {
      const { token } = JSON.parse(login_information?.accounts).find(
        (account) => account.loginid === loginid
      );
      authorize(token).then((response) => {
        const { loginid, balance } = response.authorize;
        const active_acc = {
          balance,
          ...JSON.parse(localStorage.getItem("accounts")).find(
            (account) => account.loginid === loginid
          ),
        };
        setLoginInformation({
          active_loginid: loginid,
          active_account: JSON.stringify(active_acc),
        });
        setLocalValues();
        setshowAccountSwitcher(false);
      });
    }
  };

  const AccountList = (props) => (
    <div class={styles["account_list"]}>
      <h5 class={styles["title"]}>{props.title}</h5>

      <For each={props.accounts}>
        {(acc) => (
          <div
            class={classNames(styles["account"], {
              [styles["selected"]]:
                acc.loginid === login_information.active_loginid,
            })}
            onClick={() => doSwitch(acc.loginid)}
          >
            <div class={styles["account_info"]}>
              <div>{getCurrencyDisplayCode(acc.currency)}</div>
              <div>{acc.loginid}</div>
            </div>
            <div class={styles["account_balance"]}>
              <span>
                {balance_of_all_accounts()[`${acc.loginid}`]?.balance}{" "}
                {balance_of_all_accounts()[`${acc.loginid}`]?.currency}
              </span>
            </div>
          </div>
        )}
      </For>
    </div>
  );

  return (
    <Portal>
      <div class={styles["dc-modal"]}>
        <div class={styles["dc-modal__container"]}>
          <div class={styles["dc-modal-header"]}>
            <h3>Deriv Accounts</h3>
            <div
              class={styles["close"]}
              onClick={() => {
                setshowAccountSwitcher(false);
              }}
            />
            <div class={styles["separator"]} />
          </div>

          <Show when={is_balance_avbl()} fallback={<Loader />}>
            <>
              {demo_accounts()?.length && (
                <AccountList title="Demo Account" accounts={demo_accounts()} />
              )}
              {real_accounts()?.length && (
                <AccountList
                  title={
                    real_accounts().length === 1
                      ? "Real Account"
                      : "Real Accounts"
                  }
                  accounts={real_accounts()}
                />
              )}
            </>
          </Show>
        </div>
      </div>
    </Portal>
  );
};

export default AccountSwitcher;
