import { createSignal } from "solid-js";

const [watchList, setWatchList] = createSignal({}); // stores tick values for the selected market
const [prevWatchList, setPrevWatchList] = createSignal({}); // stores previous tick values of the selected market
const [selectedMarkets, setSelectedMarkets] = createSignal([]); // stores data of the selected market
const [watchListRef, setWatchListRef] = createSignal({}); // stores tick ids

export {
  watchList,
  setWatchList,
  selectedMarkets,
  setSelectedMarkets,
  prevWatchList,
  setPrevWatchList,
  watchListRef,
  setWatchListRef,
};
