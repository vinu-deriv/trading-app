import Styles from "../styles/slider.module.scss";
import { createEffect, createSignal } from "solid-js";

const Slider = (props) => {
  const [day_mid, setDayMid] = createSignal("");
  const [rotate, setRotate] = createSignal("rotate(180deg)");
  const [data, setData] = createSignal({ left: 0, right: 0 });

  const getData = () => {
    const value = props.ticks;
    if (value < day_mid()) {
      setData({ left: parseFloat(value), right: 0 });
      setRotate("rotate(0deg)");
    } else if (value > day_mid()) {
      setData({ left: 0, right: parseFloat(value) });
      setRotate("rotate(180deg)");
    }
  };

  createEffect(() => {
    const mid_value = (props.day_low + props.day_high) / 2;
    setDayMid(mid_value.toFixed(props.step_value));
    getData();
  });

  return (
    <div>
      <span class={Styles.span}>Daily range</span>
      <div>
        <input
          type="range"
          id="input-left"
          class={Styles.slider1}
          min={props.day_low}
          max={day_mid()}
          value={data().left}
          step={1 / Math.pow(10, props.step_value)}
          style={{ transform: rotate() }}
        />
        <input
          type="range"
          id={Styles.range}
          min={day_mid()}
          max={props.day_high}
          class={Styles.slider2}
          value={data().right}
          step={1 / Math.pow(10, props.step_value)}
        />
        <div class={Styles.indicator}>
          <div>
            <div class={Styles.arrow_down} />
            <output class={Styles.output_low}>{props.day_low}</output>
          </div>
          <output class={Styles.output_mid}>{day_mid()}</output>
          <div>
            <output class={Styles.output_high}>{props.day_high}</output>
            <div class={Styles.arrow_up} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;
