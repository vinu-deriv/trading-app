import moment from "moment";
import { getTradeTimings } from "Stores/trade-store";

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
  if (delta_ms < 0) {
    return "0h 0m 0s";
  }
  const totalSeconds = parseInt(Math.floor(delta_ms / 1000), 10);
  const totalMinutes = parseInt(Math.floor(totalSeconds / 60), 10);
  const totalHours = parseInt(Math.floor(totalMinutes / 60), 10);
  const seconds = parseInt(totalSeconds % 60, 10);
  const minutes = parseInt(totalMinutes % 60, 10);
  const hours = parseInt(totalHours % 24, 10);
  return `${hours}h ${minutes}m ${seconds}s`;
};

export const toMoment = (value) => {
  if (!value) return moment().utc();
  if (value instanceof moment && value.isValid() && value.isUTC()) return value;
  if (typeof value === "number") return epochToMoment(value);
  return moment.utc(value);
};

export const epochToMoment = (epoch) => moment.unix(epoch).utc();

export const addDays = (date, days_offset) =>
  toMoment(date).add(days_offset, "days");

export const formatDate = (date, format = "YYYY-MM-DD") =>
  toMoment(date).format(format);

export const daysSince = (date) => {
  const diff = toMoment()
    .startOf("day")
    .diff(toMoment(date).startOf("day"), "days");
  return !date ? "" : diff;
};

export const convertDurationLimit = (value, unit) => {
  if (!(value >= 0) || !unit || !Number.isInteger(value)) {
    return null;
  }

  if (unit === "m") {
    const minute = value / 60;
    return minute >= 1 ? Math.floor(minute) : 1;
  } else if (unit === "h") {
    const hour = value / (60 * 60);
    return hour >= 1 ? Math.floor(hour) : 1;
  } else if (unit === "d") {
    const day = value / (60 * 60 * 24);
    return day >= 1 ? Math.floor(day) : 1;
  }

  return value;
};

export const generateTickData = ({
  previous = 0,
  current = 0,
  is_closed = false,
  is_suspended = false,
  opens_at = null,
}) => ({ previous, current, is_closed, is_suspended, opens_at });

export const calculateTimeLeft = (remaining_time_to_open) => {
  const difference = remaining_time_to_open - Date.now();
  return difference > 0
    ? {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    : {};
};

export const getSymbol = (target_symbol, trading_times) => {
  let symbol;
  const { markets } = trading_times;
  for (let i = 0; i < markets.length; i++) {
    const { submarkets } = markets[i];
    for (let j = 0; j < submarkets.length; j++) {
      const { symbols } = submarkets[j];
      symbol = symbols.find((item) => item.symbol === target_symbol);
      if (symbol) return symbol;
    }
  }
};

export const checkWhenMarketOpens = async (days_offset, target_symbol) => {
  const target_date = addDays(new Date(), days_offset);
  const api_response = await getTradeTimings(formatDate(target_date));
  if (!api_response.api_initial_load_error) {
    const { times } = getSymbol(target_symbol, api_response.trading_times);
    const { open, close } = times;
    const is_closed_all_day =
      open?.length === 1 && open[0] === "--" && close[0] === "--";
    if (is_closed_all_day) {
      return checkWhenMarketOpens(days_offset + 1, target_symbol);
    }
    const date_str = target_date.toISOString().substring(0, 11);
    const getUTCDate = (hour) => new Date(`${date_str}${hour}Z`);
    let remaining_time_to_open;
    for (let i = 0; i < open?.length; i++) {
      const diff = +getUTCDate(open[i]) - Date.now();
      if (diff > 0) {
        remaining_time_to_open = +getUTCDate(open[i]);
        return remaining_time_to_open;
      }
    }
    return checkWhenMarketOpens(days_offset + 1, target_symbol);
  }
};
