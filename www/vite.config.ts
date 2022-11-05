import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [],
  root: "src",
  build: {
    outDir: "../dist",
  },
  resolve: {
    alias: {
      lib: resolve("./src/lib"),
      sketch: resolve("./src/sketch"),
      theme: resolve("./src/theme"),
    }
  }
});
