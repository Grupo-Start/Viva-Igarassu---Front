import { useState, useEffect } from "react";
import "./EmpresaRecompensas.css";
import { DashboardHeader } from "../../../components/dashboardHeader/DashboardHeader";
import { Sidebar } from "../../../components/sidebar/Sidebar";
import { FaGift } from "react-icons/fa";
import { dashboardService, API_BASE_URL } from "../../../services/api";

export function EmpresaRecompensas() {
  const [empresas, setEmpresas] = useState([]);
  const [usuario, setUsuario] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') || {}; } catch (e) { return {}; }
  });
  const [empresaPerfil, setEmpresaPerfil] = useState(() => {
    const u = (function(){ try { return JSON.parse(localStorage.getItem('user')||'null'); } catch(e){ return null } })();
    return u ? (u.empresa || u.empresa_id || u.id_empresa || '') : '';
  });
  const [recompensas, setRecompensas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    valor: "",
    quantidade: "",
    imagem: "",
    imagemPreview: null,
    empresa: ""
  });

  useEffect(() => {
    loadRecompensas();
    dashboardService.getEmpresas().then(data => setEmpresas(Array.isArray(data) ? data : [])).catch(() => setEmpresas([]));

    const onLocalUserChange = () => {
      try {
        const u = JSON.parse(localStorage.getItem('user') || 'null');
        setUsuario(u || {});
        setEmpresaPerfil(u ? (u.empresa || u.empresa_id || u.id_empresa || '') : '');
        setTimeout(() => loadRecompensas(), 50);
      } catch (e) {}
    };
    window.addEventListener('localUserChange', onLocalUserChange);
    return () => window.removeEventListener('localUserChange', onLocalUserChange);
  }, []);

  const loadRecompensas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getRecompensas();
      const all = Array.isArray(data) ? data : [];
      const filtroEmpresa = String(empresaPerfil || '');
      const pertence = (r) => {
        if (!r) return false;
        const id1 = String(r.empresa?.id_empresa || r.empresa_id || r.id_empresa || r.empresa?._id || r.empresa || '');
        const id2 = String(r.id_empresa || r.empresa_id || r.idEmpresa || r.id || '');
        return (filtroEmpresa && (id1 === filtroEmpresa || id2 === filtroEmpresa));
      };
      const filtered = filtroEmpresa ? all.filter(pertence) : all;
      setRecompensas(filtered);
    } catch (err) {
      setError("Erro ao carregar recompensas: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getRecompensaId = (r) => {
    if (!r) return null;
    return r.id ?? r._id ?? r.id_recompensas ?? r.id_recompensa ?? r.idRecompensa ?? r.codigo ?? r.cod ?? null;
  };

  const handleOpenModal = (recompensa = null) => {
    if (recompensa) {
      setIsEditing(true);
      setEditingId(getRecompensaId(recompensa));
      setFormData({
        nome: recompensa.nome || "",
        descricao: recompensa.descricao || "",
        valor: recompensa.preco_moedas ?? recompensa.valor ?? "",
        quantidade: recompensa.quantidade_disponivel ?? recompensa.quantidade ?? "",
        imagem: "",
        imagemPreview: (() => {
          const imgField = recompensa.imagem_path ?? recompensa.imagem ?? null;
          if (imgField && typeof imgField === 'string') {
            if (imgField.startsWith('http')) return imgField;
            if (imgField.startsWith('/')) return `${String(API_BASE_URL).replace(/\/$/, '')}${imgField}`;
            return `${String(API_BASE_URL).replace(/\/$/, '')}/${String(imgField).replace(/^\/+/, '')}`;
          }
          return recompensa.imagem || null;
        })(),
        empresa: recompensa?.empresa?.id_empresa || recompensa?.empresa || empresaPerfil || ""
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({ nome: "", descricao: "", valor: "", quantidade: "", imagem: "", imagemPreview: null });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ nome: "", descricao: "", valor: "", quantidade: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append('nome', formData.nome);
    fd.append('descricao', formData.descricao);
    fd.append('valor', formData.valor);
    fd.append('quantidade', formData.quantidade);
    if (empresaPerfil) fd.append('empresa', empresaPerfil);
    try {
      if (formData.valor != null && formData.valor !== '') {
        fd.append('preco_moedas', formData.valor);
        fd.append('valor_moedas', formData.valor);
      }
      if (formData.quantidade != null && formData.quantidade !== '') {
        fd.append('quantidade_disponivel', formData.quantidade);
        fd.append('quantidade_disponive', formData.quantidade);
        fd.append('qtd', formData.quantidade);
        fd.append('quantidadeDisponivel', formData.quantidade);
      }
      if (empresaPerfil) {
        fd.append('id_empresa', empresaPerfil);
        fd.append('empresa_id', empresaPerfil);
      }
      if (!formData.imagem && formData.imagemPreview && typeof formData.imagemPreview === 'string') {
        fd.append('imagem_path', formData.imagemPreview);
        fd.append('imagemPath', formData.imagemPreview);
      }
    } catch (e) {}

    if (formData.imagem instanceof File) {
      fd.append('imagem', formData.imagem);
    }

    
    const payloadObj = {
      nome: formData.nome,
      descricao: formData.descricao,
      valor: formData.valor,
      preco_moedas: formData.valor,
      quantidade: formData.quantidade,
      quantidade_disponivel: formData.quantidade,
      quantidade_disponive: formData.quantidade,
      id_empresa: empresaPerfil,
      empresa_id: empresaPerfil,
    };
    if (!formData.imagem && formData.imagemPreview && typeof formData.imagemPreview === 'string') {
      payloadObj.imagem_path = formData.imagemPreview;
    }

    
    try {
      const entries = [];
      for (const e of fd.entries()) entries.push([e[0], e[1] instanceof File ? `[File:${e[1].name}]` : e[1]]);
      console.debug('[debug EmpresaRecompensas] FormData entries:', entries);
      console.debug('[debug EmpresaRecompensas] JSON fallback payload:', payloadObj);
    } catch (e) { console.debug('[debug EmpresaRecompensas] failed to log payload', e); }

    try {
      if (isEditing) {
        const hasFile = formData.imagem instanceof File;
        try {
          if (hasFile) {
            await dashboardService.updateRecompensa(editingId, fd, true);
          } else {
            await dashboardService.updateRecompensa(editingId, payloadObj, true);
          }
          loadRecompensas();
          handleCloseModal();
        } catch (err) {
          console.error('EmpresaRecompensas: updateRecompensa erro', err);
          setError('Erro ao atualizar recompensa: ' + (err.response?.data?.message || err.message));
        }
      } else {
        const hasFile = formData.imagem instanceof File;
        try {
          if (hasFile) {
            await dashboardService.createRecompensa(fd, true);
          } else {
            await dashboardService.createRecompensa(payloadObj, true);
          }
          loadRecompensas();
          handleCloseModal();
        } catch (err) {
          console.error('EmpresaRecompensas: createRecompensa erro', err);
          setError("Erro ao criar recompensa: " + (err.response?.data?.message || err.message));
        }
      }
    } catch (finalErr) {
      setError("Erro ao enviar recompensa: " + (finalErr.response?.data?.message || finalErr.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (maybeIdOrRecompensa) => {
    let id = maybeIdOrRecompensa;
    if (typeof maybeIdOrRecompensa === 'object') id = getRecompensaId(maybeIdOrRecompensa);
    if (!id) {
      setError('Não foi possível determinar o id da recompensa para exclusão.');
      return;
    }
    if (!window.confirm("Tem certeza que deseja excluir esta recompensa?")) return;
    setLoading(true);
    setError(null);
    dashboardService.deleteRecompensa(id)
      .then(() => loadRecompensas())
      .catch(err => setError("Erro ao excluir recompensa: " + (err.response?.data?.message || err.message)))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <DashboardHeader />
      <div style={{ display: "flex", overflow: "hidden" }}>
        <Sidebar />
        <div className="empresa-dashboard">
          <h1 className="titulo-admin">Recompensas</h1>
          <div className="dashboard-content">
            <div className="recompensas-header">
              <div className="recompensas-stats">
                <FaGift size={24} color="#5FD6C3" />
                <span>Total de recompensas: {recompensas.length}</span>
              </div>
              <button className="btn-add-recompensa" onClick={() => handleOpenModal()}>
                + Adicionar Recompensa
              </button>
            </div>
            
            {loading && <p className="loading">Carregando recompensas...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && (
              <div className="recompensas-table-container">
                <table className="recompensas-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Descrição</th>
                      <th>Empresa</th>
                      <th>Imagem</th>
                      <th>Quantidade Disponível</th>
                      <th>Valor em Moedas</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                      {recompensas.length === 0 ? (
                        <tr><td colSpan="7">Nenhuma recompensa encontrada.</td></tr>
                      ) : (
                      recompensas.map((recompensa, idx) => (
                        <tr key={recompensa.id ?? recompensa._id ?? recompensa.nome ?? idx}>
                          <td>{recompensa.nome || recompensa.titulo || recompensa.descricao}</td>
                          <td>{recompensa.descricao || recompensa.titulo || recompensa.nome}</td>
                          <td>{recompensa.empresa?.nome_empresa || recompensa.empresa || ''}</td>
                          <td>
                            {(() => {
                              const imgField = recompensa.imagem_path ?? recompensa.imagem ?? null;
                              if (!imgField) return <span style={{ color: '#aaa' }}>Sem imagem</span>;
                              let src = null;
                              if (typeof imgField === 'string') {
                                if (imgField.startsWith('http')) src = imgField;
                                else if (imgField.startsWith('/')) src = `${String(API_BASE_URL).replace(/\/$/, '')}${imgField}`;
                                else src = `${String(API_BASE_URL).replace(/\/$/, '')}/${String(imgField).replace(/^\/+/, '')}`;
                              }
                              return <img src={src} alt="Imagem da recompensa" style={{ maxWidth: 60, maxHeight: 60, objectFit: 'cover' }} />;
                            })()}
                          </td>
                          <td>{recompensa.quantidade_disponivel ?? recompensa.quantidade ?? ''}</td>
                          <td>{recompensa.preco_moedas ?? recompensa.valor ?? ''}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-acao editar" onClick={() => handleOpenModal(recompensa)}>Editar</button>
                              <button className="btn-acao excluir" onClick={() => handleDelete(getRecompensaId(recompensa))}>Excluir</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{isEditing ? "Editar Recompensa" : "Adicionar Recompensa"}</h2>
                <form onSubmit={handleSubmit}>
                  <label>Nome:
                    <input type="text" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                  </label>
                  <label>Descrição:
                    <input type="text" value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} required />
                  </label>
                  <label>Quantidade Disponível:
                    <input type="number" value={formData.quantidade} onChange={e => setFormData({ ...formData, quantidade: e.target.value })} required />
                  </label>
                  <label>Valor em Moedas:
                    <input type="number" value={formData.valor} onChange={e => setFormData({ ...formData, valor: e.target.value })} required />
                  </label>
                  <label>Imagem:
                    <input type="file" accept="image/*" onChange={e => {
                      const f = e.target.files[0];
                      try {
                        const preview = f ? URL.createObjectURL(f) : null;
                        setFormData({ ...formData, imagem: f, imagemPreview: preview });
                      } catch (err) {
                        setFormData({ ...formData, imagem: f });
                      }
                    }} />
                    {formData.imagemPreview && (
                      <div style={{ marginTop: 8 }}>
                        <img src={formData.imagemPreview} alt="preview" style={{ maxWidth: 120, maxHeight: 80, objectFit: 'cover', borderRadius: 6 }} />
                      </div>
                    )}
                  </label>
                  <div className="modal-actions">
                    <button type="submit" className="btn-acao editar">{isEditing ? "Salvar" : "Adicionar"}</button>
                    <button type="button" className="btn-acao excluir" onClick={handleCloseModal}>Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}