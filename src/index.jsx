/* @refresh reload */
import { render } from "solid-js/web";

import "./index.scss";
import App from "./App";

import logo48 from "./assets/icons/icon-48x48.png";
import logo72 from "./assets/icons/icon-72x72.png";
import logo96 from "./assets/icons/icon-96x96.png";
import logo128 from "./assets/icons/icon-128x128.png";
import logo144 from "./assets/icons/icon-144x144.png";
import logo152 from "./assets/icons/icon-152x152.png";
import logo192 from "./assets/icons/icon-192x192.png";
import logo284 from "./assets/icons/icon-284x284.png";
import logo512 from "./assets/icons/icon-512x512.png";

render(() => <App />, document.getElementById("root"));

export {
  logo48,
  logo72,
  logo96,
  logo128,
  logo144,
  logo152,
  logo192,
  logo284,
  logo512,
};
