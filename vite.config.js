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
    rollupOptions: {
      input: {
        app: "/index.html",
        sw: "/sw.js",
      },
      output: {
        assetFileNames: (asset) => {
          if (parse(asset.name).name === "externalImage") {
            return "images/src/[name][extname]";
          }
          return "assets/[name].[hash][extname]";
        },
      },
    },
  },
});
