export const getContractTypesConfig = () => ({
  rise_fall: {
    title: "Rise/Fall",
    trade_types: ["CALL", "PUT"],
    basis: ["stake", "payout"],
    components: ["start_date"],
    barrier_count: 0,
  },
  rise_fall_equal: {
    title: "Rise/Fall",
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
