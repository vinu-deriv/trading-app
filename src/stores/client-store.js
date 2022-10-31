import { createStore } from "solid-js/store";
import { createSignal } from "solid-js";

export const [client_information, setClientInformation] = createStore({});
export const [is_light_theme, setIsLightTheme] = createSignal(true);
