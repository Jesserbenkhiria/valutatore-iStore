import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  IndexTable,
  Pagination,
  Spinner,
  Stack,
  TextField,
  TextStyle,
  Tooltip,
  Icon,
} from "@shopify/polaris";
import { EditMajor, BarcodeMajor, SearchMajor } from "@shopify/polaris-icons";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { useAuthenticatedFetch } from "../hooks";

const ITEMS_PER_PAGE = 10;

function parseContent(row) {
  try {
    return JSON.parse(row.content);
  } catch {
    return {};
  }
}

function StatusBadge({ active, activeLabel = "Sì", inactiveLabel = "No" }) {
  return (
    <Badge status={active ? "success" : "default"}>
      {active ? activeLabel : inactiveLabel}
    </Badge>
  );
}

function ImeiBadge({ status }) {
  if (status === null || status === undefined) {
    return <Badge>Non controllato</Badge>;
  }
  if (status === true) {
    return <Badge status="success">Valido</Badge>;
  }
  return <Badge status="critical">Non valido</Badge>;
}

export function TabellaValutazione() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");

  const fetchData = async () => {
    try {
      const response = await fetch("/api/valutazione/list");
      const jsonData = await response.json();
      setRows(jsonData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Errore nel caricamento delle valutazioni");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const checkIMEI = useCallback(
    async (imei, id) => {
      try {
        const response = await fetch("/api/check-imei", {
          method: "POST",
          body: JSON.stringify({ imei, id }),
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();

        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, imeiConfermato: data.found } : row
          )
        );

        if (data.data?.id) {
          toast.success(`IMEI già presente: ${data.data.modelName}`);
        } else if (data.found) {
          toast.success(
            `IMEI valido — ${data.modelName}. Saldo: ${data.balance} €`
          );
        } else {
          toast.error("IMEI non valido");
        }
      } catch (error) {
        console.error(error);
        toast.error("Errore durante la verifica IMEI");
      }
    },
    [fetch]
  );

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return rows;

    return rows.filter((row) => {
      const content = parseContent(row);
      const haystack = [
        String(row.id),
        content.nome,
        content.name,
        content.email,
        content.telefono,
        content.phone,
        content.modello,
        content.prezzo,
        content.note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [rows, query]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageRows = filteredRows.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const rangeStart = filteredRows.length === 0 ? 0 : startIndex + 1;
  const rangeEnd = Math.min(startIndex + ITEMS_PER_PAGE, filteredRows.length);

  const resourceName = {
    singular: "valutazione",
    plural: "valutazioni",
  };

  if (isLoading) {
    return (
      <Card sectioned>
        <Stack alignment="center" distribution="center">
          <Spinner accessibilityLabel="Caricamento valutazioni" size="large" />
        </Stack>
      </Card>
    );
  }

  return (
    <Card>
      <Toaster richColors />
      <Card.Section>
        <Stack distribution="equalSpacing" alignment="center">
          <TextStyle variation="strong">Valutazioni effettuate</TextStyle>
          <div style={{ minWidth: "280px", maxWidth: "360px", width: "100%" }}>
            <TextField
              label="Cerca"
              labelHidden
              value={query}
              onChange={setQuery}
              placeholder="Cerca per nome, email, modello..."
              prefix={<Icon source={SearchMajor} color="base" />}
              clearButton
              onClearButtonClick={() => setQuery("")}
              autoComplete="off"
            />
          </div>
        </Stack>
      </Card.Section>

      {filteredRows.length === 0 ? (
        <Card.Section>
          <EmptyState
            heading={query ? "Nessun risultato" : "Nessuna valutazione"}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>
              {query
                ? "Prova a modificare i termini di ricerca."
                : "Le richieste inviate dal valutatore compariranno qui."}
            </p>
          </EmptyState>
        </Card.Section>
      ) : (
        <IndexTable
          resourceName={resourceName}
          itemCount={filteredRows.length}
          selectable={false}
          headings={[
            { title: "ID" },
            { title: "Cliente" },
            { title: "Contatti" },
            { title: "Modello" },
            { title: "Prezzo" },
            { title: "Valutato" },
            { title: "Ritiro" },
            { title: "Contattato" },
            { title: "IMEI" },
            { title: "Azioni" },
          ]}
        >
          {pageRows.map((row, index) => {
            const content = parseContent(row);
            const name = content.nome || content.name || "—";
            const phone = content.telefono || content.phone || "—";

            return (
              <IndexTable.Row id={String(row.id)} key={row.id} position={index}>
                <IndexTable.Cell>
                  <TextStyle variation="strong">#{row.id}</TextStyle>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Stack vertical spacing="extraTight">
                    <TextStyle variation="strong">{name}</TextStyle>
                    {content.note ? (
                      <TextStyle variation="subdued">{content.note}</TextStyle>
                    ) : null}
                  </Stack>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Stack vertical spacing="extraTight">
                    <span>{content.email || "—"}</span>
                    <TextStyle variation="subdued">{phone}</TextStyle>
                  </Stack>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Tooltip content={content.modello || "—"}>
                    <span>{content.modello || "—"}</span>
                  </Tooltip>
                </IndexTable.Cell>
                <IndexTable.Cell>{content.prezzo || "—"}</IndexTable.Cell>
                <IndexTable.Cell>
                  <StatusBadge active={row.valutato} />
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <StatusBadge active={row.ritirato} />
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <StatusBadge active={row.confermato} />
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <ImeiBadge status={row.imeiConfermato} />
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Stack spacing="tight">
                    <Tooltip content="Modifica valutazione">
                      <Button
                        plain
                        icon={EditMajor}
                        onClick={() => navigate(`/${row.id}`)}
                        accessibilityLabel={`Modifica valutazione ${row.id}`}
                      />
                    </Tooltip>
                    <Tooltip content="Verifica IMEI">
                      <Button
                        plain
                        icon={BarcodeMajor}
                        onClick={() => checkIMEI(content.imei, row.id)}
                        accessibilityLabel={`Verifica IMEI ${row.id}`}
                      />
                    </Tooltip>
                  </Stack>
                </IndexTable.Cell>
              </IndexTable.Row>
            );
          })}
        </IndexTable>
      )}

      {filteredRows.length > 0 && (
        <Card.Section>
          <Stack distribution="equalSpacing" alignment="center">
            <TextStyle variation="subdued">
              {rangeStart}–{rangeEnd} di {filteredRows.length}
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
