import { Outlet, useLocation, useNavigate } from "@solidjs/router";
import { loginUrl } from "Constants/deriv-urls";
import { createEffect } from "solid-js";
import { login_information } from "Stores/base-store";
import { selectedTradeType } from "Stores";
import { routes } from "Constants/routes";

export const RouteGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  createEffect(() => {
    if (!login_information.is_logged_in) {
      loginUrl({ language: "en" });
    } else if (
      location.pathname === routes.TRADE &&
      !selectedTradeType()?.symbol
    ) {
      navigate(routes.HOME, { replace: true });
    }
  });

  return <Outlet />;
};
