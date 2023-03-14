import styles from "../styles/slider.module.scss";
import { createEffect, createSignal } from "solid-js";
import classNames from "classnames";

const Slider = (props) => {
  const [day_mid, setDayMid] = createSignal(0);
  const [data, setData] = createSignal({ left: 0, right: 0 });

  const getData = () => {
    const tick = props.ticks;
    let [bearish, bullish] = [0, 0];
    if (tick < day_mid()) {
      bearish = ((day_mid() - tick) / (day_mid() - props.day_low)) * 100;
    } else if (tick > day_mid()) {
      bullish = ((tick - day_mid()) / (props.day_high - day_mid())) * 100;
    }
    setData({ left: bearish, right: bullish });
  };

  createEffect(() => {
    const mid_value = (props.day_low + props.day_high) / 2;
    setDayMid(mid_value);
    getData();
  });

  return (
    <>
      <span class={styles.title}>Daily Range</span>
      <div class={styles.progress_container}>
        <div
          class={classNames(
            styles.progress_bar_bg,
            styles.progress_bar_reversed,
            styles.progress_bar,
            styles.progress_bar_curved_border_left
          )}
        >
          <div
            class={classNames(
              styles.progress_bar,
              styles.progress_bar_bearish,
              styles.progress_bar_curved_border_left
            )}
            style={{ width: `${data().left}%` }}
          />
        </div>
        <div
          class={classNames(
            styles.progress_bar_bg,
            styles.progress_bar,
            styles.progress_bar_curved_border_right
          )}
        >
          <div
            class={classNames(
              styles.progress_bar,
              styles.progress_bar_bullish,
              styles.progress_bar_curved_border_right
            )}
            style={{ width: `${data().right}%` }}
          />
        </div>
      </div>
      <div class={styles.indicator_container}>
        <div>
          <div class={styles.arrow_down} />
          <output class={styles.indicator_text}>{props.day_low}</output>
        </div>
        <output class={styles.indicator_text}>
          {day_mid().toFixed(props.step_value)}
        </output>
        <div>
          <output class={styles.indicator_text}>{props.day_high}</output>
          <div class={styles.arrow_up} />
        </div>
      </div>
    </>
  );
};

export default Slider;
