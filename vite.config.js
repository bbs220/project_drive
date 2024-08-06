// vite.config.js
import glsl from "vite-plugin-glsl";
import wasm from "vite-plugin-wasm";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [wasm(), glsl()],
});
