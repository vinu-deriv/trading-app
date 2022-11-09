import { onMount, Show, For } from "solid-js";
import { subscribe, authorize } from "Utils/socket-base";
import { login_information } from "Stores/base-store";
import {
  open_contract_ids,
  setOpenContractId,
  open_contract_info,
  setOpenContractInfo,
} from "../stores";
import styles from "Styles/open-position.module.scss";
import { timePeriod } from "../utils/format-value";
import classNames from "classnames";

const getOpenContractInfo = (contract_id) => {
  subscribe(
    {
      proposal_open_contract: 1,
      subscribe: 1,
      contract_id,
    },
    (resp) => {
      const { proposal_open_contract } = resp;
      if (proposal_open_contract.is_expired) {
        const new_set = open_contract_ids().filter(
          (ctd_id) => proposal_open_contract.contract_id !== ctd_id
        );
        setOpenContractId(new_set);
        delete open_contract_info()[proposal_open_contract.contract_id];
        setOpenContractInfo({ ...open_contract_info() });
      } else {
        setOpenContractInfo({
          ...open_contract_info(),
          [proposal_open_contract.contract_id]: {
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
          },
        });
      }
    }
  );
};

const OpenPosition = () => {
  onMount(() => {
    const active_account = JSON.parse(login_information?.active_account);
    if (active_account) {
      authorize(active_account.token).then(() => {
        open_contract_ids().forEach((contract_id) =>
          getOpenContractInfo(contract_id)
        );
      });
    }
  });

  const is_open_contract_avbl = () =>
    Object.keys(open_contract_info()).length || null;

  return (
    <Show
      when={is_open_contract_avbl()}
      fallback={
        <div class={styles["no-list"]}>
          <div>There are no open contracts</div>
        </div>
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

const OpenPositionItem = (props) => {
  return (
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
};

const ExpiryTimer = (props) => {
  const contract_info = () => open_contract_info()[props.contract_id];
  const expiry_time = () =>
    timePeriod(contract_info().expiry_time_epoc * 1000, Date.now());

  return <div>{expiry_time()}</div>;
};

export default OpenPosition;
