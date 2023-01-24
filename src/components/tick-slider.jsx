import Styles from "../styles/slider.module.scss";
import { watch_list } from "../stores";
import { createEffect, createSignal, onMount } from "solid-js";
import { subscribe } from "../utils/socket-base";
import classNames from "classnames";

const Slider = (props) => {
  const [day_low, setDayLow] = createSignal("");
  const [day_high, setDayHigh] = createSignal("");
  const [day_mid, setDayMid] = createSignal("");
  const [step_value, setStepValue] = createSignal(1);

  const getOHLC = (resp) => {
    const { msg_type, ohlc } = resp;
    if (msg_type === "ohlc") {
      setDayLow(parseFloat(ohlc.low));
      setDayHigh(parseFloat(ohlc.high));
      setStepValue(ohlc.pip_size);
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
  const tickSlider = () => {
    const inputLeft = document.getElementById("input-left");
    const inputRight = document.getElementById("input-right");

    const thumbLeft = document.getElementById("left");
    const thumbRight = document.getElementById("right");
    const range = document.getElementById("range");

    const setLeftValue = () => {
      const _this = inputLeft;
      const min = parseInt(_this.min);
      const max = parseInt(_this.max);

      _this.value = Math.min(
        parseInt(_this.value),
        parseInt(inputRight.value) - 1
      );

      const percent = ((_this.value - min) / (max - min)) * 100;
      thumbLeft.style.left = percent + "%";
      range.style.left = percent + "%";
    };
    if (day_low() && day_high() && day_mid()) {
      setLeftValue();
    }

    const setRightValue = () => {
      const _this = inputRight;
      const min = parseInt(_this.min);
      const max = parseInt(_this.max);
      _this.value = Math.max(
        parseInt(_this.value),
        parseInt(inputLeft.value) + 1
      );

      const percent = ((_this.value - min) / (max - min)) * 100;

      thumbRight.style.right = 100 - percent + "%";
      range.style.right = 100 - percent + "%";
    };
    if (day_low() && day_high() && day_mid()) {
      setRightValue();
    }

    inputLeft.addEventListener("input", setLeftValue);
    inputRight.addEventListener("input", setRightValue);
  };

  createEffect(() => {
    const mid_value = (day_low() + day_high()) / 2;
    setDayMid(mid_value.toFixed(step_value()));
  });

  return (
    // <div class={Styles.slidecontainer}>
    //   <div class={Styles.ticks}>
    //     <p>{day_low()}</p>
    //     <p>{day_mid()}</p>
    //     <p>{day_high()}</p>
    //   </div>

    //   <input
    //     type="range"
    //     min={day_low()}
    //     max={day_high()}
    //     value={watch_list()[props.symbol]}
    //     class={Styles.slider}
    //     id="myRange"
    //     step={1 / Math.pow(10, step_value())}
    //     disabled
    //   />

    //   <p>Day middle{day_mid()}</p>
    //   <p>Tick{watch_list()[props.symbol]}</p>
    //   <p>Pip {1 / Math.pow(10, step_value())}</p>
    // </div>
    <>
      <p>Day low{day_low()}</p>
      <p> Day mid{day_mid()}</p>
      <p> Day high{day_high()}</p>
      <p> value{watch_list()[props.symbol]}</p>
      <p> step{1 / Math.pow(10, step_value())}</p>

      <div class={Styles.middle}>
        <div class={Styles.ticks}>
          <p>{day_low()}</p>
          <p>{day_mid()}</p>
          <p>{day_high()}</p>
        </div>
        <div>
          <input
            type="range"
            id="input-left"
            min={day_low()}
            max={day_mid()}
            value={watch_list()[props.symbol]}
            step={1 / Math.pow(10, step_value())}
            onChange={tickSlider}
          />
          <input
            type="range"
            id="input-right"
            min={day_mid()}
            max={day_high()}
            value={watch_list()[props.symbol]}
            step={1 / Math.pow(10, step_value())}
            onChange={tickSlider}
          />

          <div class={Styles.slider}>
            <div class={Styles.track} />
            <div id="range" class={Styles.range} />
            <div id="left" class={classNames(Styles.thumb, Styles.left)} />
            <div id="right" class={classNames(Styles.thumb, Styles.right)} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Slider;
