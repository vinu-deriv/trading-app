import classNames from "classnames";
import { useNavigate } from "solid-app-router";
import { Show, onCleanup } from "solid-js";
import {
  action,
  action_url,
  button_text,
  setAction,
  setActionUrl,
  setButtonText,
} from "Stores/trade-store";
import { Button } from ".";
import { banner_category } from "../constants/banner-category";
import { setBannerMessage } from "../stores";
import styles from "../styles/banner-component.module.scss";
import { isDesktop } from "../utils/responsive";

const OverlayWrapper = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;

const BannerComponent = (props) => {
  const nav_height = document.getElementById("app_navbar")?.offsetHeight;
  const navigate = useNavigate();

  onCleanup(() => {
    setBannerMessage(null);
    setActionUrl("");
    setAction("");
    setButtonText("Ok");
  });

  const onClickConfirm = (action) => {
    if (action === "redirect") {
      navigate(action_url(), { replace: true });
    }
    setBannerMessage(null);
  };
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
          style={{ top: nav_height }}
          class={classNames(styles.popup, {
            [styles.error]: props.category === banner_category.ERROR,
            [styles.info]: props.category === banner_category.INFO,
            [styles.warning]: props.category === banner_category.WARNING,
          })}
        >
          <Show when={props.showCloseButton}>
            <div class={styles["popup__div_close"]}>
              <Button
                category="secondary"
                onClick={() => setBannerMessage(null)}
              >
                X
              </Button>
            </div>
          </Show>
          <p class={styles["popup__text"]}>{props.message}</p>
          <Show when={action()}>
            <div class={styles["popup__div_confirm"]}>
              <Button category="flat" onClick={() => onClickConfirm(action())}>
                {button_text()}
              </Button>
            </div>
          </Show>
        </div>
      </OverlayWrapper>
    </Show>
  );
};
export default BannerComponent;
