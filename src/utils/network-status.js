import { onMount, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { reconnectAfter } from "./socket-base";

export default function monitorNetwork() {
  const [network_status, setNetworkStatus] = createStore({
    is_disconnected: !window.navigator.onLine,
  });
  const [has_been_offline, setHasBeenOffline] = createSignal(false);

  const notification_config = {
    vibrate: [200, 100, 300],
    title: "DTrader Air",
    icon: "/icon-144x144.png",
  };

  onMount(() => {
    if ("onLine" in navigator) {
      window.addEventListener("online", () => {
        setNetworkStatus({ is_disconnected: false });
        if (has_been_offline()) {
          if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then((swreg) => {
              swreg.showNotification("You are now online", {
                ...notification_config,
                body: "Happy trading!",
              });
            });
          }
        }
        setHasBeenOffline(false);
        reconnectAfter({ timeout: 5000 });
      });
      window.addEventListener("offline", () => {
        Notification.requestPermission((result) => {
          if (result === "granted") {
            navigator.serviceWorker.ready.then((reg) => {
              reg.showNotification("Alert", {
                ...notification_config,
                body: "You will be notified when you come back online",
              });
            });
          }
        });
        setNetworkStatus({ is_disconnected: true });
        reconnectAfter({ timeout: 5000 });
        setHasBeenOffline(true);
      });
    }
  });

  return { network_status };
}
