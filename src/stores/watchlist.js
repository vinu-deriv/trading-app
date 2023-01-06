import { createSignal } from "solid-js";

const [watch_list, setWatchList] = createSignal({}); // stores tick values for the selected market
const [prev_watch_list, setPrevWatchList] = createSignal({}); // stores previous tick values of the selected market
const [selected_markets, setSelectedMarkets] = createSignal([]); // stores data of the selected market
const [watch_list_ref, setWatchListRef] = createSignal({}); // stores tick ids

export {
  watch_list,
  setWatchList,
  selected_markets,
  setSelectedMarkets,
  prev_watch_list,
  setPrevWatchList,
  watch_list_ref,
  setWatchListRef,
};
