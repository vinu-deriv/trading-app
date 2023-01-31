import Styles from "../styles/slider.module.scss";
import {
  prev_watch_list,
  setPrevWatchList,
  setWatchList,
  watch_list,
} from "../stores";
import { createEffect, createSignal, onMount } from "solid-js";
import { subscribe, wait } from "../utils/socket-base";

const Slider = (props) => {
  const [day_low, setDayLow] = createSignal("");
  const [day_high, setDayHigh] = createSignal("");
  const [day_mid, setDayMid] = createSignal("");
  const [step_value, setStepValue] = createSignal(1);
  const [data, setData] = createSignal({ left: 0, right: 0 });
  const SYMBOL = "WLDUSD";

  // can clear later
  const getTickValue = (resp) => {
    const prev_value = watch_list()[SYMBOL];
    const new_value = resp.tick.quote;
    setPrevWatchList({
      ...prev_watch_list(),
      [SYMBOL]: prev_value ?? 0,
    });
    setTimeout(() => {
      setWatchList({ ...watch_list(), [SYMBOL]: new_value });
    });
  };

  const getOHLC = (resp) => {
    const { msg_type, ohlc } = resp;
    if (msg_type === "ohlc") {
      setDayLow(parseFloat(ohlc.low));
      setDayHigh(parseFloat(ohlc.high));
      setStepValue(ohlc.pip_size);
    }
  };

  const mockDataSet = () => {
    const value = watch_list()[SYMBOL];
    if (value < day_mid()) {
      setData({ left: parseFloat(value), right: 0 });
    } else if (value > day_mid()) {
      setData({ left: 0, right: parseFloat(value) });
    }
  };

  onMount(async () => {
    await wait("authorize");
    await subscribe(
      {
        ticks_history: SYMBOL,
        style: "candles",
        end: "latest",
        count: 1000,
        granularity: 86400,
        adjust_start_time: 1,
        subscribe: 1,
      },
      getOHLC
    );
    setWatchList({ ...watch_list(), [SYMBOL]: 0 });
    await subscribe({ ticks: SYMBOL, subscribe: 1 }, getTickValue);
    setData({ left: day_mid(), right: day_mid() });
  });

  //   onMount(() => {
  //     subscribe(
  //       {
  //         ticks_history: props.symbol,
  //         style: "candles",
  //         end: "latest",
  //         count: 1000,
  //         granularity: 86400,
  //         adjust_start_time: 1,
  //         subscribe: 1,
  //       },
  //       getOHLC
  //     );
  //   });

  createEffect(() => {
    const mid_value = (day_low() + day_high()) / 2;
    setDayMid(mid_value.toFixed(step_value()));
    mockDataSet();
  });

  return (
    <div style={{ "margin-top": "70px" }}>
      <span class={Styles.span}>Daily range</span>
      <div>
        <input
          type="range"
          id="input-left"
          class={Styles.slider1}
          min={day_low()}
          max={day_mid()}
          value={day_mid() || data().left}
          step={1 / Math.pow(10, step_value())}
          style={{ position: "relative" }}
        />
        <input
          type="range"
          id="input-right"
          min={day_mid()}
          max={day_high()}
          class={Styles.slider2}
          value={data().right}
          step={1 / Math.pow(10, step_value())}
        />
        <div class={Styles.indicator}>
          <div>
            <div class={Styles.arrow_down} />
            <output style={{ "padding-right": "5px", "font-weight": "bold" }}>
              {day_low()}
            </output>
          </div>
          <div>
            <output style={{ "padding-left": "5px", "font-weight": "bold" }}>
              {day_high()}
            </output>
            <div class={Styles.arrow_up} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;
