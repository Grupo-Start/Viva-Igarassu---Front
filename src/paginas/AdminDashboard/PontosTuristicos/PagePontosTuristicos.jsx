import { useState, useEffect } from "react";
import "../admin-common.css";
import "./PagePontosTuristicos.css";
import { DashboardHeader } from "../../../components/dashboardHeader/DashboardHeader";
import { SidebarAdmin } from "../../../components/sidebarAdmin/SidebarAdmin";
import { MdLocationOn } from "react-icons/md";
import { dashboardService } from "../../../services/api";
import { Pagination } from "../../../components/pagination/Pagination";

export function PagePontosTuristicos() {
  const [pontos, setPontos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    tipo: '',
    descricao: '',
    horario_funcionamento: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tipos = [
    { value: 'historico', label: 'Histórico' },
    { value: 'natural', label: 'Natural' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'outro', label: 'Outro' }
  ];

  useEffect(() => {
    loadPontosTuristicos();
  }, []);

  const loadPontosTuristicos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getPontosTuristicos();
      try { console.log('[debug loadPontosTuristicos] data:', data); } catch (e) {}
      const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      try {
        const tiposExistentes = Array.from(new Set(arr.map(p => (p.tipo || p.type || p.tipo_ponto || p.tipoTuristico || p.t || '').toString()))).filter(Boolean);
        console.log('[debug loadPontosTuristicos] tipos existentes:', tiposExistentes);
      } catch (e) {}
      const formatted = arr.map(p => ({
        id: p.id_ponto ?? p.id ?? p._id ?? p.uuid ?? p.codigo ?? null,
        nome: p.nome || p.nome_ponto || p.name || '',
        descricao: p.descricao || p.description || '',
        status: p.status || p.ativo || (p.inativo ? 'inativo' : 'ativo') || 'ativo',
        horario_funcionamento: p.horario_funcionamento || p.horario || ''
      }));
      setPontos(formatted);
    } catch (err) {
      console.error('loadPontosTuristicos', err);
      setError('Erro ao carregar pontos turísticos.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPonto = () => {
    setFormData({ nome: '', endereco: '', tipo: '', descricao: '', horario_funcionamento: '' });
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  const handleEditPonto = (ponto) => {
    setFormData({
      nome: ponto.nome || '',
      endereco: ponto.endereco || '',
      tipo: ponto.tipo || '',
      descricao: ponto.descricao || '',
      horario_funcionamento: ponto.horario_funcionamento || ''
    });
    setEditingId(ponto.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitPonto = async (e) => {
    e.preventDefault();
    try {
      const tipoMapPrisma = {
        historico: 'Hist_rico',
        natural: 'Natural',
        cultural: 'cultural',
        outro: 'outro'
      };
      const mappedTipo = formData.tipo ? (tipoMapPrisma[String(formData.tipo).toLowerCase()] || String(formData.tipo)) : '';

      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        horario_funcionamento: formData.horario_funcionamento,
        tipo: mappedTipo,
        endereco_completo: formData.endereco
      };

      if (!payload.tipo) delete payload.tipo;

      try {
        console.log('[debug PagePontosTuristicos] Enviando payload ponto turístico:', payload);
      } catch (e) {}
      if (isEditing && editingId) {
        await dashboardService.updatePontoTuristico(editingId, payload);
      } else {
        await dashboardService.createPontoTuristico(payload);
      }
      await loadPontosTuristicos();
      setShowModal(false);
    } catch (err) {
      console.error('handleSubmitPonto', err);
      alert('Erro ao salvar ponto turístico.');
    }
  };

  const handleDeletePonto = async (pontoId) => {
    if (!window.confirm('Confirma exclusão deste ponto turístico?')) return;
    try {
      await dashboardService.deletePontoTuristico(pontoId);
      await loadPontosTuristicos();
    } catch (err) {
      console.error('deletePontoTuristico erro', err);
      alert('Erro ao excluir ponto turístico.');
    }
  };

  const handleGerarQRCode = async (pontoId, pontoNome) => {
    try {
      const blob = await dashboardService.downloadPDF(pontoId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qrcode-${(pontoNome||'ponto').replace(/\s+/g, '-').toLowerCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('handleGerarQRCode', err);
      alert('Erro ao gerar QR Code.');
    }
  };

  const filteredPontos = pontos;
  const totalPagesPontos = Math.max(1, Math.ceil(filteredPontos.length / itemsPerPage));
  const pagedPontos = filteredPontos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div>
      <DashboardHeader />
      <div className="admin-layout">
        <SidebarAdmin />
        <div className="admin-dashboard">
          <h1>Pontos Turísticos</h1>
          <p className="loading">Carregando pontos turísticos...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div>
      <DashboardHeader />
      <div className="admin-layout">
        <SidebarAdmin />
        <div className="admin-dashboard">
          <h1>Pontos Turísticos</h1>
          <p className="error">{error}</p>
          <button onClick={loadPontosTuristicos}>Tentar novamente</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <DashboardHeader />
      <div className="admin-layout">
        <SidebarAdmin />
        <div className="admin-dashboard">
          <h1>Pontos Turísticos</h1>
          <div className="dashboard-content">
            <div className="pontos-header-top">
              <div className="pontos-stats">
                <MdLocationOn size={24} color="#5FD6C3" />
                <span>Total de pontos turísticos: {pontos.length}</span>
              </div>
              <button className="btn-add-ponto" onClick={handleAddPonto}>+ Adicionar Ponto Turístico</button>
            </div>

            <div className="pontos-table-container">
              <table className="pontos-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Status</th>
                    <th>QR Code</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedPontos.length === 0 ? (
                    <tr><td colSpan={5}>Nenhum ponto encontrado.</td></tr>
                  ) : (
                    pagedPontos.map(ponto => (
                      <tr key={ponto.id}>
                        <td>{ponto.nome}</td>
                        <td>{ponto.descricao}</td>
                        <td><span className={`badge ${ponto.status === 'ativo' ? 'badge-ativo' : 'badge-inativo'}`}>{ponto.status}</span></td>
                        <td>
                          <button className="btn-qrcode" onClick={() => handleGerarQRCode(ponto.id, ponto.nome)}>Baixar PDF</button>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-acao editar" onClick={() => handleEditPonto(ponto)}>Editar</button>
                            <button className="btn-acao excluir" onClick={() => handleDeletePonto(ponto.id)}>Excluir</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPagesPontos > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPagesPontos} onPageChange={(p) => setCurrentPage(p)} />
            )}
          </div>

          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>{isEditing ? 'Editar' : 'Adicionar'} Ponto Turístico</h2>
                  <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
                </div>
                <form className="modal-form" onSubmit={handleSubmitPonto}>
                  <div className="form-group">
                    <label>Nome do Ponto Turístico</label>
                    <input type="text" name="nome" value={formData.nome} onChange={handleFormChange} placeholder="Ex: Igreja de São Cosme e Damião" required />
                  </div>
                  <div className="form-group">
                    <label>Endereço Completo</label>
                    <input type="text" name="endereco" value={formData.endereco} onChange={handleFormChange} placeholder="Ex: Rua Principal, 123" />
                  </div>
                  <div className="form-group">
                    <label>Horário de Funcionamento</label>
                    <input type="text" name="horario_funcionamento" value={formData.horario_funcionamento} onChange={handleFormChange} placeholder="Ex: Seg a Sex: 8h às 18h" />
                  </div>
                  <div className="form-group">
                    <label>Tipo</label>
                    <select name="tipo" value={formData.tipo} onChange={handleFormChange}>
                      <option value="">Selecione um tipo</option>
                      {tipos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Descrição</label>
                    <textarea name="descricao" value={formData.descricao} onChange={handleFormChange} rows={3} placeholder="Descreva o ponto turístico..."></textarea>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                    <button type="submit" className="btn-save">Salvar</button>
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
 