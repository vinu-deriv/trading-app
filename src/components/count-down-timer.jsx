import { createSignal, onCleanup, onMount } from "solid-js";
import moment from "moment";
import { toMoment } from "Utils/format-value";
import watchlist_styles from "Styles/watchlist.module.scss";

const CountDownTimer = (props) => {
  const [timer, setTimer] = createSignal();
  let interval_id = null;

  onMount(() => {
    const current_time = Date.now();
    let remaining_time = moment.duration(
      toMoment(props.opens_at).diff(toMoment(current_time), "seconds")
    );
    interval_id = setInterval(() => {
      remaining_time = moment.duration(remaining_time - 1000, "milliseconds");
      if (remaining_time.asSeconds() <= 0) {
        clearInterval(interval_id);
      } else {
        setTimer(remaining_time);
      }
    }, 1000);
  });

  onCleanup(() => {
    clearInterval(interval_id);
  });

  const displayRemainingTime = () => {
    let duration = "";
    let duration_part_count = 0;
    if (timer()?.asSeconds() !== undefined) {
      if (timer().asDays() >= 1) {
        duration += `${timer().days()}D`;
        duration_part_count += 1;
      }
      if (timer().asHours() >= 1) {
        duration += ` ${timer().hours()}h`;
        duration_part_count += 1;
      }
      if (timer().asMinutes() && duration_part_count !== 2) {
        duration += ` ${timer().minutes()}m`;
        duration_part_count += 1;
      }
      if (duration_part_count !== 2) {
        duration += ` ${timer().seconds()}s`;
        duration_part_count += 1;
      }
    }
    return duration;
  };

  return (
    <div class={watchlist_styles["market-closed"]}>
      <span class={watchlist_styles["indicator"]} />
      <div class={watchlist_styles["text"]}>
        <span>Open in:</span>
        <span>{displayRemainingTime().trim()}</span>
      </div>
    </div>
  );
};

export default CountDownTimer;
