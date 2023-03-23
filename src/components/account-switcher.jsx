import { For, Show, createEffect, createSignal } from "solid-js";
import { authorize, sendRequest } from "Utils/socket-base";
import {
  balance_of_all_accounts,
  currencies_config,
  icons,
  login_information,
  logout,
  setLocalValues,
  setLoginInformation,
} from "Stores/base-store";
import { is_light_theme, setBannerMessage } from "Stores";

import Button from "./button";
import { ERROR_MESSAGE } from "Constants/error-codes";
import Loader from "./loader";
import { Portal } from "solid-js/web";
import { addComma } from "Utils/format-value";
import classNames from "classnames";
import { currency_config } from "Constants/currency";
import { deriv_urls } from "Constants/deriv-urls";
import { setshowAccountSwitcher } from "Stores/ui-store";
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
  const [has_reset_balance, setHasResetBalance] = createSignal(false);
  const [topup, setTopup] = createSignal(0);

  const is_balance_avbl = () =>
    Object.keys(balance_of_all_accounts()).length ?? null;
  createEffect(() => {
    const accounts = JSON.parse(login_information?.accounts);
    if (accounts) {
      setDemoAccounts(accounts.filter((acc) => acc.is_virtual === 1));
      setRealAccounts(accounts.filter((acc) => acc.is_virtual === 0));
    }

    if (balance_of_all_accounts()[demo_accounts()[0].loginid].balance == 10000)
      setHasResetBalance(false);
    else setHasResetBalance(true);
  });

  const doSwitch = async (loginid) => {
    if (loginid === login_information.active_loginid) return;
    else {
      const { token } = JSON.parse(login_information?.accounts).find(
        (account) => account.loginid === loginid
      );
      authorize(token).then((response) => {
        if (response?.error?.message) {
          logout();
        }
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

  const resetBalance = async (event) => {
    event.stopPropagation();
    let newbalance;
    const account = await JSON.parse(login_information.active_account);
    try {
      const response = await sendRequest({
        topup_virtual: 1,
      });
      const { amount } = response.topup_virtual;
      setTopup(amount);
    } catch (error) {
      setBannerMessage(error?.error?.message ?? ERROR_MESSAGE.general_error);
    }
    if (account.is_virtual === 1) {
      if (topup() != 0) {
        setTopup(0);
        newbalance = 10000;
        account.balance = newbalance;
      }
    }
  };

  const accountTopup = () => {
    Object.assign(document.createElement("a"), {
      target: "_blank",
      rel: "noopener noreferrer",
      href: deriv_urls.DERIV_APP,
    }).click();
    setshowAccountSwitcher(false);
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
            onClick={(event) => {
              event.stopPropagation();
              doSwitch(acc.loginid);
            }}
          >
            <div>
              <For each={icons}>
                {({ name, SvgComponent }) => {
                  const currency_icon = acc.is_virtual
                    ? "virtual"
                    : acc?.currency;

                  return (
                    name === currency_icon.toLowerCase() && (
                      <SvgComponent height="24" width="24" />
                    )
                  );
                }}
              </For>
            </div>
            <div class={styles["account_info"]}>
              <div>{getCurrencyDisplayCode(acc.currency)}</div>
              <div>{acc.loginid}</div>
            </div>
            <div class={styles["account_balance"]}>
              {acc.is_virtual == 1 ? (
                <div>
                  <span>
                    {addComma(
                      balance_of_all_accounts()[acc.loginid]?.balance,
                      currencies_config()[
                        balance_of_all_accounts()[acc.loginid]?.currency
                      ]?.fractional_digits
                    )}{" "}
                    {balance_of_all_accounts()[acc.loginid]?.currency}
                  </span>
                  {has_reset_balance() && (
                    <Button category="reset" onClick={resetBalance}>
                      {" "}
                      Reset Balance
                    </Button>
                  )}
                </div>
              ) : (
                <span>
                  {addComma(
                    balance_of_all_accounts()[acc.loginid]?.balance,
                    currencies_config()[
                      balance_of_all_accounts()[acc.loginid]?.currency
                    ]?.fractional_digits
                  )}{" "}
                  {balance_of_all_accounts()[acc.loginid]?.currency}
                </span>
              )}
            </div>
          </div>
        )}
      </For>
    </div>
  );

  return (
    <Portal>
      <div
        class={classNames(
          {
            "theme-light": is_light_theme(),
            "theme-dark": !is_light_theme(),
          },
          styles["dc-modal"]
        )}
      >
        <div class={styles["dc-modal__container"]}>
          <div class={styles["dc-modal-header"]}>
            <h3>Deriv Accounts</h3>
            <div
              class={styles["close"]}
              onClick={() => {
                setshowAccountSwitcher(false);
              }}
            />
          </div>
          <div class={styles["separator"]} />

          <Show when={is_balance_avbl()} fallback={<Loader />}>
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
            <div class={styles["redirect-btn"]}>
              <Button category="flat" onClick={accountTopup}>
                Topup Your Account
              </Button>
            </div>
          </Show>
        </div>
      </div>
    </Portal>
  );
};

export default AccountSwitcher;
