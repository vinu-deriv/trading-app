import Styles from "../styles/slider.module.scss";
import { createEffect, createSignal, onMount } from "solid-js";
import { subscribe } from "../utils/socket-base";

const Slider = (props) => {
  const [day_low, setDayLow] = createSignal("");
  const [day_high, setDayHigh] = createSignal("");
  const [day_mid, setDayMid] = createSignal("");
  const [step_value, setStepValue] = createSignal(1);
  const [rotate, setRotate] = createSignal("rotate(180deg)");
  const [data, setData] = createSignal({ left: 0, right: 0 });
  const [symbol, setSymbol] = createSignal("");

  const getTickValue = (resp) => {
    const tick_value = resp.tick.quote;
    setSymbol(tick_value);
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
    const value = symbol();
    if (value < day_mid()) {
      setData({ left: parseFloat(value), right: 0 });
      setRotate("rotate(0deg)");
    } else if (value > day_mid()) {
      setData({ left: 0, right: parseFloat(value) });
      setRotate("rotate(180deg)");
    }
  };

  onMount(async () => {
    await subscribe(
      {
        ticks_history: symbol(),
        style: "candles",
        end: "latest",
        count: 1000,
        granularity: 86400,
        adjust_start_time: 1,
        subscribe: 1,
      },
      getOHLC
    );
    await subscribe({ ticks: symbol(), subscribe: 1 }, getTickValue);
  });

  createEffect(() => {
    const mid_value = (day_low() + day_high()) / 2;
    setDayMid(mid_value.toFixed(step_value()));
    mockDataSet();
  });

  return (
    <div>
      <span class={Styles.span}>Daily range</span>
      <div>
        <input
          type="range"
          id="input-left"
          class={Styles.slider1}
          min={day_low()}
          max={day_mid()}
          value={data().left}
          step={1 / Math.pow(10, step_value())}
          style={{ transform: rotate() }}
        />
        <input
          type="range"
          id={Styles.range}
          min={day_low()}
          max={day_high()}
          class={Styles.slider2}
          value={data().right}
          step={1 / Math.pow(10, step_value())}
        />
        <div class={Styles.indicator}>
          <div>
            <div class={Styles.arrow_down} />
            <output class={Styles.output_low}>{day_low()}</output>
          </div>
          <output class={Styles.output_mid}>{day_mid()}</output>
          <div>
            <output class={Styles.output_high}>{day_high()}</output>
            <div class={Styles.arrow_up} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;
