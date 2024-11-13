import React, { useState, useEffect } from "react";
import { DisplayText, Spinner } from "@shopify/polaris";
import { useAppQuery, useAuthenticatedFetch } from "../hooks"; // Assuming you have these custom hooks

export function StatsValutatore() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [error, setError] = useState(null);

  const fetch = useAuthenticatedFetch(); // Custom hook for authenticated fetch

  const {
    data,
    refetch: refetchProductStats,
    isLoading: isLoadingStats,
    isRefetching: isRefetchingStats,
  } = useAppQuery({
    url: "/api/valutatore/get-stats", // Replace with actual API endpoint
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
      onError: (err) => {
        setError(err.message || "Failed to fetch data");
        setIsLoading(false);
      },
    },
  });

  useEffect(() => {
    // Update stats when data changes
    if (data && data.stats) {
      setStats(data.stats);
    }
  }, [data]);

  useEffect(() => {
    // Initial fetch of data
    refetchProductStats();
  }, []);

  return (
    
      <div style={{marginTop:'10px',marginBottom:"25px"}}>
        <div style={{paddingLeft:"20px"}}>
          <h1 style={{fontSize:"20px",fontWeight:"500"}} >Statistiche di oggi</h1>
        </div>
        {isLoadingStats ? (
          <Spinner size="small" accessibilityLabel="Loading" />
        ) : error ? (
          <p>{error}</p>
        ) : (
             <div style={{display:"flex",justifyContent:"space-around",marginTop:'10px',marginBottom:"15px"}}>
                <div style={{display:"flex",alignItems:"center"}}>
                  <p style={{ fontWeight: 'bold' ,fontSize:"20px",marginRight:"5px" }}>Visite al valutatore : </p>
                  <DisplayText size="large">{stats.VISITA_PAGINA || 0}</DisplayText>
                </div>
                <div style={{display:"flex",alignItems:"center"}}>
                  <p style={{ fontWeight: 'bold' ,fontSize:"20px",marginRight:"5px" }}>Dettagli Controllati:</p>
                  <DisplayText size="large">{stats.DETTAGLI_CONSULTATI || 0}</DisplayText>
                </div>
                <div style={{display:"flex",alignItems:"center"}}>
                  <p style={{ fontWeight: 'bold' ,fontSize:"20px",marginRight:"5px" }}>Valutazione Ricevute:</p>
                  <DisplayText size="large">{stats.VALUTAZIONI_RICEVUTE || 0}</DisplayText>
                </div>
                </div>
        
         
        )}
      </div>
 
  );
}
