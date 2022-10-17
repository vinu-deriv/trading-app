import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import { parse } from "path";

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
    outDir: "./dist",
    assetsDir: "./assets",
    manifest: true,
    rollupOptions: {
      input: {
        app: "/index.html",
        sw: "/sw.js",
      },
      output: {
        entryFileNames: (assetInfo) =>
          assetInfo.name === "sw" ? "[name].js" : "assets/js/[name]-[hash].js",
      },
    },
  },
});
