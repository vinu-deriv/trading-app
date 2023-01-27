import Styles from "../styles/slider.module.scss";
import { watch_list } from "../stores";
import { createEffect, createSignal, onMount } from "solid-js";
import { subscribe } from "../utils/socket-base";

const Slider = (props) => {
  const [day_low, setDayLow] = createSignal("");
  const [day_high, setDayHigh] = createSignal("");
  // const [day_mid, setDayMid] = createSignal("");
  const [day_open, setDayOpen] = createSignal("");
  const [step_value, setStepValue] = createSignal(1);
  const [data, setData] = createSignal({ left: 0, right: 0 });

  const getOHLC = (resp) => {
    const { msg_type, ohlc } = resp;
    if (msg_type === "ohlc") {
      setDayLow(parseFloat(ohlc.low));
      setDayHigh(parseFloat(ohlc.high));
      setDayOpen(parseFloat(ohlc.open));
      setStepValue(ohlc.pip_size);
    }
  };

  const mockDataSet = () => {
    const value = watch_list()[props.symbol];
    if (value < day_open()) {
      setData({ left: parseFloat(day_open() - value), right: 0 });
    } else if (value > day_open()) {
      setData({ left: 0, right: parseFloat(value) });
    }
  };

  onMount(() => {
    subscribe(
      {
        ticks_history: props.symbol,
        style: "candles",
        end: "latest",
        count: 1000,
        granularity: 86400,
        adjust_start_time: 1,
        subscribe: 1,
      },
      getOHLC
    );
  });

  createEffect(() => {
    // const mid_value = (day_low() + day_high()) / 2;
    // setDayMid(mid_value.toFixed(step_value()));
    mockDataSet();
  });

  return (
    <div style={{ position: "relative" }}>
      <output>{day_low()}</output>

      <span id="span-value" class={Styles.span_value}>
        {watch_list()[props.symbol]}
      </span>
      <input
        type="range"
        id="input-left"
        class={Styles.slider1}
        min={day_low()}
        max={day_open()}
        value={data().left}
        step={1 / Math.pow(10, step_value())}
        style={{ position: "relative", transform: "rotate(180deg)" }}
      />
      <input
        type="range"
        id="input-right"
        min={day_open()}
        max={day_high()}
        class={Styles.slider2}
        value={data().right}
        step={1 / Math.pow(10, step_value())}
      />
      <output>{day_high()}</output>
    </div>
  );
};

export default Slider;
