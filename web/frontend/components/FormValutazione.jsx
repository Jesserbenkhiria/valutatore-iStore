import React, { useState, useEffect, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Button,
  Select,
  Stack,
  Frame,
  Toast,
  Banner,
  Spinner,
} from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { useAuthenticatedFetch } from "../hooks";

export function FormValutazione({ valutazione }) {
  const [formData, setFormData] = useState({
    id: "",
    nome: "",
    email: "",
    telefono: "",
    indirizzo: "",
    modello: "",
    accessori: "",
    imei: "",
    stato_batteria: "",
    stato_estetico: "",
    stato_schermo: "",
    valutato: 0,
    confermato: 0,
    ritirato: 0,
    note: "",
    prezzo: "",
    urlImg: "", // Aggiunto campo urlImg
  });
  const [initialFormData, setInitialFormData] = useState(null); // Stato per tenere traccia dei dati iniziali
  const [showToast, setShowToast] = useState(false);
  const [toastContent, setToastContent] = useState("");
  const [valutatoAlert, setValutatoAlert] = useState(false);
  const [isValutato, setIsValutato] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Stato per controllare modifiche non salvate
  const [isLoading, setIsLoading] = useState(false); // State to track loading state
  const navigate = useNavigate();
  const fetch = useAuthenticatedFetch();
  useEffect(() => {
    if (valutazione) {
      const content = JSON.parse(valutazione.content);

      const initialData = {
        id: valutazione.id,
        nome: content.nome || content.name || "",
        email: content.email || "",
        telefono: content.telefono || content.phone || "",
        indirizzo: content.indirizzo || "",
        modello: content.modello || "",
        accessori: content.accessori || "",
        imei: content.imei || "",
        stato_batteria: content.stato_batteria || "",
        stato_estetico: content.stato_estetico || "",
        stato_schermo: content.stato_schermo || "",
        valutato: valutazione.valutato || false,
        ritirato: valutazione.ritirato || 0,
        confermato: valutazione.confermato || 0,
        note: content.note || "",
        prezzo: content.prezzo || "",
        urlImg: content.urlImg || "", // Aggiunto campo urlImg
      };
      setFormData(initialData);
      setInitialFormData(initialData); // Imposta i dati iniziali
    }
  }, [valutazione]);

  useEffect(() => {
    setValutatoAlert(formData.valutato === true);
    setIsValutato(formData.valutato === true);
  }, [formData.valutato]);

  useEffect(() => {
    if (initialFormData) {
      const hasChanges = Object.keys(initialFormData).some(
        (key) => initialFormData[key] !== formData[key]
      );
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, initialFormData]);

  const handleTextChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleChange = (field) => (value) => {
    const parsedValue = isNaN(parseInt(value, 10)) ? "" : parseInt(value, 10);
    setFormData({ ...formData, [field]: parsedValue });
  };

  const onSubmit = useCallback(async () => {
    const { confermato, ritirato, valutato, ...formDataSenzaFlag } = formData;
    const parsedBody = {
      id: formData.id,
      confermato,
      ritirato,
      valutato,
      content: JSON.stringify(formDataSenzaFlag),
    };
    const url = "/api/valutazione/edit/" + formData.id;
    const method = "PUT";
    const response = await fetch(url, {
      method,
      body: JSON.stringify(parsedBody),
      headers: { "Content-Type": "application/json" },
    });
    if (response.ok) {
      setShowToast(true);
      setToastContent("Valutazione modificata con successo!");
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
      setInitialFormData(formData); // Aggiorna i dati iniziali
      setHasUnsavedChanges(false); // Reimposta lo stato delle modifiche non salvate
    } else {
      setShowToast(true);
      setToastContent("Si è verificato un errore. Riprova più tardi.");
    }
  }, [formData, fetch, navigate]);
  console.log(formData);

  const handleValuta = useCallback(async () => {
    setIsLoading(true); // Set loading state to true when button is clicked
    setIsValutato(true);
    try {
      const id = formData.id;
      const url = `/api/valutazione/valuta/${id}`;
      const method = "PUT";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updatedValutazione = await response.json();
        if (updatedValutazione && updatedValutazione.content) {
          setValutatoAlert(updatedValutazione.valutato === true);
          setIsValutato(updatedValutazione.valutato === true);

          // Update form data with all fields from updatedValutazione
          const updatedFormData = {
            ...formData,
            ...JSON.parse(updatedValutazione.content),
          };
          setFormData(updatedFormData);
        } else {
          console.error("Invalid data format in response:", updatedValutazione);
        }
      } else {
        console.error("Errore durante la valutazione della valutazione");
      }
    } catch (error) {
      console.error("Errore durante la valutazione della valutazione:", error);
    } finally {
      setIsLoading(false); // Reset loading state after operation completes
    }
  }, [formData, fetch]);

  const toastMarkup = showToast && (
    <Toast content={toastContent} onDismiss={() => setShowToast(false)} />
  );

  const handleGoBack = () => {
    navigate("/");
  };

  const checkIMEI = useCallback(async (imei) => {
    console.log(formData);
    const parsedBody = {
      imei: imei,
      id: valutazione.id,
    };
    const url = "/api/check-imei";
    const method = "POST";
    try {
      const response = await fetch(url, {
        method,
        body: JSON.stringify(parsedBody),
        headers: { "Content-Type": "application/json" },
   
      });
      const data = await response.json();
      console.log("Response data:", data);
    } catch (error) {
      console.log(error);
    }
  }, []);
  return (
    <Frame>
      {toastMarkup}
      <Page title="Modifica Valutazione">
        <Layout>
          <Layout.Section>
            <Card sectioned>
              {valutatoAlert && <Banner title="Valutato" status="info" />}
              {hasUnsavedChanges && (
                <Banner
                  title="Modifiche non salvate"
                  status="warning"
                  action={{ content: "Salva", onAction: onSubmit }}
                >
                  <p>
                    Hai delle modifiche non salvate. Salva le modifiche per non
                    perdere i dati inseriti.
                  </p>
                </Banner>
              )}
              <FormLayout>
                <Stack distribution="fill" spacing="loose">
                  <TextField
                    label={<strong>Nome</strong>}
                    value={formData.nome}
                    onChange={handleTextChange("nome")}
                    disabled={isValutato}
                  />
                  <TextField
                    label={<strong>Email</strong>}
                    type="email"
                    value={formData.email}
                    onChange={handleTextChange("email")}
                    disabled={isValutato}
                  />
                </Stack>
                <Stack distribution="fill" spacing="loose">
                  <TextField
                    label={<strong>Prezzo</strong>}
                    value={formData.prezzo}
                    onChange={handleTextChange("prezzo")}
                    disabled={isValutato}
                  />
                  <TextField
                    label={<strong>Telefono</strong>}
                    value={formData.telefono}
                    onChange={handleTextChange("telefono")}
                    disabled={isValutato}
                  />
                  <TextField
                    label={<strong>Indirizzo</strong>}
                    value={formData.indirizzo}
                    onChange={handleTextChange("indirizzo")}
                    disabled={isValutato}
                  />
                </Stack>
                <Stack distribution="fill" spacing="loose">
                  <Select
                    label={<strong>Ritiro Organizzato</strong>}
                    options={[
                      { label: "Si", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                    value={formData.ritirato}
                    onChange={handleChange("ritirato")}
                    disabled={isValutato}
                  />
                  <Select
                    label={<strong>Contattato</strong>}
                    options={[
                      { label: "Si", value: 1 },
                      { label: "No", value: 0 },
                    ]}
                    value={formData.confermato}
                    onChange={handleChange("confermato")}
                    disabled={isValutato}
                  />
                </Stack>
                <Stack distribution="fill" spacing="loose">
                  <TextField
                    label={<strong>Modello</strong>}
                    value={formData.modello}
                    onChange={handleTextChange("modello")}
                    disabled={isValutato}
                  />
                  <div style={{ position: "relative" }}>
                    <TextField
                      label={<strong>IMEI</strong>}
                      value={formData.imei}
                      onChange={handleTextChange("imei")}
                      disabled={isValutato || valutazione.imeiConfermato === 1}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: "44px",
                        top: "31px",
                        zIndex: "100",
                      }}
                    >
                      {valutazione.imeiConfermato === null
                        ? "Non controllato"
                        : valutazione.imeiConfermato === 1
                        ? " Valido"
                        : " Non valido"}
                    </span>
                    {/* <button style={{ width: "100px", marginTop: "5px", background: "#3b985e", color: "white", padding: "7px 10px", border: "none", fontWeight: "500" }} onClick={() => { checkIMEI(formData.imei) }}>Check</button> */}
                  </div>
                </Stack>
                <Stack distribution="fill" spacing="loose">
                  <TextField
                    label={<strong>Stato Batteria</strong>}
                    value={formData.stato_batteria}
                    onChange={handleTextChange("stato_batteria")}
                    disabled={isValutato}
                  />
                  <TextField
                    label={<strong>Stato Estetico</strong>}
                    value={formData.stato_estetico}
                    onChange={handleTextChange("stato_estetico")}
                    disabled={isValutato}
                  />
                  <TextField
                    label={<strong>Stato Schermo</strong>}
                    value={formData.stato_schermo}
                    onChange={handleTextChange("stato_schermo")}
                    disabled={isValutato}
                  />
                </Stack>
                <Stack distribution="fill" spacing="loose">
                  <TextField
                    label={<strong>Accessori</strong>}
                    value={formData.accessori}
                    onChange={handleTextChange("accessori")}
                    disabled={isValutato}
                  />
                  <TextField
                    label={<strong>Note</strong>}
                    value={formData.note}
                    onChange={handleTextChange("note")}
                    disabled={isValutato}
                  />
                </Stack>
                <Layout.Section>
                  <Stack distribution="trailing">
                    <Button onClick={handleValuta} primary>
                      {isLoading ? (
                        <Spinner size="small" color="white" />
                      ) : isValutato ? (
                        "Sblocca Valutazione"
                      ) : (
                        "Conferma Valutazione"
                      )}
                    </Button>
                    <Button onClick={handleGoBack}>Indietro</Button>
                  </Stack>
                </Layout.Section>
              </FormLayout>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
