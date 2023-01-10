import solidPlugin from "vite-plugin-solid";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [solidPlugin()],
  test: {
    deps: {
      registerNodeLoader: true,
      inline: [/solid-js/],
    },
    environment: "jsdom",
    globals: true,
    setupFiles: [
      "node_modules/@testing-library/jest-dom/extend-expect",
      "./setupVitest.js",
    ],
    transformMode: { web: [/\.[jt]sx?$/] },
  },
  resolve: {
    conditions: ["development", "browser"],
    alias: {
      Assets: path.resolve(__dirname, "./src/assets"),
      Components: path.resolve(__dirname, "./src/components"),
      Constants: path.resolve(__dirname, "./src/constants"),
      Containers: path.resolve(__dirname, "./src/containers"),
      Routes: path.resolve(__dirname, "./src/routes"),
      Stores: path.resolve(__dirname, "./src/stores"),
      Styles: path.resolve(__dirname, "./src/styles"),
      Utils: path.resolve(__dirname, "./src/utils"),
    },
  },
});
