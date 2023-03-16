import styles from "../styles/slider.module.scss";
import { createEffect, createSignal, Show } from "solid-js";
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
      <div>
        <div class={styles.ticker_container}>
          <div
            class={classNames(
              styles.ticker_sub_container,
              styles.ticker_sub_container_reversed
            )}
          >
            <span style={{ width: `${data().left}%` }} />
            <Show when={data().left > 0 || props.ticks === dayMid()}>
              <span class={styles.ticker} />
            </Show>
          </div>
          <div class={styles.ticker_sub_container}>
            <span style={{ width: `${data().right}%` }} />
            <Show when={data().right > 0}>
              <span class={styles.ticker} />
            </Show>
          </div>
        </div>
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
                styles.progress_bar_curved_border_left
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
                styles.progress_bar_curved_border_right
              )}
              style={{ width: `${data().right}%` }}
            />
          </div>
        </div>
      </div>
      <div class={styles.indicator_container}>
        <div class={styles.indicator_trend_container}>
          <div class={styles.arrow_down} />
          <div
            class={classNames(
              styles.indicator_text_container,
              styles.indicator_text_container_left,
              styles.indicator_text
            )}
          >
            <output>{props.day_low}</output>
            <span class={styles.indicator_sub_text}>Low</span>
          </div>
        </div>
        <output class={styles.indicator_text}>
          {dayMid().toFixed(props.step_value)}
        </output>
        <div class={styles.indicator_trend_container}>
          <div
            class={classNames(
              styles.indicator_text_container,
              styles.indicator_text_container_right,
              styles.indicator_text
            )}
          >
            <output>{props.day_high}</output>
            <span class={styles.indicator_sub_text}>High</span>
          </div>
          <div class={styles.arrow_up} />
        </div>
      </div>
    </>
  );
};

export default Slider;
