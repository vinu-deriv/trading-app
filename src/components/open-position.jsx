import { For, Show, onCleanup, onMount } from "solid-js";
import { forgetAll, wait } from "../utils/socket-base";
import {
  open_contract_ids,
  open_contract_info,
  setBannerMessage,
  setOpenContractId,
  setOpenContractInfo,
} from "../stores";

import Loader from "./loader";
import classNames from "classnames";
import { login_information } from "Stores/base-store";
import styles from "Styles/open-position.module.scss";
import { subscribe } from "Utils/socket-base";
import throttle from "lodash.throttle";
import { timePeriod } from "../utils/format-value";
import { ERROR_MESSAGE } from "Constants/error-codes";

const formatActivePositionData = (proposal_open_contract) => ({
  type: proposal_open_contract.underlying,
  ref_id: proposal_open_contract.contract_id,
  buy_price: proposal_open_contract.buy_price,
  indicative_price: proposal_open_contract.bid_price,
  pay_limit: proposal_open_contract.payout,
  profit: proposal_open_contract.profit,
  purchase_time_epoc: proposal_open_contract.purchase_time,
  expiry_time_epoc: proposal_open_contract.date_expiry,
  has_expired: proposal_open_contract.is_expired,
  currency: proposal_open_contract.currency,
});

const filterActivePositions = (contract_info) => {
  if (!open_contract_ids().includes(contract_info.contract_id)) {
    setOpenContractId([...open_contract_ids(), contract_info.contract_id]);
  }
  if (contract_info.is_expired) {
    const new_set = open_contract_ids().filter(
      (ctd_id) => contract_info.contract_id !== ctd_id
    );
    setOpenContractId(new_set);
    delete open_contract_info()[contract_info.contract_id];
    setOpenContractInfo({ ...open_contract_info() });
  } else {
    setOpenContractInfo({
      ...open_contract_info(),
      [contract_info.contract_id]: formatActivePositionData(contract_info),
    });
  }
};

const getOpenContractsInfo = () => {
  subscribe(
    {
      proposal_open_contract: 1,
      subscribe: 1,
    },
    throttle((resp) => {
      const { proposal_open_contract } = resp;
      if (Object.keys(proposal_open_contract).length)
        filterActivePositions(proposal_open_contract);
    }, 500)
  );
};

const OpenPosition = () => {
  onMount(async () => {
    const active_account = JSON.parse(login_information?.active_account);
    try {
      if (active_account) {
        await wait("authorize");
        getOpenContractsInfo();
      }
    } catch (error) {
      setBannerMessage(error?.error?.message ?? ERROR_MESSAGE.general_error);
    }
  });

  onCleanup(() => {
    if (open_contract_ids().length) forgetAll("proposal_open_contract");
  });

  const is_open_contract_avbl = () =>
    Object.keys(open_contract_info()).length || null;

  return (
    <Show
      when={is_open_contract_avbl()}
      fallback={
        is_open_contract_avbl() ? (
          <Loader class={styles["loader-position"]} />
        ) : (
          <div class={styles["no-list"]}>
            <div>There are no open contracts.</div>
          </div>
        )
      }
    >
      <For each={open_contract_ids()}>
        {(contract_id) => (
          <OpenPositionItem
            type={open_contract_info()[contract_id]?.type}
            contract_id={contract_id}
            ref_id={open_contract_info()[contract_id]?.ref_id}
            buy_price={open_contract_info()[contract_id]?.buy_price}
            indicative_price={
              open_contract_info()[contract_id]?.indicative_price
            }
            pay_limit={open_contract_info()[contract_id]?.pay_limit}
            profit={open_contract_info()[contract_id]?.profit}
            currency={open_contract_info()[contract_id]?.currency}
          />
        )}
      </For>
    </Show>
  );
};

const OpenPositionItem = (props) => (
  <div class={styles["open-position"]}>
    <div class={classNames(styles["type"], styles["card-alignment"])}>
      <div>
        <strong>Type</strong>
      </div>
      <div>{props.type}</div>
    </div>
    <div class={styles["time"]}>
      <div>
        <strong>Expires in</strong>
      </div>
      <ExpiryTimer contract_id={props.contract_id} />
    </div>
    <div class={styles["ref-id"]}>
      <div>
        <strong>Ref: Id</strong>
      </div>
      <div>{props.ref_id}</div>
    </div>
    <div class={styles["currency"]}>
      <div>
        <strong>Currency</strong>
      </div>
      <div>{props.currency}</div>
    </div>
    <div class={styles["buy"]}>
      <div>
        <strong>Buy price</strong>
      </div>
      <div>{props.buy_price}</div>
    </div>
    <div class={styles["indicative"]}>
      <div>
        <strong>Indicative Price</strong>
      </div>
      <div>{props.indicative_price}</div>
    </div>
    <div class={styles["payout"]}>
      <div>
        <strong>Payout limit</strong>
      </div>
      <div>{props.pay_limit}</div>
    </div>
    <div class={styles["profit"]}>
      <div>
        <strong>Indicative profit/loss</strong>
      </div>
      <div
        class={classNames(styles["profit"], {
          [styles["profit-value"]]: Math.sign(props.profit) >= 0,
          [styles["loss-value"]]: Math.sign(props.profit) < 0,
        })}
      >
        {props.profit}
      </div>
    </div>
  </div>
);

const ExpiryTimer = (props) => {
  const contract_info = () => open_contract_info()[props.contract_id];
  const expiry_time = () =>
    timePeriod(contract_info()?.expiry_time_epoc * 1000, Date.now());
  return <div>{expiry_time}</div>;
};

export default OpenPosition;
