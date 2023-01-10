import moment from "moment";
const LocalStore = window.localStorage;
import { isEmptyObject, getPropertyValue, isEmptyValue } from "./object";

export const SocketCache = (() => {
  const config = {
    // TODO add any response that needs to be stored
  };

  const storage_key = "ws_cache";

  let data_obj = {};

  const set = (key, response) => {
    const msg_type = response.msg_type;
    if (response.subscription) return;

    if (response.echo_req.end === "latest") return;

    if (!config[msg_type]) return;

    const cached_response = get(response.echo_req) || {};
    const cached_message = cached_response[msg_type];
    const new_message = response[msg_type];

    const has_error_or_missing = response.error;
    const has_new_value =
      cached_message &&
      isEmptyValue(cached_message) &&
      !isEmptyValue(new_message);
    const has_old_cache =
      cached_message &&
      isEmptyValue(new_message) &&
      !isEmptyValue(cached_message);
    const has_valid_cache =
      !isEmptyValue(cached_response) && !cached_response.error;

    if (
      (has_error_or_missing || has_new_value || has_old_cache) &&
      has_valid_cache
    ) {
      clear();
      return;
    }

    const expires = moment().add(config[msg_type].expire, "m").valueOf();

    if (!data_obj) data_obj = {};
    data_obj[key] = { value: response, expires, msg_type };
    LocalStore.setItem(storage_key, JSON.stringify(data_obj));
  };

  const reloadDataObj = () => {
    if (isEmptyObject(data_obj)) {
      data_obj = JSON.parse(LocalStore.getItem(storage_key) || "{}");
      if (isEmptyObject(data_obj)) return;
    }
  };

  const getData = (key) => getPropertyValue(data_obj, key) || {};

  const get = (key) => {
    reloadDataObj();

    const response_obj = getData(key);

    let response;
    if (moment().isBefore(response_obj.expires)) {
      response = response_obj.value;
    } else {
      remove(key);
    }

    return response;
  };

  const getByMsgType = (msg_type) => {
    reloadDataObj();

    const key = Object.keys(data_obj).find(
      (k) => getData(k).msg_type === msg_type
    );

    if (!key) return undefined;

    const response_obj = getData(key);

    let response;
    if (moment().isBefore(response_obj.expires)) {
      response = response_obj.value;
    } else {
      remove(key);
    }

    return response;
  };

  const has = (key) => {
    return !!get(key);
  };

  const remove = (key, should_match_all) => {
    if (should_match_all) {
      Object.keys(data_obj).forEach((data_key) => {
        if (data_key.indexOf(key) !== -1) {
          delete data_obj[data_key];
        }
      });
    } else if (data_obj && data_obj[key]) {
      delete data_obj[key];
    }
    LocalStore.setItem(storage_key, JSON.stringify(data_obj));
  };

  const clear = () => {
    LocalStore.removeItem(storage_key);
    data_obj = {};
  };

  return {
    set,
    get,
    getByMsgType,
    has,
    remove,
    clear,
  };
})();
