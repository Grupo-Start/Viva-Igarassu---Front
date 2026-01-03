import { useState, useEffect } from "react";
import "../admin-common.css";
import "./PagePontosTuristicos.css";
import { DashboardHeader } from "../../../components/dashboardHeader/DashboardHeader";
import { SidebarAdmin } from "../../../components/sidebarAdmin/SidebarAdmin";
import { MdLocationOn } from "react-icons/md";
import { dashboardService } from "../../../services/api";

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

  useEffect(() => {
    loadPontosTuristicos();
  }, []);

  const loadPontosTuristicos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getPontosTuristicos();
      const formattedPontos = Array.isArray(data) ? data.map(ponto => {
        const nome = ponto.nome || ponto.nome_ponto || ponto.name || 'N/A';
        const localizacao = ponto.localizacao || ponto.local || 'N/A';
        const categoria = ponto.tipo || ponto.categoria || ponto.tipo_ponto || 'outros';
        const descricao = ponto.descricao || ponto.desc || ponto.description || 'N/A';
        const horarioFuncionamento = ponto.horario_funcionamento || ponto.horario || ponto.funcionamento || '';
        let enderecoCompleto = '';
        if (ponto.enderecos && typeof ponto.enderecos === 'object') {
          const { logradouro, numero, bairro, cidade, estado, cep } = ponto.enderecos;
          enderecoCompleto = [logradouro, numero, bairro, cidade, estado, cep].filter(Boolean).join(', ');
        } else if (ponto.rua || ponto.numero || ponto.bairro) {
          enderecoCompleto = [ponto.rua, ponto.numero, ponto.bairro, ponto.cidade, ponto.estado, ponto.cep].filter(Boolean).join(', ');
        } else if (ponto.endereco && typeof ponto.endereco === 'object') {
          const { rua, numero, bairro, cidade, estado, cep } = ponto.endereco;
          enderecoCompleto = [rua, numero, bairro, cidade, estado, cep].filter(Boolean).join(', ');
        } else if (typeof ponto.endereco === 'string' && !ponto.endereco.includes('-')) {
          enderecoCompleto = ponto.endereco;
        } else {
          enderecoCompleto = '';
        }
        return {
          id: ponto.id_ponto || ponto.id,
          nome: nome,
          localizacao: localizacao,
          endereco: enderecoCompleto,
          categoria: categoria || 'outros',
          descricao: descricao,
          horario_funcionamento: horarioFuncionamento,
          status: ponto.status || (ponto.ativo === false ? 'inativo' : 'ativo')
        };
      }) : [];
      setPontos(formattedPontos);
    } catch (err) {
      if (err.message?.includes('Network Error') || err.code === 'ERR_NETWORK') {
        setError('Não foi possível conectar ao backend.');
      } else if (err.response?.status === 404) {
        setError('Endpoint /pontos-turisticos não encontrado no backend.');
      } else {
        setError(`Erro ao carregar pontos turísticos: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const normalizeString = (str) => {
    return str?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  const filteredPontos = pontos.filter(ponto => {
    return true;
  });

  const tipos = [
    { value: 'Hist_rico', label: 'Histórico' },
    { value: 'Natural', label: 'Natural' },
    { value: 'Cultural', label: 'Cultural' },
    { value: 'outro', label: 'Outro' },
  ];

  const countByTipo = (tipo) => {
    if (tipo === 'todos') return pontos.length;
    return pontos.filter(p => normalizeString(p.categoria) === normalizeString(tipo)).length;
  };

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitPonto = async (e) => {
    e.preventDefault();
    try {
      const dadosBackend = {
        nome: formData.nome,
        descricao: formData.descricao,
        horario_funcionamento: formData.horario_funcionamento,
        tipo: formData.tipo || undefined,
      };

      if (isEditing) {
        const pontoOriginal = pontos.find(p => p.id === editingId);
        if (pontoOriginal && pontoOriginal.id_endereco) {
          dadosBackend.id_endereco = pontoOriginal.id_endereco;
        }
      }

      if (!dadosBackend.id_endereco && formData.endereco) {
        try {
          const enderecoRes = await dashboardService.createEndereco(formData.endereco);
          const enderecoId = enderecoRes?.id || enderecoRes?._id || enderecoRes?.id_endereco || enderecoRes?.endereco_id || enderecoRes?.uuid || null;
          if (enderecoId) dadosBackend.id_endereco = enderecoId;
          else if (enderecoRes?.endereco_completo) dadosBackend.endereco = enderecoRes;
        } catch (createEnderecoErr) {
          console.warn('Falha ao criar endereco antes de criar ponto:', createEnderecoErr?.response?.data || createEnderecoErr?.message || createEnderecoErr);
          dadosBackend.endereco_completo = formData.endereco;
        }
      }

      try {
        const rawUser = localStorage.getItem('user');
        const u = rawUser ? JSON.parse(rawUser) : {};
        const empresaId = u.empresa || u.empresa_id || u.id_empresa || u.empresaId || u.id || u._id || null;
        if (empresaId) {
          dadosBackend.empresa = dadosBackend.empresa || empresaId;
          dadosBackend.id_empresa = dadosBackend.id_empresa || empresaId;
          dadosBackend.empresa_id = dadosBackend.empresa_id || empresaId;
        }
      } catch (e) {
      }

      if (formData.endereco) {
        dadosBackend.endereco = dadosBackend.endereco || formData.endereco;
        dadosBackend.endereco_completo = dadosBackend.endereco_completo || formData.endereco;
        dadosBackend.rua = dadosBackend.rua || formData.endereco;
      }
      if (formData.tipo) {
        dadosBackend.tipo = dadosBackend.tipo || formData.tipo;
        dadosBackend.tipo_ponto = dadosBackend.tipo_ponto || formData.tipo;
        dadosBackend.categoria = dadosBackend.categoria || formData.tipo;
      }


      const minimalPayload = {
        nome: dadosBackend.nome || formData.nome || 'Sem nome',
        descricao: dadosBackend.descricao || formData.descricao || '',
        horario_funcionamento: dadosBackend.horario_funcionamento || formData.horario_funcionamento || '',
        tipo: dadosBackend.tipo || formData.tipo || undefined,
        endereco_completo: dadosBackend.endereco_completo || dadosBackend.endereco || formData.endereco || undefined,
        id_empresa: (function(){ try{ const u = JSON.parse(localStorage.getItem('user')||'{}'); return u.empresa || u.empresa_id || u.id_empresa || u.empresaId || null }catch(e){return null} })()
      };

      if (isEditing) {
        await dashboardService.updatePontoTuristico(editingId, dadosBackend);
        alert('Ponto turístico atualizado com sucesso!');
      } else {
        await dashboardService.createPontoTuristico(minimalPayload);
        alert('Ponto turístico adicionado com sucesso!');
      }

      setShowModal(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        nome: '',
        endereco: '',
        tipo: '',
        descricao: '',
        horario_funcionamento: ''
      });
      loadPontosTuristicos();
    } catch (err) {
      alert(`Erro ao ${isEditing ? 'atualizar' : 'adicionar'} ponto turístico. Tente novamente.`);
    }
  };

  const handleEditPonto = (ponto) => {
    setFormData({
      nome: ponto.nome,
      endereco: ponto.endereco || '',
      tipo: ponto.tipo || ponto.categoria || ponto.tipo_ponto || '',
      descricao: ponto.descricao,
      horario_funcionamento: ponto.horario_funcionamento || ''
    });
    setEditingId(ponto.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleAddPonto = () => {
    setFormData({
      nome: '',
      endereco: '',
      tipo: '',
      descricao: '',
      horario_funcionamento: ''
    });
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  const handleToggleStatus = async (pontoId, statusAtual) => {
    try {
      const novoStatus = statusAtual === 'ativo' ? 'inativo' : 'ativo';
      await dashboardService.updatePontoTuristicoStatus(pontoId, novoStatus);
      loadPontosTuristicos();
    } catch (err) {
      alert('Erro ao alterar status do ponto turístico.');
    }
  };

  const handleDeletePonto = async (pontoId) => {
    const ok = window.confirm('Confirma exclusão deste ponto turístico?');
    if (!ok) return;
    try {
      await dashboardService.deletePontoTuristico(pontoId);
      alert('Ponto turístico excluído com sucesso.');
      loadPontosTuristicos();
    } catch (err) {
      console.warn('deletePontoTuristico erro', err?.response?.data || err?.message || err);
      alert('Erro ao excluir ponto turístico. Verifique os logs do servidor.');
    }
  };

  const handleGerarQRCode = async (pontoId, pontoNome) => {
    try {
      const blob = await dashboardService.downloadPDF(pontoId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `qrcode-${pontoNome.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      let errorMsg = 'Erro ao gerar QR Code. ';
      if (err.response?.status === 404) {
        errorMsg += 'Ponto turístico não encontrado.';
      } else if (err.response?.status === 401) {
        errorMsg += 'Sessão expirada. Faça login novamente.';
      } else if (err.message?.includes('Network Error')) {
        errorMsg += 'Não foi possível conectar ao backend.';
      } else {
        errorMsg += err.message || 'Tente novamente.';
      }
      alert(errorMsg);
    }
  };

  const handleToggleStatusFrontend = (pontoId) => {
    setPontos(prevPontos => prevPontos.map(p =>
      p.id === pontoId
        ? { ...p, status: p.status === 'ativo' ? 'inativo' : 'ativo' }
        : p
    ));
  };

  if (loading) {
    return (
      <div>
        <DashboardHeader/>
        <div style={{ display: 'flex', overflow: 'hidden' }}>
          <SidebarAdmin/>
          <div className="admin-dashboard">
            <h1>Pontos Turísticos</h1>
            <p className="loading">Carregando pontos turísticos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <DashboardHeader/>
        <div style={{ display: 'flex', overflow: 'hidden' }}>
          <SidebarAdmin/>
          <div className="admin-dashboard">
            <h1>Pontos Turísticos</h1>
            <p className="error">{error}</p>
            <button onClick={loadPontosTuristicos}>Tentar novamente</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader/>
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <SidebarAdmin/>
        <div className="admin-dashboard">
          <h1>Pontos Turísticos</h1>
          <div className="dashboard-content">
            <div className="pontos-header-top">
              <div className="pontos-stats">
                <MdLocationOn size={24} color="#5FD6C3" />
                <span>Total de pontos turísticos: {pontos.length}</span>
              </div>
              <button className="btn-add-ponto" onClick={handleAddPonto}>
                + Adicionar Ponto Turístico
              </button>
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
                  {filteredPontos.map((ponto) => (
                    <tr key={ponto.id}>
                      <td>{ponto.nome}</td>
                      <td>{ponto.descricao}</td>
                      <td>
                        <span className={`badge ${ponto.status === 'ativo' ? 'badge-ativo' : 'badge-inativo'}`}>
                          {ponto.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-qrcode"
                          onClick={() => handleGerarQRCode(ponto.id, ponto.nome)}
                        >
                          Baixar PDF
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-acao editar" onClick={() => handleEditPonto(ponto)}>Editar</button>
                          <button className="btn-acao excluir" onClick={() => handleDeletePonto(ponto.id)}>Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
                <input 
                  type="text" 
                  name="nome"
                  value={formData.nome}
                  onChange={handleFormChange}
                  placeholder="Ex: Igreja de São Cosme e Damião" 
                  required
                />
              </div>
              <div className="form-group">
                <label>Endereço Completo</label>
                <input 
                  type="text" 
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleFormChange}
                  placeholder="Ex: Rua Principal, 123" 
                  required
                />
              </div>
              <div className="form-group">
                <label>Horário de Funcionamento</label>
                <input 
                  type="text" 
                  name="horario_funcionamento"
                  value={formData.horario_funcionamento}
                  onChange={handleFormChange}
                  placeholder="Ex: Seg a Sex: 8h às 18h" 
                  required
                />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select 
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Selecione um tipo</option>
                  {tipos.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea 
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleFormChange}
                  rows="3" 
                  placeholder="Descreva o ponto turístico..."
                  required
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}