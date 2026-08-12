import { defineConfig } from "vite";
import { dirname } from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";
import dotenv from 'dotenv';

dotenv.config();

if (
  process.env.npm_lifecycle_event === "build" &&
  !process.env.CI &&
  !process.env.SHOPIFY_API_KEY
) {
  console.warn(
    "\nBuilding the frontend app without an API key. The frontend build will not run without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command.\n"
  );
}

const backendPort = Number(process.env.BACKEND_PORT);
const frontendPort = Number(process.env.FRONTEND_PORT);

const proxyOptions = {
  target: `http://127.0.0.1:${backendPort}`,
  changeOrigin: false,
  secure: true,
  ws: false,
};

const host = process.env.HOST
  ? process.env.HOST.replace(/https?:\/\//, "")
  : "localhost";

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: frontendPort,
    clientPort: 443,
  };
}

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  plugins: [
    react(),
    {
      name: "inject-shopify-api-key",
      transformIndexHtml(html) {
        return html.replace(
          "%SHOPIFY_API_KEY%",
          process.env.SHOPIFY_API_KEY || ""
        );
      },
    },
  ],
  define: {
    "process.env.SHOPIFY_API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY),
  },
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    host: "0.0.0.0",
    port: frontendPort,
    strictPort: true,
    hmr: hmrConfig,
    proxy: {
      "^/(\\?.*)?$": proxyOptions,
      "^/api/valutazione/list(/|(\\?.*)?$)": proxyOptions,
      "^/api/valutazione/edit/[0-9]+(/|(\\?.*)?$)": proxyOptions,
      "^/api/valutazione/findById/[0-9]+(/|(\\?.*)?$)": proxyOptions,
      "^/api/valutazione/valuta/[0-9]+(/|(\\?.*)?$)": proxyOptions,
      "^/valutatore/[0-9]+/details(\\?.*)?$": proxyOptions,
      "^/valutatore/list(/|(\\?.*)?$)": proxyOptions,
      "^/valutatore/save/valutazione(/|(\\?.*)?$)": proxyOptions,
      "^/api(/|(\\?.*)?$)": proxyOptions,
    },
  },
});