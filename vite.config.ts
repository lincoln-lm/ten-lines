import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
    assetsInclude: ["**/*.bin"],
    plugins: [react()],
    build: {
        minify: false,
    },
    base: "/ten-lines/",
});
