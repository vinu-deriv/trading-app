export const getContractTypesConfig = (symbol) => ({
  rise_fall: {
    title: "Rise/Fall",
    trade_types: ["CALL", "PUT"],
  },
  high_low: {
    title: "Higher/Lower",
    trade_types: ["CALL", "PUT"],
  },
  even_odd: {
    title: "Even/Odd",
    trade_types: ["DIGITODD", "DIGITEVEN"],
  },
  run_high_low: {
    title: "Only Ups/Only Downs",
    trade_types: ["RUNHIGH", "RUNLOW"],
  },
});
