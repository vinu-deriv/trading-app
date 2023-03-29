import { Outlet } from "@solidJS/router";
import { loginUrl } from "Constants/deriv-urls";
import { createEffect } from "solid-js";
import { login_information } from "Stores/base-store";

export const RouteGuard = () => {
  createEffect(() => {
    if (!login_information.is_logged_in) {
      loginUrl({ language: "en" });
    }
  });

  return <Outlet />;
};
