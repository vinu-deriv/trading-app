import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import solidPlugin from "vite-plugin-solid";
import { dependencies } from "./package.json";
import path from "path";

function renderChunks(deps) {
  let chunks = {};
  Object.keys(deps).forEach((key) => {
    if (["@deriv/deriv-api", "solid-js"].includes(key)) return;
    chunks[key] = [key];
  });
  return chunks;
}

export default defineConfig({
  plugins: [
    solidPlugin(),
    VitePWA({
      base: "/",
      strategies: "generateSW",
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["index.html"],
        runtimeCaching: [
          {
            urlPattern: /.*(js|css|ico|png|html|svg)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "project-files",
              expiration: {
                maxAgeSeconds: 60 * 60 * 24,
              },
            },
          },
        ],
      },
      manifest: {
        name: "Trading App",
        short_name: "TradingApp",
        description: "My Awesome App description",
        theme_color: "#000000",
        icons: [
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icon-48x48.png",
            sizes: "48x48",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-284x284.png",
            sizes: "284x284",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      devOptions: {
        enabled: true,
        /* other options */
      },
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["@deriv/deriv-api", "solid-js"],
          ...renderChunks(dependencies),
        },
      },
    },
  },

  resolve: {
    alias: {
      Assets: path.resolve(__dirname, "./src/assets"),
      Components: path.resolve(__dirname, "./src/components"),
      Constants: path.resolve(__dirname, "./src/constants"),
      Containers: path.resolve(__dirname, "./src/containers"),
      Routes: path.resolve(__dirname, "./src/routes"),
      Stores: path.resolve(__dirname, "./src/stores"),
      Utils: path.resolve(__dirname, "./src/utils"),
    },
  },
});
