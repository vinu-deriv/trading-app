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

export const convertToTime = (epoc_time) => {
  const date = new Date(epoc_time * 1000);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `${hours}:${minutes}:${seconds}`;
};

export const timePeriod = (end_time_epoc, start_time_epoc) => {
  const delta_ms = end_time_epoc - start_time_epoc;
  const totalSeconds = parseInt(Math.floor(delta_ms / 1000), 10);
  const totalMinutes = parseInt(Math.floor(totalSeconds / 60), 10);
  const totalHours = parseInt(Math.floor(totalMinutes / 60), 10);
  // const days = parseInt(Math.floor(totalHours / 24), 10);
  const seconds = parseInt(totalSeconds % 60, 10);
  const minutes = parseInt(totalMinutes % 60, 10);
  const hours = parseInt(totalHours % 24, 10);
  return `${hours}:${minutes}:${seconds}`;
};
