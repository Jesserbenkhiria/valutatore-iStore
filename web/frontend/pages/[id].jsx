import { useParams, useNavigate } from "react-router-dom";
import { Page, Layout, Spinner, Stack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useAppQuery } from "../hooks";
import { FormValutazione } from "../components";

export default function EditValutazione() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: valutazione,
    isLoading,
    isRefetching,
  } = useAppQuery({
    url: `/api/valutazione/findById/${id}`,
    reactQueryOptions: {
      refetchOnReconnect: false,
    },
  });

  if (isLoading || isRefetching) {
    return (
      <Page narrowWidth>
        <TitleBar title="Modifica valutazione">
          <a slot="breadcrumb-actions" href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
            Valutazioni
          </a>
        </TitleBar>
        <Layout>
          <Layout.Section>
            <Stack alignment="center" distribution="center">
              <Spinner accessibilityLabel="Caricamento valutazione" size="large" />
            </Stack>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page narrowWidth>
      <TitleBar title={`Valutazione #${id}`}>
        <a slot="breadcrumb-actions" href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }}>
          Valutazioni
        </a>
      </TitleBar>
      <FormValutazione valutazione={valutazione} />
    </Page>
  );
}
