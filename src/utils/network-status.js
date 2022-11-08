/* eslint-disable no-console */
import { createSignal } from "solid-js";
import { onMount } from "solid-js";
import { createStore } from "solid-js/store";

export default function monitorNetwork() {
  const [network_status, setNetworkStatus] = createStore({
    is_disconnected: !window.navigator.onLine,
  });
  const [has_been_offline, setHasBeenOffline] = createSignal(false);

  onMount(() => {
    if ("onLine" in navigator) {
      window.addEventListener("online", () => {
        setNetworkStatus({ is_disconnected: false });
        console.log("has_been_offline()", has_been_offline());
        if (has_been_offline()) {
          // if ("serviceWorker" in navigator) {
          //   navigator.serviceWorker.ready.then((swreg) => {
          //     swreg.showNotification("You are now online. Happy trading!", {
          //       body: "Online",
          //     });
          //   });
          // }
          // new Notification("You are online");
          setHasBeenOffline(false);
        }
      });
      window.addEventListener("offline", () => {
        Notification.requestPermission((result) => {
          if (result !== "granted") {
            console.log("No notification permission granted");
          } else {
            console.log("notification permission granted");
            navigator.serviceWorker.ready.then((reg) => {
              console.log("reg: ", reg);
              const options = {
                body: "Test notification",
                data: {
                  dateOfArrival: Date.now(),
                  primaryKey: 1,
                },
              };
              reg.showNotification("Hello world!", options);
            });
          }
        });
        setNetworkStatus({ is_disconnected: true });
        setHasBeenOffline(true);
      });
    }
  });

  return { network_status };
}
