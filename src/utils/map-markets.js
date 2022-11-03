export const mapMarket = (active_symbols) => {
  return active_symbols.reduce((symbol_map, symbol) => {
    return {
      ...symbol_map,
      [symbol.symbol]: symbol,
    };
  }, {});
};
