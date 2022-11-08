import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

cleanupOutdatedCaches();
self.skipWaiting();
clientsClaim();

const CACHE_STATIC_NAME = "static-v1";
const CACHE_DYNAMIC_NAME = "dynamic-v1";
const NO_CACHE_ROUTES = ["/trade"];

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      cache.addAll(["/", "/index.html", "/offline.html"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request)
        .then((res) => {
          if (NO_CACHE_ROUTES.includes(event.request.url)) {
            return caches.open(CACHE_DYNAMIC_NAME).then((cache) => {
              cache.put(event.request.url, res.clone());
              return res;
            });
          }
          return res;
        })
        .catch((err) => {
          return caches.open(CACHE_STATIC_NAME).then((cache) => {
            return cache.match("/offline.html");
          });
        });
    })
  );
});
