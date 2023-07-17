import { createSignal } from "solid-js";

export const [is_light_theme, setIsLightTheme] = createSignal(true);
export const [active_tab, setActiveTab] = createSignal({
  index: 0,
  id: "favs",
});
