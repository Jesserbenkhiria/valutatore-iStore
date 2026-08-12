import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../.env") });

import { shopifyApp } from "@shopify/shopify-app-express";
import { MySQLSessionStorage } from "@shopify/shopify-app-session-storage-mysql";
import { LATEST_API_VERSION } from "@shopify/shopify-api";

const sessionStorage = new MySQLSessionStorage(process.env.DATABASE_URL, {
  connectionPoolLimit: 10,
});

const { restResources } = await import(
  `@shopify/shopify-api/rest/admin/${LATEST_API_VERSION}`
);

const hostName = (
  process.env.HOST ||
  process.env.SHOPIFY_HOST_NAME ||
  ""
).replace(/^https?:\/\//, "");

const hostScheme =
  process.env.HOST?.startsWith("http://") ||
  process.env.SHOPIFY_HOST_SCHEME === "http"
    ? "http"
    : "https";

const scopes = (process.env.SCOPES || process.env.SHOPIFY_SCOPES || "")
  .split(",")
  .map((scope) => scope.trim())
  .filter(Boolean);

const shopify = shopifyApp({
  api: {
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey:
      process.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_CLIENT_SECRET,
    hostName,
    hostScheme,
    scopes,
    apiVersion: LATEST_API_VERSION,
    restResources,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage,
});

export default shopify;
