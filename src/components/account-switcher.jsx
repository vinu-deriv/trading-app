import { For } from "solid-js";
import { createEffect, createSignal } from "solid-js";
import {
  login_information,
  setLoginInformation,
  setLocalValues,
} from "Stores/base-store";
import { currency_config } from "Constants/currency";
import { Portal } from "solid-js/web";
import styles from "../styles/account-switcher.module.scss";
import { authorize, sendRequest } from "Utils/socket-base";

const getCurrencyDisplayCode = (currency = "") => {
  if (currency !== "eUSDT" && currency !== "tUSDT") {
    currency = currency.toUpperCase();
  }
  return currency_config[`${currency}`]?.name || currency;
};

const AccountSwitcher = () => {
  const [demo_accounts, setDemoAccounts] = createSignal([]);
  const [real_accounts, setRealAccounts] = createSignal([]);
  const [balance_of_all_accounts, setBalanceOfAllAccounts] = createSignal({});

  const getBalanceOfAllAccounts = async () => {
    authorize(login_information?.active_account?.token).then((response) => {
      sendRequest({ balance: 1, account: "all" }).then((value) => {
        setBalanceOfAllAccounts(value.balance.accounts);
      });
    });
  };
  createEffect(() => {
    const accounts = JSON.parse(login_information?.accounts);
    if (accounts) {
      setDemoAccounts(accounts.filter((acc) => acc.is_virtual === 1));
      setRealAccounts(accounts.filter((acc) => acc.is_virtual === 0));
      getBalanceOfAllAccounts();
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
        setLoginInformation({
          active_loginid: loginid,
          active_account: {
            balance,
            ...JSON.parse(localStorage.getItem("accounts")).find(
              (account) => account.loginid === loginid
            ),
          },
        });
        setLocalValues();
      });
    }
  };

  const AccountList = (props) => (
    <div class={styles["account_list"]}>
      <h5 class={styles["title"]}>{props.title}</h5>

      <For each={props.accounts}>
        {(acc) => (
          <div class={styles["account"]} onClick={() => doSwitch(acc.loginid)}>
            <div>
              <div>{getCurrencyDisplayCode(acc.currency)}</div>
              <div>{balance_of_all_accounts()[`${acc.loginid}`]?.balance}</div>
            </div>
            <div>{acc.loginid}</div>
          </div>
        )}
      </For>
    </div>
  );
  return (
    <Portal>
      <div class={styles["dc-modal__container"]}>
        <div class={styles["dc-modal-header"]}>
          <h3>Deriv Accounts</h3>
          <div class={styles["separator"]} />
        </div>
        {demo_accounts()?.length && (
          <AccountList title="Demo Account" accounts={demo_accounts()} />
        )}
        {real_accounts()?.length && (
          <AccountList
            title={
              real_accounts().length === 1 ? "Real Account" : "Real Accounts"
            }
            accounts={real_accounts()}
          />
        )}
      </div>
    </Portal>
  );
};

export default AccountSwitcher;
