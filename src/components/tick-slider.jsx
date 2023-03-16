import styles from "../styles/slider.module.scss";
import { createEffect, createSignal } from "solid-js";
import classNames from "classnames";

const Slider = (props) => {
  const [dayMid, setDayMid] = createSignal(0);
  const [data, setData] = createSignal({ left: 0, right: 0 });

  const getData = () => {
    const tick = props.ticks;
    let [left, right] = [0, 0];
    if (tick < dayMid()) {
      left = ((dayMid() - tick) / (dayMid() - props.day_low)) * 100;
    } else if (tick > dayMid()) {
      right = ((tick - dayMid()) / (props.day_high - dayMid())) * 100;
    }
    setData({ left, right });
  };

  createEffect(() => {
    const midValue = (props.day_low + props.day_high) / 2;
    setDayMid(midValue);
    getData();
  });

  return (
    <>
      <span class={styles.title}>Daily Range</span>
      <div class={styles.progress_container}>
        <div
          class={classNames(
            styles.progress_bar,
            styles.progress_bar_bg,
            styles.progress_bar_curved_border_left,
            styles.progress_bar_reversed
          )}
        >
          <div
            class={classNames(
              styles.progress_bar,
              styles.progress_bar_left,
              styles.progress_bar_curved_border_left,
              data().left <= 0 ? styles.progress_bar_hidden : ""
            )}
            style={{ width: `${data().left}%` }}
          />
        </div>
        <div
          class={classNames(
            styles.progress_bar,
            styles.progress_bar_bg,
            styles.progress_bar_curved_border_right
          )}
        >
          <div
            class={classNames(
              styles.progress_bar,
              styles.progress_bar_right,
              styles.progress_bar_curved_border_right,
              data().right <= 0 ? styles.progress_bar_hidden : ""
            )}
            style={{ width: `${data().right}%` }}
          />
        </div>
      </div>
      <div class={styles.indicator_container}>
        <div class={styles.indicator_trend_container}>
          <div class={styles.arrow_down} />
          <output class={styles.indicator_text}>{props.day_low}</output>
        </div>
        <output class={styles.indicator_text}>
          {dayMid().toFixed(props.step_value)}
        </output>
        <div class={styles.indicator_trend_container}>
          <output class={styles.indicator_text}>{props.day_high}</output>
          <div class={styles.arrow_up} />
        </div>
      </div>
    </>
  );
};

export default Slider;
