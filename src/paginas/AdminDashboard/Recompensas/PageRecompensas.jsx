import { useState, useEffect } from "react";
import "../admin-common.css";
import "./PageRecompensas.css";
import { DashboardHeader } from "../../../components/dashboardHeader/DashboardHeader";
import { SidebarAdmin } from "../../../components/sidebarAdmin/SidebarAdmin";
import { FaGift } from "react-icons/fa";
import { dashboardService, API_BASE_URL } from "../../../services/api";

export function PageRecompensas() {
  const [recompensas, setRecompensas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ nome: '', descricao: '', valor: '', quantidade: '', imagem: null, imagemPreview: null, empresa: '' });

  const getUserEmpresaId = () => {
    try {
      const raw = localStorage.getItem('user');
      const u = raw ? JSON.parse(raw) : {};
      return u.empresa || u.empresa_id || u.id_empresa || u.empresaId || (u.empresa && (u.empresa.id || u.empresa_id)) || u.id || u._id || null;
    } catch (e) { return null; }
  };

  const adminEmpresaId = getUserEmpresaId();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [recompensasData, empresasData] = await Promise.all([
        dashboardService.getRecompensas(),
        dashboardService.getEmpresas().catch(() => [])
      ]);
      setRecompensas(Array.isArray(recompensasData) ? recompensasData : []);
      try {
        let empresasList = Array.isArray(empresasData) ? empresasData : [];
        const userEmpresaId = getUserEmpresaId();
        if (userEmpresaId) {
          const found = empresasList.find(emp => String(emp.id ?? emp._id ?? emp.id_empresa) === String(userEmpresaId));
          if (found) empresasList = [found];
        }
        setEmpresas(empresasList);
      } catch (e) {
        setEmpresas(Array.isArray(empresasData) ? empresasData : []);
      }
    } catch (err) {
      setError('Erro ao carregar recompensas: ' + (err.response?.data?.message || err.message));
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
        nome: recompensa.nome || '',
        descricao: recompensa.descricao || '',
        valor: recompensa.preco_moedas ?? recompensa.valor ?? '',
        quantidade: recompensa.quantidade_disponivel ?? recompensa.quantidade ?? '',
        imagem: '',
        imagemPreview: (() => {
          const img = recompensa.imagem_path ?? recompensa.imagem ?? null;
          if (!img) return null;
          if (typeof img === 'string') {
            if (img.startsWith('http')) return img;
            if (img.startsWith('/')) return `${String(API_BASE_URL).replace(/\/$/, '')}${img}`;
            return `${String(API_BASE_URL).replace(/\/$/, '')}/${String(img).replace(/^\/+/, '')}`;
          }
          return null;
        })(),
        empresa: recompensa.empresa?.id_empresa || recompensa.empresa || recompensa.id_empresa || ''
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      const userEmpresaId = getUserEmpresaId();
      setFormData({ nome: '', descricao: '', valor: '', quantidade: '', imagem: null, imagemPreview: null, empresa: userEmpresaId || '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ nome: '', descricao: '', valor: '', quantidade: '', imagem: null, imagemPreview: null, empresa: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('nome', formData.nome);
      fd.append('descricao', formData.descricao);
      fd.append('preco_moedas', formData.valor);
      fd.append('valor', formData.valor);
      fd.append('quantidade_disponivel', formData.quantidade);
      if (formData.empresa) {
        fd.append('id_empresa', formData.empresa);
        fd.append('empresa_id', formData.empresa);
      }
      if (formData.imagem instanceof File) {
        fd.append('imagem', formData.imagem);
      } else if (formData.imagemPreview && typeof formData.imagemPreview === 'string') {
        fd.append('imagem_path', formData.imagemPreview);
      }

      try {
        const entries = [];
        for (const en of fd.entries()) entries.push([en[0], en[1] instanceof File ? `[File:${en[1].name}]` : en[1]]);
        console.debug('[PageRecompensas] FormData entries before submit:', entries);
      } catch (logErr) { console.debug('[PageRecompensas] failed to enumerate FormData', logErr); }

      let resp;
      if (isEditing) {
        resp = await dashboardService.updateRecompensa(editingId, fd);
      } else {
        resp = await dashboardService.createRecompensa(fd);
      }
      try { console.debug('[PageRecompensas] server response after save:', resp); } catch (rErr) {}
      await loadData();
      handleCloseModal();
    } catch (err) {
      console.error('PageRecompensas: erro ao salvar', err);
      setError('Erro ao salvar recompensa: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (maybeIdOrObj) => {
    let id = maybeIdOrObj;
    if (typeof maybeIdOrObj === 'object') id = getRecompensaId(maybeIdOrObj);
    if (!id) return setError('ID da recompensa inválido');
    if (!window.confirm('Tem certeza que deseja excluir esta recompensa?')) return;
    try {
      setLoading(true);
      await dashboardService.deleteRecompensa(id);
      await loadData();
    } catch (err) {
      setError('Erro ao excluir recompensa: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <DashboardHeader />
      <div className="admin-layout">
        <SidebarAdmin />
        <div className="admin-dashboard">
          <h1>Recompensas</h1>
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
                      <th>Quantidade</th>
                      <th>Valor</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recompensas.length === 0 ? (
                      <tr><td colSpan="7">Nenhuma recompensa encontrada.</td></tr>
                    ) : (
                      recompensas.map((r, idx) => (
                        <tr key={r.id ?? r._id ?? r.nome ?? idx}>
                          <td>{r.nome || r.titulo || r.descricao}</td>
                          <td>{r.descricao || r.titulo || r.nome}</td>
                          <td>{(r.empresa && r.empresa.nome_empresa) || r.empresa || r.id_empresa || ''}</td>
                          <td>{(() => {
                            const img = r.imagem_path ?? r.imagem ?? null;
                            if (!img) return <span style={{ color: '#aaa' }}>Sem imagem</span>;
                            let src = null;
                            if (typeof img === 'string') {
                              if (img.startsWith('http')) src = img;
                              else if (img.startsWith('/')) src = `${String(API_BASE_URL).replace(/\/$/, '')}${img}`;
                              else src = `${String(API_BASE_URL).replace(/\/$/, '')}/${String(img).replace(/^\/+/, '')}`;
                            }
                            return <img src={src} alt="img" style={{ maxWidth: 60, maxHeight: 60, objectFit: 'cover' }} />;
                          })()}</td>
                          <td>{r.quantidade_disponivel ?? r.quantidade ?? ''}</td>
                          <td>{r.preco_moedas ?? r.valor ?? ''}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-acao editar" onClick={() => handleOpenModal(r)}>Editar</button>
                              <button className="btn-acao excluir" onClick={() => handleDelete(r)}>Excluir</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {showModal && (
              <div className="modal-overlay">
                <div className="modal">
                  <h2>{isEditing ? 'Editar Recompensa' : 'Adicionar Recompensa'}</h2>
                  <form onSubmit={handleSubmit}>
                    <label>Nome:
                      <input type="text" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                    </label>
                    <label>Descrição:
                      <input type="text" value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} required />
                    </label>
                    <label>Quantidade:
                      <input type="number" value={formData.quantidade} onChange={e => setFormData({ ...formData, quantidade: e.target.value })} />
                    </label>
                    <label>Valor (moedas):
                      <input type="number" value={formData.valor} onChange={e => setFormData({ ...formData, valor: e.target.value })} />
                    </label>
                    <label>Empresa:
                      <select value={formData.empresa} onChange={e => setFormData({ ...formData, empresa: e.target.value })} disabled={!!adminEmpresaId}>
                        <option value="">(nenhuma)</option>
                        {empresas.map(emp => (
                          <option key={emp.id ?? emp._id ?? emp.id_empresa} value={emp.id ?? emp._id ?? emp.id_empresa}>{emp.nome_empresa || emp.nome || emp.name || emp.razao_social || String(emp.id || '')}</option>
                        ))}
                      </select>
                    </label>
                    <label>Imagem:
                      <input type="file" accept="image/*" onChange={e => {
                        const f = e.target.files[0];
                        try { setFormData({ ...formData, imagem: f, imagemPreview: f ? URL.createObjectURL(f) : null }); } catch (err) { setFormData({ ...formData, imagem: f }); }
                      }} />
                      {formData.imagemPreview && (
                        <div style={{ marginTop: 8 }}>
                          <img src={formData.imagemPreview} alt="preview" style={{ maxWidth: 140, maxHeight: 100, objectFit: 'cover', borderRadius: 6 }} />
                        </div>
                      )}
                    </label>
                    <div className="modal-actions">
                      <button type="submit" className="btn-acao editar">{isEditing ? 'Salvar' : 'Adicionar'}</button>
                      <button type="button" className="btn-acao excluir" onClick={handleCloseModal}>Cancelar</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}