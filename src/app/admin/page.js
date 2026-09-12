"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Dynamically import react-quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function AdminPage() {
  const [erps, setErps] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState("");
  const [status, setStatus] = useState({ text: "", type: "" });
  const formRef = useRef(null);

  const quillRef = useRef(null);

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

  const imageHandler = useCallback(() => {
    // Capture the editor's cursor position BEFORE opening the file picker,
    // otherwise the editor loses focus and the range becomes null.
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection(true); // pass true to focus if necessary

    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        setStatus({ text: "Enviando imagem...", type: "loading" });
        const formData = new FormData();
        formData.append('image', file);

        try {
          const response = await fetch('/api/admin/upload-image', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Erro no upload da imagem');
          }

          // Insert the image at the captured cursor position
          editor.insertEmbed(range ? range.index : 0, 'image', data.url);

          // Move the cursor after the inserted image
          if (range) {
             editor.setSelection(range.index + 1);
          }

          setStatus({ text: "Imagem enviada!", type: "success" });

          // Clear status after 3 seconds
          setTimeout(() => setStatus({ text: "", type: "" }), 3000);

        } catch (error) {
          console.error("Erro no upload da imagem inline:", error);
          setStatus({ text: `Erro: ${error.message}`, type: "error" });
        }
      }
    };
  }, []); // useCallback has no dependencies here

  // useMemo prevents the quill editor from completely destroying and remounting on every keystroke
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler]);

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

        /* React Quill Dark Mode Adjustments */
        .ql-toolbar { background-color: #2D3748; border-color: var(--border-color) !important; border-top-left-radius: 4px; border-top-right-radius: 4px; }
        .ql-container { border-color: var(--border-color) !important; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; background-color: var(--bg-color); color: var(--text-white); font-family: inherit; font-size: 16px; height: 300px; }
        .ql-stroke { stroke: #A0AEC0 !important; }
        .ql-fill { fill: #A0AEC0 !important; }
        .ql-picker { color: #A0AEC0 !important; }
        .ql-editor.ql-blank::before { color: #718096 !important; }
        .ql-snow .ql-picker-options { background-color: #2D3748 !important; border-color: var(--border-color) !important; }
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
            <label htmlFor="erpMessage">Corpo do Texto</label>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={message}
              onChange={setMessage}
              placeholder="Escreva o tutorial aqui..."
              modules={modules}
            />
          </div>

          {/* Manter a opção de imagem principal como capa opcional */}
          <div className="form-group">
            <label htmlFor="erpImage">Imagem Principal / Capa (Opcional)</label>
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
