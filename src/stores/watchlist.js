import { createSignal } from "solid-js";

const [watchList, setWatchList] = createSignal({});
const [prevWatchList, setPrevWatchList] = createSignal({});
const [selectedMarkets, setSelectedMarkets] = createSignal([]);

export {
  watchList,
  setWatchList,
  selectedMarkets,
  setSelectedMarkets,
  prevWatchList,
  setPrevWatchList,
};
