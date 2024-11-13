import React, { useState, useEffect, useCallback } from 'react';
import { Tooltip, Card, DataTable, Spinner, Layout, Icon, Pagination } from '@shopify/polaris'; // Importa Pagination da Polaris
import { useAuthenticatedFetch } from '../hooks';
import { Link } from 'react-router-dom';
import { EditMajor , BarcodeMajor } from '@shopify/polaris-icons';
import { Toaster,toast} from 'sonner';
export function TabellaValutazione() {
  const fetch = useAuthenticatedFetch();
  const [rows, setRows] = useState([]);
  const [missing, setMissing] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Stato per gestire la pagina corrente
  const itemsPerPage = 10; // Numero di elementi per pagina

  const fetchData = async () => {
    try {
      const data = await fetch('/api/valutazione/list');
      const jsonData = await data.json();
      setRows(jsonData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };
  const missingData = async () => {
    try {
      const data = await fetch('/api/valutazione/missing');
      const jsonData = await data.json();
      setMissing(jsonData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };
  console.log("Missing ",missing);
  
  useEffect(() => {
    fetchData();
    // missingData()
  }, []);

 const checkIMEI = useCallback(
    async (imei,id) => {
      const parsedBody = {
        imei: imei,
        id:id
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
        console.log("Response data:", data.found);
        updateRow(id,data.found)
        if(data.data.id){
          console.log("data.data",data);
          toast.success(`IMEI ${data.data.modelName} already exists.`)
        }else if(data.found){
          console.log("data.data",data);
          toast.success("IMEI checked Model "+ data.modelName +" Your Balance is "+data.balance+" € ")
        }else{
          toast.error("IMEI not Valid")
        }
      } catch (error) {
        console.log(error);
      }
    }, []
  );

  const updateRow = (id, state) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      const index = updatedRows.findIndex((row) => row.id === id);
      if (index !== -1) {
        updatedRows[index] = {
          ...updatedRows[index],
          imeiConfermato: state,
        };
      }
      return updatedRows;
    });
  };



  if (isLoading) {
    return (
      <Card sectioned>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
          <Spinner accessibilityLabel="Loading" size="large" color="teal" />
          <p style={{ marginLeft: '20px' }}>Loading data...</p>
        </div>
      </Card>
    );
  }

  // Calcola gli indici di inizio e fine per la pagina corrente
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;
  const truncateText = (text, maxLength) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };
  return (
    <Layout title="Valutazioni Effettuate">
      <Toaster richColors/>
      <Layout.Section>
        <Card sectioned fullWidth>
          <DataTable
            columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text', 'text', 'text']}
            headings={[
              <strong>Id</strong>,
              <strong>Nome</strong>,
              <strong>Email</strong>,
              <strong>Telefono</strong>,
              <strong>Modello</strong>,
              <strong>Prezzo</strong>,
              <strong>Note</strong>,
              <strong>Valutato</strong>,
              <strong>Ritiro Organizzato</strong>,
              <strong>Contattato</strong>,
              <strong>IMEI Status</strong>,
              <strong>Azioni</strong>,
              ,

            ]} 
            rows={rows.slice(startIndex, endIndex).map((row) => {
              const parsedContent = JSON.parse(row.content);
              return [
                row.id,
                <Tooltip content={parsedContent.nome || parsedContent.name}>
                  <span>{truncateText(parsedContent.nome || parsedContent.name, 20)}</span>
                </Tooltip>,
                parsedContent.email,
                parsedContent.telefono || parsedContent.phone,
                <Tooltip content={parsedContent.modello}>
                  <span>{truncateText(parsedContent.modello, 20)}</span>
                </Tooltip>,
                parsedContent.prezzo,
                parsedContent.note || "",
                row.valutato ? 'Si' : 'No',
                row.ritirato ? 'Si' : 'No',
                row.confermato ? 'Si' : 'No',
                row.imeiConfermato === null ? "Non controllato" : row.imeiConfermato === true ? "Valido" : "Non valido"  ,
                [<Tooltip key={`tooltip-${row.id}`} content="Modifica">
                  <Link to={`/${row.id}`}><Icon source={EditMajor} color="inkLighter" />
                  </Link>
                </Tooltip>
                ],
                [
                <div content="check Imei" id='imeicheck' style={{cursor:"pointer"}} onClick={()=>{checkIMEI(parsedContent.imei,row.id)}}>
                <Icon
                  source={BarcodeMajor}
                  tone="base"
                />
                </div>
                ],
              ];
            })}
          />
          {/* Aggiungi la paginazione sopra o sotto la tabella */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Pagination
              hasPrevious={currentPage > 1}
              onPrevious={() => setCurrentPage((prev) => prev - 1)}
              hasNext={endIndex < rows.length}
              onNext={() => setCurrentPage((prev) => prev + 1)}
            />
          </div>
        </Card>
      </Layout.Section>
    </Layout>
  );
}
