export const addComma = (num, decimal_points = 2) => {
  let number = String(num || 0).replace(/,/g, "");
  if (typeof decimal_points !== "undefined") {
    number = (+number).toFixed(decimal_points);
  }
  return number
    .toString()
    .replace(
      /(^|[^\w.])(\d{4,})/g,
      ($0, $1, $2) => $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,")
    );
};
