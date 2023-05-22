import { Show } from "solid-js";
import StarIcon from "Assets/svg/action/star.svg";

const MarkFavourites = (props) => (
  <div
    id="action"
    onClick={(event) => {
      props.config.onAction(props.config.symbol);
      event.stopPropagation();
    }}
  >
    <Show
      when={props.config.watchlist.includes(props.config.symbol)}
      fallback={
        <StarIcon
          height="24"
          stroke="var(--button-disabled)"
          fill="white"
          id={`watch-icon-${props.index}`}
        />
      }
    >
      <StarIcon
        id={`watch-icon-${props.index}`}
        stroke="var(--button-yellow)"
        fill="var(--button-yellow)"
        height="24"
      />
    </Show>
  </div>
);

export default MarkFavourites;
