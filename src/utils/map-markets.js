export const mapMarket = (active_symbols) => {
  return (
    active_symbols?.reduce((symbol_map, symbol) => {
      return {
        ...symbol_map,
        [symbol.symbol]: symbol,
      };
    }, {}) ?? []
  );
};
export const getFavourites = () => {
  return JSON.parse(localStorage.getItem("favourites")) ?? [];
};

export const segregateMarkets = (active_symbols) =>
  active_symbols?.reduce(
    (markets, symbol) => ({
      ...markets,
      [symbol.market]: [...(markets[symbol.market] || []), symbol],
    }),
    {}
  ) ?? [];

export const getMarketInformation = (shortcode) => {
  const market_info = {
    category: "",
    underlying: "",
  };

  const pattern = new RegExp(
    "^([A-Z]+)_((1HZ[0-9-V]+)|((CRASH|BOOM)[0-9\\d]+[A-Z]?)|(OTC_[A-Z0-9]+)|R_[\\d]{2,3}|[A-Z]+)"
  );
  const extracted = pattern.exec(shortcode);
  if (extracted !== null) {
    market_info.category = extracted[1].toLowerCase();
    market_info.underlying = extracted[2];
  }

  return market_info;
};
