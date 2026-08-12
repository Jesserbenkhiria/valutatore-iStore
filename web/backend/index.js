// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./service/shopify.js";
import GDPRWebhookHandlers from "./service/webHook.js";
import publicRouter from "./routes/publicRoutes.js";
import privateRouter from "./routes/privateRoutes.js";
import { subscriber } from "./service/klaviyo-subscribe.js";
import { initDailyStats } from "./service/dailyStatsScheduler.js";

const PORT = parseInt(
  process.env.BACKEND_PORT ||
    process.env.PORT ||
    (process.env.NODE_ENV === "production" ? "8081" : ""),
  10
);

if (!PORT) {
  throw new Error(
    "BACKEND_PORT is not set. Run the app with `shopify app dev` or set BACKEND_PORT/PORT."
  );
}

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Increase limits for multipart form data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Add middleware to handle large multipart requests
app.use((req, res, next) => {
  res.setTimeout(300000); // 5 minutes timeout
  next();
});

//subscriber.verifyValutazioneSub()

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);
app.use(publicRouter);
// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());
app.use(privateRouter);

app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT, () => {
  initDailyStats();
});
