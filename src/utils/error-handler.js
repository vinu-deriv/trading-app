import { ERROR_CODE, ERROR_MESSAGE } from "Constants/error-codes";
import { logout } from "Stores/base-store";
import { setBannerMessage } from "Stores/trade-store";
import { setActionButtonValues } from "Stores/ui-store";
import { routes } from "Constants/routes";

const onClickHandler = (action) => {
  if (action === "reload") {
    window.location.reload();
  } else if (action === "redirect") {
    if (/endpoint/.test(window.location.href)) {
      setBannerMessage(null);
    } else {
      window.location.assign(routes.ENDPOINT);
    }
  }
};

export const errorCatcher = (error) => {
  switch (error?.error?.code) {
    case ERROR_CODE.invalid_app_id: {
      setBannerMessage(ERROR_MESSAGE.endpoint_redirect);
      setActionButtonValues({
        text: "Set AppId",
        action: () => onClickHandler("redirect"),
      });
      break;
    }
    case ERROR_CODE.rate_limit: {
      setBannerMessage(ERROR_MESSAGE.rate_limit);
      setActionButtonValues({
        text: "Reload",
        action: () => onClickHandler("reload"),
      });
      break;
    }
    case ERROR_CODE.invalid_token: {
      setBannerMessage(ERROR_MESSAGE.invalid_token);
      setTimeout(() => logout(), 1500);
      break;
    }
    default: {
      setBannerMessage(error?.error?.message ?? ERROR_MESSAGE.general_error);
    }
  }
};
