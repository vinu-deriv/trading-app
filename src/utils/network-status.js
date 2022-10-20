import { onMount } from "solid-js";
import { createStore } from "solid-js/store";

export default function monitorNetwork() {
  const [network_status, setNetworkStatus] = createStore({
    is_disconnected: !window.navigator.onLine,
  });

  onMount(() => {
    if ("onLine" in navigator) {
      window.addEventListener("online", () => {
        setNetworkStatus({ is_disconnected: false });
      });
      window.addEventListener("offline", () => {
        setNetworkStatus({ is_disconnected: true });
      });
    }
  });

  return { network_status };
}
