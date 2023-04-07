import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";

const [showAccountSwitcher, setshowAccountSwitcher] = createSignal(false);
const [swipe_direction, setSwipeDirection] = createSignal("");
const [action_button_values, setActionButtonValues] = createStore({});
const [is_mobile_view, setIsMobileView] = createSignal(false);

export {
  showAccountSwitcher,
  setshowAccountSwitcher,
  swipe_direction,
  setSwipeDirection,
  action_button_values,
  setActionButtonValues,
  is_mobile_view,
  setIsMobileView,
};
