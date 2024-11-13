import { useParams } from "react-router-dom";
import { Page } from "@shopify/polaris";
import { Loading, TitleBar } from "@shopify/app-bridge-react";
import { useAppQuery } from "../hooks";
import { FormValutazione } from "../components";

export default function EditValutazione() {
  //const breadcrumbs = [{ content: "Modifica Valutazione", url: "/" }];

  const { id } = useParams();
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
  /* Loading action and markup that uses App Bridge and Polaris components */
  if (isLoading || isRefetching) {
    return (
      <Page>
        <TitleBar
          title="Modifica Valutazione"
          breadcrumbs={null}
          primaryAction={null}
        />
        <Loading />
      </Page>
    );
  }
  // Renderizza il componente FormValutazione passando valutazione come prop
  return (
    <Page>
      <TitleBar
        title="Modifica Valutazione"
        breadcrumbs={null}
        primaryAction={null}
      />
      <FormValutazione valutazione={valutazione} />
    </Page>
  );
}
