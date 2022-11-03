export const getContractTypesConfig = (symbol) => ({
  rise_fall: {
    title: "Rise/Fall",
    trade_types: ["CALL", "PUT"],
    basis: ["stake", "payout"],
    components: ["start_date"],
    barrier_count: 0,
  },
  high_low: {
    title: "Higher/Lower",
    trade_types: ["CALL", "PUT"],
    basis: ["stake", "payout"],
    components: ["barrier"],
    barrier_count: 1,
  },
  even_odd: {
    title: "Even/Odd",
    trade_types: ["DIGITODD", "DIGITEVEN"],
    basis: ["stake", "payout"],
    components: [],
  },
  run_high_low: {
    title: "Only Ups/Only Downs",
    trade_types: ["RUNHIGH", "RUNLOW"],
    basis: [],
    components: [],
  },
  // multiplier: {
  //     title: localize('Multipliers'),
  //     trade_types: ['MULTUP', 'MULTDOWN'],
  //     basis: ['stake'],
  //     components: [
  //         'take_profit',
  //         'stop_loss',
  //         ...(shouldShowCancellation(symbol) ? ['cancellation'] : []),
  //         ...(shouldShowExpiration(symbol) ? ['expiration'] : []),
  //     ],
  //     config: { hide_duration: true },
  // },
});
