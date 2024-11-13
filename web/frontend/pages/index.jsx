import { Layout, Frame, Badge, Navigation } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import { TabellaValutazione, StatsValutatore } from "../components";
import { useState } from "react";

export default function HomePage() {
  const [unreadCount, setUnreadCount] = useState(3);
  return (
    <Frame>
     {/* <Navigation location="/">
      <Navigation.Section
        items={[
          {
            url: '/',
            label: 'Orders',
            badge: <Badge status="attention">3</Badge>, // Example badge
          },
          // Add more navigation items here
        ]}
      />
    </Navigation> */}
    <TitleBar title="valutatore-istore" />
      <Layout>
        <Layout.Section>
          <StatsValutatore />
          <TabellaValutazione />
        </Layout.Section>
      </Layout>
    </Frame>
  );
}
