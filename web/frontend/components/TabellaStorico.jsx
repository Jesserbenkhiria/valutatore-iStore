import { useMemo, useState } from "react";
import {
  Badge,
  Card,
  EmptyState,
  IndexTable,
  Pagination,
  Spinner,
  Stack,
  TextStyle,
} from "@shopify/polaris";
import { useAppQuery } from "../hooks";
import { STAT_ITEMS } from "../constants/statsItems";

const ROWS_PER_PAGE = 30;

function formatDateLabel(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const compareDate = new Date(date);
  compareDate.setHours(12, 0, 0, 0);

  const formatted = new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  if (compareDate.getTime() === today.getTime()) {
    return `Oggi (${formatted})`;
  }

  if (compareDate.getTime() === yesterday.getTime()) {
    return `Ieri (${formatted})`;
  }

  return formatted;
}

export function TabellaStorico() {
  const [currentPage, setCurrentPage] = useState(1);

  const statsUrl = useMemo(() => {
    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(ROWS_PER_PAGE),
    });

    return `/api/valutatore/daily-stats?${params.toString()}`;
  }, [currentPage]);

  const { data, isLoading, isError } = useAppQuery({
    url: statsUrl,
  });

  const days = data?.days ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalDays = data?.total ?? 0;

  const rangeStart =
    totalDays === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * ROWS_PER_PAGE, totalDays);

  const resourceName = {
    singular: "giorno",
    plural: "giorni",
  };

  if (isLoading) {
    return (
      <Card sectioned>
        <Stack alignment="center" distribution="center">
          <Spinner accessibilityLabel="Caricamento storico" size="large" />
        </Stack>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card sectioned>
        <TextStyle variation="negative">
          Impossibile caricare lo storico attività.
        </TextStyle>
      </Card>
    );
  }

  if (days.length === 0) {
    return (
      <Card sectioned>
        <EmptyState
          heading="Nessun dato"
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <p>Non ci sono statistiche giornaliere registrate.</p>
        </EmptyState>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Section>
        <TextStyle variation="strong">Storico giornaliero</TextStyle>
      </Card.Section>

      <IndexTable
        resourceName={resourceName}
        itemCount={days.length}
        selectable={false}
        headings={[
          { title: "Data" },
          ...STAT_ITEMS.map((item) => ({ title: item.label })),
        ]}
      >
        {days.map((day, index) => (
          <IndexTable.Row id={day.date} key={day.date} position={index}>
            <IndexTable.Cell>
              <Stack spacing="tight">
                <TextStyle variation="strong">
                  {formatDateLabel(day.date)}
                </TextStyle>
                {day.isToday && <Badge status="info">In corso</Badge>}
              </Stack>
            </IndexTable.Cell>
            {STAT_ITEMS.map((item) => (
              <IndexTable.Cell key={`${day.date}-${item.key}`}>
                {day.stats?.[item.key] ?? 0}
              </IndexTable.Cell>
            ))}
          </IndexTable.Row>
        ))}
      </IndexTable>

      {totalDays > ROWS_PER_PAGE && (
        <Card.Section>
          <Stack distribution="equalSpacing" alignment="center">
            <TextStyle variation="subdued">
              {rangeStart}–{rangeEnd} di {totalDays}
            </TextStyle>
            <Pagination
              hasPrevious={currentPage > 1}
              onPrevious={() => setCurrentPage((page) => page - 1)}
              hasNext={currentPage < totalPages}
              onNext={() => setCurrentPage((page) => page + 1)}
            />
          </Stack>
        </Card.Section>
      )}
    </Card>
  );
}
