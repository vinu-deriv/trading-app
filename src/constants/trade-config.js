export const RISE_FALL_TITLE = "Rise/Fall";

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
