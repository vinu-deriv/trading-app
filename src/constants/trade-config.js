export const RISE_FALL_TITLE = "Rise/Fall";
export const HIGH_LOW_TITLE = "Higher/Lower";
export const TOUCH_NOTOUCH_TITLE = "Touch/No Touch";

export const getContractTypesConfig = () => ({
  rise_fall: {
    title: RISE_FALL_TITLE,
    trade_types: ["CALL", "PUT"],
    basis: ["stake", "payout"],
    components: ["start_date"],
    barrier_count: 0,
  },
  rise_fall_equal: {
    title: RISE_FALL_TITLE,
    trade_types: ["CALLE", "PUTE"],
    basis: ["stake", "payout"],
    components: ["start_date"],
    barrier_count: 0,
    hide_from_dropdown: true,
  },
  high_low: {
    title: HIGH_LOW_TITLE,
    trade_types: ["CALL", "PUT"],
    basis: ["stake", "payout"],
    components: ["barrier"],
    barrier_count: 1,
  },
  touch: {
    title: TOUCH_NOTOUCH_TITLE,
    trade_types: ["ONETOUCH", "NOTOUCH"],
    basis: ["stake", "payout"],
    components: ["barrier"],
  },
});

export const getContractCategoriesConfig = () => ({
  "Ups & Downs": {
    name: "Ups & Downs",
    categories: [
      "rise_fall",
      "rise_fall_equal",
      "run_high_low",
      "reset",
      "asian",
      "callputspread",
    ],
  },
  "Highs & Lows": {
    name: "Highs and Lows",
    categories: ["high_low", "touch", "tick_high_low"],
  },
});

export const MARKET_TYPES = [
  {
    title: "Derived",
    ref: "synthetic_index",
  },
  {
    title: "Commodities",
    ref: "commodities",
  },
  {
    title: "Cryptocurrencies",
    ref: "cryptocurrency",
  },
  {
    title: "Forex",
    ref: "forex",
  },
  {
    title: "Indices",
    ref: "indices",
  },
];

export const FAVOURITES = "favs";
