import {
  authorize,
  sendRequest,
  subscribe,
  pingWebsocket,
} from "Utils/socket-base";
import { createSignal, lazy } from "solid-js";
/* eslint-disable no-console */
import { createStore } from "solid-js/store";
import { setErrorMessage } from "./trade-store";

export const [login_information, setLoginInformation] = createStore();
export const [endpoint, setEndpoint] = createSignal({
  app_id: "",
  server_url: "",
});
export const [balance_of_all_accounts, setBalanceOfAllAccounts] = createSignal(
  {}
);
export const [currencies_config, setCurrenciesConfig] = createSignal({});

const modules = import.meta.glob("../assets/svg/currency/*.svg", {
  as: "component-solid",
});

export const icons = Object.entries(modules).map(([key, value]) => {
  return {
    name: key.split("/").pop().split(".").shift(),
    SvgComponent: lazy(value),
  };
});

const getBalanceOfAllAccounts = (token) => {
  authorize(token)
    .then(() => {
      subscribe({ balance: 1, account: "all" }, (value) => {
        if (value.balance.accounts) {
          setBalanceOfAllAccounts(value.balance.accounts);
        } else {
          setBalanceOfAllAccounts({
            ...balance_of_all_accounts(),
            [value.balance.loginid]: {
              ...balance_of_all_accounts()[value.balance.loginid],
              balance: value.balance.balance,
            },
          });
        }
      });
    })
    .catch((err) => {
      setErrorMessage(err.message);
    });
};

const getWebsiteStatus = () => {
  sendRequest({ website_status: 1 }).then((response) => {
    if (!response.error) {
      setCurrenciesConfig(response.website_status?.currencies_config);
    }
  });
};

export const init = () => {
  const obj_params = {};
  const search = window.location.search;
  return new Promise((resolve, reject) => {
    try {
      pingWebsocket();
      if (search) {
        const search_params = new URLSearchParams(window.location.search);

        search_params.forEach((value, key) => {
          const account_keys = ["acct", "token", "cur"];
          const is_account_param = account_keys.some(
            (account_key) =>
              key?.includes(account_key) && key !== "affiliate_token"
          );

          if (is_account_param) {
            obj_params[key] = value;
          }
        });

        document.addEventListener("DOMContentLoaded", () => {
          history.replaceState(null, null, "/");
        });

        setLoginInformation({
          is_logging_in: true,
        });

        setEndpoint({
          app_id: localStorage.getItem("config.app_id"),
          server_url: localStorage.getItem("config.server_url"),
        });

        authorize(obj_params.token1).then((response) => {
          if (response?.error?.message) {
            logout();
          }
          if (!response?.error) {
            const { account_list, loginid, balance, user_id } =
              response.authorize;

            localStorage.setItem("userId", user_id);

            let i = 1;
            while (obj_params[`acct${i}`]) {
              const loginid = obj_params[`acct${i}`];
              const token = obj_params[`token${i}`];
              const active_account = account_list.find(
                (account) => account.loginid === loginid
              );

              if (active_account && token) active_account.token = token;

              i++;
            }
            getBalanceOfAllAccounts(obj_params.token1);
            setLoginInformation({
              accounts: JSON.stringify(account_list),
              active_loginid: loginid,
              is_logged_in: true,
              is_logging_in: false,
              active_account: JSON.stringify({
                balance,
                ...account_list.find((account) => account.loginid === loginid),
              }),
            });

            setLocalValues();
            getWebsiteStatus();
          }
          resolve();
        });
      } else {
        if (localStorage.getItem("active_account")) {
          const active_account = JSON.parse(
            localStorage.getItem("active_account")
          );
          getBalanceOfAllAccounts(active_account.token);
        }
        setLoginInformation({
          accounts: localStorage.getItem("accounts"),
          active_loginid: localStorage.getItem("active_loginid"),
          is_logged_in:
            localStorage.getItem("active_loginid") &&
            localStorage.getItem("accounts")
              ? true
              : false,
          active_account: localStorage.getItem("active_account"),
        });

        getWebsiteStatus();
        resolve();
      }
    } catch (err) {
      reject(err);
    }
  });
};

export const setLocalValues = () => {
  localStorage.setItem("accounts", login_information.accounts);
  localStorage.setItem("active_loginid", login_information.active_loginid);
  localStorage.setItem("active_account", login_information.active_account);
};

export const logout = () => {
  sendRequest({ logout: 1 }).then(() => {
    setLoginInformation({
      accounts: "",
      active_loginid: "",
      is_logged_in: false,
      active_account: "",
    });
    localStorage.removeItem("userId");
    setLocalValues();
    window.location.href = "/";
  });
};
