import { login_information } from "Stores/base-store";
import { loginUrl } from "Constants/deriv-urls";

export const redirectToLoggedOutUserToLogin = () => {
    if (!login_information.is_logged_in) {
      window.location.href = loginUrl({ language: "en" });
    }
  };
