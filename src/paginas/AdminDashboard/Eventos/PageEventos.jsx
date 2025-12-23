import { useState, useEffect } from "react";
import "./PageEventos.css";
import { DashboardHeader } from "../../../components/dashboardHeader/DashboardHeader";
import { SidebarAdmin } from "../../../components/sidebarAdmin/SidebarAdmin";
import { MdEvent } from "react-icons/md";
import { dashboardService } from "../../../services/api";

export function PageEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    data: '',
    horario: '',
    endereco: ''
  });

  useEffect(() => {
    loadEventos();
  }, []);

  // Carrega eventos do backend e normaliza campos para exibição
  const loadEventos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getEventos();
      // Normaliza os campos para garantir nome da empresa, data e horário
      const eventosFormatados = Array.isArray(data) ? data.map(ev => {
        // Nome do evento
        const nome = ev.nome || ev.titulo || ev.name || '';
        // Empresa pode vir como objeto, string ou campo separado
        let empresa = ev.empresa_nome || ev.nome_empresa || ev.empresa || '';
        if (typeof empresa === 'object' && empresa !== null) {
          empresa = empresa.nome || empresa.name || '';
        }
        // Data e horário
        const dataEvento = ev.data || ev.data_evento || ev.date || '';
        const horario = ev.horario || ev.horario_evento || ev.hora || ev.horarioInicio || '';
        // Endereço
        let endereco = ev.endereco_completo || ev.endereco || ev.endereco_evento || ev.address || '';
        if (!endereco && ev.endereco_obj) {
          const e = ev.endereco_obj;
          endereco = [e.rua, e.numero, e.bairro, e.cidade, e.estado, e.cep].filter(Boolean).join(', ');
        } else if (!endereco && typeof ev === 'object') {
          const rua = ev.rua || (ev.endereco && ev.endereco.rua);
          const numero = ev.numero || (ev.endereco && ev.endereco.numero);
          const bairro = ev.bairro || (ev.endereco && ev.endereco.bairro);
          const cidade = ev.cidade || (ev.endereco && ev.endereco.cidade);
          const estado = ev.estado || (ev.endereco && ev.endereco.estado);
          const cep = ev.cep || (ev.endereco && ev.endereco.cep);
          endereco = [rua, numero, bairro, cidade, estado, cep].filter(Boolean).join(', ');
        }
        return {
          ...ev,
          nome,
          empresa,
          data: dataEvento,
          horario,
          endereco
        };
      }) : [];
      setEventos(eventosFormatados);
    } catch (err) {
      setError("Erro ao carregar eventos: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (evento = null) => {
    if (evento) {
      setIsEditing(true);
      setEditingId(evento.id_evento || evento.id);
      setFormData({
        nome: evento.nome || evento.titulo || evento.name || '',
        empresa: evento.empresa_nome || (evento.empresa && (evento.empresa.nome || evento.empresa.name)) || evento.nome_empresa || '',
        data: evento.data || evento.data_evento || evento.date || '',
        horario: evento.horario || evento.horario_evento || evento.hora || evento.horarioInicio || '',
        endereco: evento.endereco_completo || evento.endereco || evento.endereco_evento || evento.address || ''
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({ nome: '', empresa: '', data: '', horario: '', endereco: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ nome: '', empresa: '', data: '', horario: '', endereco: '' });
  };

  // Funções de adicionar, editar e excluir (mock)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      // Atualizar evento
      setEventos(eventos.map(ev => (ev.id_evento || ev.id) === editingId ? { ...ev, ...formData } : ev));
    } else {
      // Adicionar novo evento
      setEventos([...eventos, { ...formData, id: Date.now() }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      setEventos(eventos.filter(ev => (ev.id_evento || ev.id) !== id));
    }
  };

  return (
    <div>
      <DashboardHeader />
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <SidebarAdmin />
        <div className="admin-eventos">
          <h1 className="titulo-admin">Eventos</h1>
          <div className="dashboard-content">
            <div className="eventos-header">
              <div className="eventos-stats">
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MdEvent size={24} color="#5FD6C3" />
                  Total de eventos: {eventos.length}
                </span>
              </div>
              <button className="btn-add-evento" onClick={() => handleOpenModal()}>
                + Adicionar novo evnto
              </button>
            </div>
            {loading && <p className="loading">Carregando eventos...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && (
              <div className="eventos-table-container">
                <table className="eventos-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Empresa</th>
                      <th>Data</th>
                      <th>Horário</th>
                      <th>Endereço</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventos.length === 0 ? (
                      <tr><td colSpan="6">Nenhum evento encontrado.</td></tr>
                    ) : (
                      eventos.map(evento => {
                        let endereco = evento.endereco_completo || evento.endereco || evento.endereco_evento || evento.address || '';
                        if (!endereco && evento.endereco_obj) {
                          const e = evento.endereco_obj;
                          endereco = [e.rua, e.numero, e.bairro, e.cidade, e.estado, e.cep].filter(Boolean).join(', ');
                        } else if (!endereco && typeof evento === 'object') {
                          const rua = evento.rua || (evento.endereco && evento.endereco.rua);
                          const numero = evento.numero || (evento.endereco && evento.endereco.numero);
                          const bairro = evento.bairro || (evento.endereco && evento.endereco.bairro);
                          const cidade = evento.cidade || (evento.endereco && evento.endereco.cidade);
                          const estado = evento.estado || (evento.endereco && evento.endereco.estado);
                          const cep = evento.cep || (evento.endereco && evento.endereco.cep);
                          endereco = [rua, numero, bairro, cidade, estado, cep].filter(Boolean).join(', ');
                        }
                        return (
                          <tr key={evento.id_evento || evento.id}>
                            <td>{evento.nome}</td>
                            <td>{evento.empresa || '-'}</td>
                            <td>{evento.data}</td>
                            <td>{evento.horario}</td>
                            <td>{evento.endereco || '-'}</td>
                            <td>
                              <div className="action-buttons">
                                <button className="btn-acao editar" onClick={() => handleOpenModal(evento)}>Editar</button>
                                <button className="btn-acao excluir" onClick={() => handleDelete(evento.id_evento || evento.id)}>Excluir</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {showModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{isEditing ? 'Editar Evento' : 'Adicionar Evento'}</h2>
                <form onSubmit={handleSubmit}>
                  <label>Nome:
                    <input type="text" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                  </label>
                  <label>Empresa:
                    <input type="text" value={formData.empresa} onChange={e => setFormData({ ...formData, empresa: e.target.value })} required />
                  </label>
                  <label>Data:
                    <input type="date" value={formData.data} onChange={e => setFormData({ ...formData, data: e.target.value })} required />
                  </label>
                  <label>Horário:
                    <input type="time" value={formData.horario} onChange={e => setFormData({ ...formData, horario: e.target.value })} required />
                  </label>
                  <label>Endereço:
                    <input type="text" value={formData.endereco} onChange={e => setFormData({ ...formData, endereco: e.target.value })} required />
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
  );
}
