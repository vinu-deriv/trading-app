/* @refresh reload */
import { render } from "solid-js/web";

import "./index.scss";
import App from "./App";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function () {
    })
    .catch(function (err) {
    });
}

render(() => <App />, document.getElementById("root"));
