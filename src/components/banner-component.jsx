import classNames from "classnames";
import { Show, onCleanup } from "solid-js";
import { Button } from ".";
import { banner_category } from "../constants/banner-category";
import { setBannerMessage } from "../stores";
import styles from "../styles/banner-component.module.scss";
import { isDesktop } from "../utils/responsive";

const OverlayWrapper = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;

const BannerComponent = (props) => {
  onCleanup(() => {
    setBannerMessage(null);
  });
  return (
    <Show when={props.message}>
      <OverlayWrapper
        condition={isDesktop()}
        wrapper={(children) => (
          <div
            class={styles["popup__div"]}
            onClick={() => setBannerMessage(null)}
          >
            {children}
          </div>
        )}
      >
        <div
          class={`${classNames(styles.popup, {
            [styles.error]: props.category === banner_category.ERROR,
            [styles.info]: props.category === banner_category.INFO,
            [styles.warning]: props.category === banner_category.WARNING,
          })}`}
        >
          <Show when={props.showCloseButton}>
            <div class={styles["popup__div_close"]}>
              <Button
                category="secondary"
                onClick={() => setBannerMessage(null)}
              >
                x
              </Button>
            </div>
          </Show>
          <p class={styles["popup__text"]}>{props.message}</p>
          <Show when={props.onClickConfirm}>
            <div class={styles["popup__div_confirm"]}>
              <Button
                category="flat"
                onClick={() => props.handleClick() ?? setBannerMessage(null)}
              >
                {props.confirmation || "ok"}
              </Button>
            </div>
          </Show>
        </div>
      </OverlayWrapper>
    </Show>
  );
};
export default BannerComponent;
