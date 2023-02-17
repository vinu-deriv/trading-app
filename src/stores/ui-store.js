import { createSignal } from "solid-js";

const [showAccountSwitcher, setshowAccountSwitcher] = createSignal(false);
const [swipe_direction, setSwipeDirection] = createSignal("");
const [action, setAction] = createSignal(null);
const [button_text, setButtonText] = createSignal("Ok");

export {
  showAccountSwitcher,
  setshowAccountSwitcher,
  swipe_direction,
  setSwipeDirection,
  setAction,
  action,
  button_text,
  setButtonText,
};
