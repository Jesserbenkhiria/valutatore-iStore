import { Layout, Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { TabellaValutazione, StatsValutatore } from "../components";

export default function HomePage() {
  return (
    <Page fullWidth>
      <TitleBar title="Valutatore iStore" />
      <Layout>
        <Layout.Section>
          <StatsValutatore />
        </Layout.Section>
        <Layout.Section>
          <TabellaValutazione />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
