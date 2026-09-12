"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [erps, setErps] = useState([]);
  const [selectedErp, setSelectedErp] = useState(null);

  useEffect(() => {
    async function loadErps() {
      // In a real app, you would fetch this from Supabase:
      const { data, error } = await supabase
        .from('erps')
        .select('*');

      if (error) {
        console.error("Error fetching ERPs:", error);
      } else {
        setErps(data || []);
      }
    }

    // Check if Supabase env vars are set, if not, put dummy data so UI doesn't crash before user sets it up
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-url') {
       console.log("Supabase not configured yet. Loading dummy data.");
       setErps([
          { name: "SGP" }, { name: "IXC" }, { name: "Hubsoft" }
       ]);
    } else {
       loadErps();
    }
  }, []);

  const handleErpClick = (erp) => {
    setSelectedErp(erp);

    // Smooth scroll
    setTimeout(() => {
      document.getElementById('tutorialContainer')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  return (
    <>
      <header className="header">
        <div className="logo">Azos soft House</div>
      </header>

      <main className="container">
        <h1 className="title">Como obter suas credenciais</h1>
        <p className="subtitle">Selecione seu sistema abaixo para ver o passo a passo.</p>

        <div className="erp-grid">
          {erps.map((erp, i) => (
            <button
              key={i}
              className={`erp-button ${selectedErp?.name === erp.name ? 'active' : ''}`}
              onClick={() => handleErpClick(erp)}
            >
              {erp.name}
            </button>
          ))}
        </div>

        <div className="tutorial-container" id="tutorialContainer">
          {!selectedErp ? (
            <p className="instruction-text">Selecione um sistema acima para ver as instruções.</p>
          ) : (
            <div className="tutorial-content">
              <h2>{selectedErp.title || `${selectedErp.name} — Passo a passo`}</h2>
              <div className="tutorial-steps">
                {selectedErp.message ? (
                  <div dangerouslySetInnerHTML={{ __html: selectedErp.message }} />
                ) : (
                  <p>As instruções para este sistema ainda não foram cadastradas.</p>
                )}

                {selectedErp.image && (
                  <img
                    src={selectedErp.image}
                    alt={`Tutorial ${selectedErp.name}`}
                    className="tutorial-image"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <div className="footer-col">
          <div className="logo">Azos soft House</div>
          <p>Financeiro, Suporte, Wi-Fi, Notificações Inteligentes e Marketplace em um único aplicativo com a marca, as cores e a cara do seu provedor, publicado no iOS e Android.</p>
        </div>
        <div className="footer-col">
          <h4>LEGAL</h4>
          <a href="#">Fale conosco</a>
          <a href="#">Termos de Uso</a>
          <a href="#">Privacidade & LGPD</a>
        </div>
      </footer>
    </>
  );
}
