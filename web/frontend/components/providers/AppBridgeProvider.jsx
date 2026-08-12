import { Banner, Layout, Page } from "@shopify/polaris";

/**
 * Ensures the embedded app has a Shopify API key before rendering.
 * App Bridge is loaded from Shopify's CDN via index.html.
 */
export function AppBridgeProvider({ children }) {
  if (!process.env.SHOPIFY_API_KEY) {
    return (
      <Page narrowWidth>
        <Layout>
          <Layout.Section>
            <div style={{ marginTop: "100px" }}>
              <Banner
                title="Missing Shopify API Key"
                status="critical"
              >
                Your app is running without the SHOPIFY_API_KEY environment
                variable. Please ensure that it is set when running or building
                your React app.
              </Banner>
            </div>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return children;
}
