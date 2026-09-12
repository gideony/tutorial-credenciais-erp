"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [erps, setErps] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [status, setStatus] = useState({ text: "", type: "" });
  const formRef = useRef(null);

  // Form states
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);

  const loadErps = async () => {
    // Basic check for empty config
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-url') {
        setStatus({ text: "Aviso: Supabase não configurado. Banco de dados offline.", type: "error" });
        return;
    }

    const { data, error } = await supabase.from("erps").select("*").order("name");
    if (!error && data) {
      setErps(data);
    }
  };

  useEffect(() => {
    loadErps();
  }, []);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    setSelectedIndex(val);

    if (val === "") {
      setName("");
      setTitle("");
      setMessage("");
      setFile(null);
      if (formRef.current) formRef.current.reset();
    } else {
      const erp = erps[val];
      setName(erp.name);
      setTitle(erp.title || "");
      setMessage(erp.message || "");
      setFile(null);
    }
    setStatus({ text: "", type: "" });
  };

  const handleDelete = async () => {
    if (selectedIndex === "") return;
    const erp = erps[selectedIndex];

    if (confirm(`Tem certeza que deseja remover o ERP: ${erp.name}?`)) {
      setStatus({ text: "Removendo...", type: "loading" });

      try {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('name', erp.name);

        const response = await fetch('/api/admin/erps', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erro desconhecido');
        }

        setStatus({ text: "ERP removido com sucesso!", type: "success" });
        setSelectedIndex("");
        setName("");
        setTitle("");
        setMessage("");
        setFile(null);
        if (formRef.current) formRef.current.reset();
        await loadErps();
      } catch (error) {
        setStatus({ text: `Erro ao remover ERP: ${error.message}`, type: "error" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ text: "Salvando...", type: "loading" });

    try {
      const formData = new FormData();
      formData.append('action', 'save');
      formData.append('name', name);
      formData.append('title', title);
      formData.append('message', message);

      const isUpdate = selectedIndex !== "";
      formData.append('isUpdate', isUpdate);

      if (isUpdate) {
        formData.append('originalName', erps[selectedIndex].name);
        if (erps[selectedIndex].image) {
          formData.append('currentImage', erps[selectedIndex].image);
        }
      }

      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('/api/admin/erps', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro desconhecido ao salvar ERP');
      }

      setStatus({ text: "ERP salvo com sucesso!", type: "success" });
      if (selectedIndex === "") {
          setName("");
          setTitle("");
          setMessage("");
          setFile(null);
          if (formRef.current) formRef.current.reset();
      }
      await loadErps();
    } catch (error) {
      console.error("Save error", error);
      setStatus({ text: `Erro ao salvar ERP: ${error.message}`, type: "error" });
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .admin-container { max-width: 600px; margin: 40px auto; padding: 20px; background: #1A202C; border-radius: 8px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; color: var(--primary-green); }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-white); }
        .form-group textarea { height: 150px; }
        .submit-btn { background-color: var(--primary-green); color: var(--bg-color); padding: 10px 20px; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; width: 100%; }
        .submit-btn:hover { background-color: #02a384; }
        .status-msg { margin-top: 15px; text-align: center; font-weight: bold; }
        .status-loading { color: var(--text-gray); }
        .status-success { color: var(--primary-green); }
        .status-error { color: #e53e3e; }
      `}} />

      <header className="header">
        <div className="logo">Azos soft House (Admin)</div>
        <nav className="nav">
          <Link href="/">← Voltar para o site</Link>
        </nav>
      </header>

      <div className="admin-container">
        <h2>Gerenciar ERPs</h2>

        <div className="form-group">
          <label htmlFor="erpSelect">Selecione um ERP para editar/remover (ou deixe vazio para criar um novo)</label>
          <select id="erpSelect" value={selectedIndex} onChange={handleSelectChange}>
            <option value="">-- Criar Novo ERP --</option>
            {erps.map((erp, idx) => (
              <option key={idx} value={idx}>{erp.name}</option>
            ))}
          </select>

          {selectedIndex !== "" && (
              <button
                type="button"
                onClick={handleDelete}
                className="submit-btn"
                style={{ backgroundColor: "#e53e3e", marginTop: "15px" }}>
                Remover ERP Selecionado
              </button>
          )}
        </div>

        <hr style={{ border: "1px solid var(--border-color)", margin: "20px 0" }} />

        <h2 id="formTitle">{selectedIndex === "" ? "Cadastrar Novo ERP" : `Editar ERP: ${name}`}</h2>

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="erpName">Nome do ERP (Ex: SGP, IXC)</label>
            <input
              type="text"
              id="erpName"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={selectedIndex !== ""}
            />
          </div>

          <div className="form-group">
            <label htmlFor="erpTitle">Título do Passo a Passo</label>
            <input
              type="text"
              id="erpTitle"
              placeholder="Ex: SGP — Passo a passo"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="erpMessage">Corpo do Texto (Você pode usar tags HTML como &lt;p&gt; e &lt;strong&gt;)</label>
            <textarea
              id="erpMessage"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="erpImage">Imagem do Tutorial</label>
            <input
              type="file"
              id="erpImage"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <button type="submit" className="submit-btn">Salvar Configuração</button>

          {status.text && (
            <p className={`status-msg status-${status.type}`}>{status.text}</p>
          )}
        </form>
      </div>
    </>
  );
}
