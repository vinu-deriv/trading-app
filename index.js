if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js")
    // eslint-disable-next-line no-console
    .then(() => console.log("Service worker registered"))
    .catch(function (err) {});
}
