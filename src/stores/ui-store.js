import { createSignal } from "solid-js";

const [showAccountSwitcher, setshowAccountSwitcher] = createSignal(false);
const [swipe_direction, setSwipeDirection] = createSignal("");

export {
  showAccountSwitcher,
  setshowAccountSwitcher,
  swipe_direction,
  setSwipeDirection,
};
