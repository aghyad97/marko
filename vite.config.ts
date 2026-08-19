import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    ...(command === "build"
      ? [dts({ include: ["src"], rollupTypes: true })]
      : []),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Marko",
      fileName: "marko",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
}));
