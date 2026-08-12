import { useEffect } from "react";
import { Layout, TextStyle, Card } from "@shopify/polaris";
import { useAppQuery } from "../hooks";
import { STAT_ITEMS } from "../constants/statsItems";
import { StatCard } from "./StatCard";

export function StatsValutatore() {
  const {
    data,
    refetch: refetchProductStats,
    isLoading: isLoadingStats,
    isError,
  } = useAppQuery({
    url: "/api/valutatore/get-stats",
  });

  useEffect(() => {
    refetchProductStats();
  }, [refetchProductStats]);

  const stats = data?.stats ?? {};

  return (
    <Layout>
      {STAT_ITEMS.map((item) => (
        <Layout.Section oneThird key={item.key}>
          <StatCard
            label={item.label}
            help={item.helpToday}
            value={stats[item.key] ?? 0}
            loading={isLoadingStats}
          />
        </Layout.Section>
      ))}
      {isError && (
        <Layout.Section>
          <Card sectioned>
            <TextStyle variation="negative">
              Impossibile caricare le statistiche di oggi.
            </TextStyle>
          </Card>
        </Layout.Section>
      )}
    </Layout>
  );
}
