import { Layout, Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { TabellaStorico } from "../components";

export default function HistoryPage() {
  return (
    <Page fullWidth>
      <TitleBar title="History" />
      <Layout>
        <Layout.Section>
          <TabellaStorico />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
