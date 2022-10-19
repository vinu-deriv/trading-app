// Simulates favourites added by user

import { sendRequest, subscribe } from "../utils/socket-base";
import {
  prevWatchList,
  selectedMarkets,
  setPrevWatchList,
  setSelectedMarkets,
  setWatchList,
  setWatchListRef,
  watchList,
  watchListRef,
} from "../stores";

const init = async () => {
  localStorage.setItem("favourites", '["1HZ10V","R_75"]');

  const getFavs = JSON.parse(localStorage.getItem("favourites"));

  const symbolResponse = await sendRequest({
    active_symbols: "brief",
    product_type: "basic",
  });

  const userChoice = symbolResponse?.active_symbols.filter((market) =>
    getFavs.includes(market.symbol)
  );

  setSelectedMarkets(userChoice);

  getFavs.forEach((marketSymbol) => getMarketTick(marketSymbol));
};

const getMarketTick = (market) => {
  subscribe(
    {
      ticks: market,
      subscribe: 1,
    },
    (resp) => {
      setPrevWatchList({
        ...prevWatchList(),
        [market]: watchList()[market] ?? 0,
      });
      setWatchList({ ...watchList(), [market]: resp.tick.quote });
      if (Object.values(watchListRef()).length !== selectedMarkets().length) {
        setWatchListRef({ ...watchListRef(), [market]: resp.tick.id });
      }
    }
  );
};

export { init };
