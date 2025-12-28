import { useState, useEffect } from "react";
import "../admin-common.css";
import "./PageRecompensas.css";
import { DashboardHeader } from "../../../components/dashboardHeader/DashboardHeader";
import { SidebarAdmin } from "../../../components/sidebarAdmin/SidebarAdmin";
import { FaGift } from "react-icons/fa";
import { dashboardService } from "../../../services/api";

export function PageRecompensas() {
  const usuario = JSON.parse(localStorage.getItem('user') || '{}');
  const empresaPerfil = usuario.empresa || usuario.empresa_id || usuario.id_empresa || '';
  const [empresas, setEmpresas] = useState([]);
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
    empresa: ""
  });

  useEffect(() => {
    loadRecompensas();
    dashboardService.getEmpresas().then(data => setEmpresas(Array.isArray(data) ? data : [])).catch(() => setEmpresas([]));
  }, []);

  const loadRecompensas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getRecompensas();
      setRecompensas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Erro ao carregar recompensas: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (recompensa = null) => {
    if (recompensa) {
      setIsEditing(true);
      setEditingId(recompensa.id ?? recompensa._id ?? recompensa.id_recompensas ?? recompensa.id_recompensa ?? recompensa.idRecompensa ?? recompensa.codigo ?? recompensa.cod ?? null);
      setFormData({
        nome: recompensa.nome || "",
        descricao: recompensa.descricao || "",
        valor: recompensa.preco_moedas ?? recompensa.valor ?? "",
        quantidade: recompensa.quantidade_disponivel ?? recompensa.quantidade ?? "",
        imagem: "",
        empresa: recompensa?.empresa?.id_empresa || recompensa?.empresa || empresaPerfil || ""
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({ nome: "", descricao: "", valor: "", quantidade: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ nome: "", descricao: "", valor: "", quantidade: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append('nome', formData.nome);
    fd.append('descricao', formData.descricao);
    fd.append('valor', formData.valor);
    fd.append('quantidade', formData.quantidade);
    if (formData.imagem instanceof File) {
      fd.append('imagem', formData.imagem);
    }
    if (isEditing) {
      dashboardService.updateRecompensa(editingId, fd)
        .then(() => {
          loadRecompensas();
          handleCloseModal();
        })
        .catch(err => setError("Erro ao editar recompensa: " + (err.response?.data?.message || err.message)))
        .finally(() => setLoading(false));
    } else {
      dashboardService.createRecompensa(fd)
        .then(() => {
          loadRecompensas();
          handleCloseModal();
        })
        .catch(err => setError("Erro ao criar recompensa: " + (err.response?.data?.message || err.message)))
        .finally(() => setLoading(false));
    }
  };

  const handleDelete = (id) => {
    let resolvedId = id;
    if (typeof id === 'object') resolvedId = (id.id ?? id._id ?? id.id_recompensas ?? id.id_recompensa ?? id.idRecompensa ?? id.codigo ?? id.cod ?? null);
    if (!resolvedId) {
      setError('Não foi possível determinar o id da recompensa para exclusão.');
      return;
    }
    if (!window.confirm("Tem certeza que deseja excluir esta recompensa?")) return;
    setLoading(true);
    setError(null);
    console.debug('Excluindo recompensa id:', resolvedId);
    dashboardService.deleteRecompensa(resolvedId)
      .then(() => loadRecompensas())
      .catch(err => setError("Erro ao excluir recompensa: " + (err.response?.data?.message || err.message)))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <DashboardHeader />
      <div style={{ display: "flex", overflow: "hidden" }}>
        <SidebarAdmin />
        <div className="admin-dashboard">
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
                      <tr><td colSpan="5">Nenhuma recompensa encontrada.</td></tr>
                    ) : (
                      recompensas.map((recompensa, idx) => (
                        <tr key={recompensa.id ?? recompensa._id ?? recompensa.nome ?? idx}>
                          <td>{recompensa.nome || recompensa.titulo || recompensa.descricao}</td>
                          <td>{recompensa.descricao || recompensa.titulo || recompensa.nome}</td>
                          <td>{recompensa.empresa?.nome_empresa || recompensa.empresa || ''}</td>
                          <td>
                            {recompensa.imagem ? (
                              <img src={recompensa.imagem} alt="Imagem da recompensa" style={{ maxWidth: 60, maxHeight: 60, objectFit: 'cover' }} />
                            ) : (
                              <span style={{ color: '#aaa' }}>Sem imagem</span>
                            )}
                          </td>
                          <td>{recompensa.quantidade_disponivel ?? recompensa.quantidade ?? ''}</td>
                          <td>{recompensa.preco_moedas ?? recompensa.valor ?? ''}</td>
                              <td>
                                <div className="action-buttons">
                                  <>
                                    <button className="btn-acao editar" onClick={() => handleOpenModal(recompensa)}>Editar</button>
                                    <button className="btn-acao excluir" onClick={() => handleDelete(recompensa.id ?? recompensa._id ?? recompensa.id_recompensas ?? recompensa.id_recompensa ?? recompensa.idRecompensa ?? recompensa.codigo ?? recompensa.cod)}>Excluir</button>
                                  </>
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
                    <input type="file" accept="image/*" onChange={e => setFormData({ ...formData, imagem: e.target.files[0] })} />
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
