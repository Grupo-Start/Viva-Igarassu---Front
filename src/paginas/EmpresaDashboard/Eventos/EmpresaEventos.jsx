import { useState, useEffect } from "react";
import "./EmpresaEventos.css";
import { DashboardHeader } from "../../../components/dashboardHeader/DashboardHeader";
import { Sidebar } from "../../../components/sidebar/Sidebar";
import { MdEvent } from "react-icons/md";
import { dashboardService } from "../../../services/api";

export function EmpresaEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    data: '',
    horario: '',
    endereco: '',
    descricao: '',
    imagem: null
  });

  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getEventos();
      

      let empresasMap = {};
      try {
        const allEmpresas = await dashboardService.getEmpresas();
        if (Array.isArray(allEmpresas)) {
          allEmpresas.forEach(e => {
            const key = String(e.id ?? e._id ?? e.id_empresa ?? e.idEmpresa ?? e.codigo ?? e.id);
            const nome = e.nome || e.nome_empresa || e.name || e.razao_social || '';
            empresasMap[key] = nome || key;
          });
        }
      } catch (err) {
        console.warn('PageEventos - falha ao buscar empresas para lookup:', err);
      }

      try {
        
        const dataArray = Array.isArray(data) ? data : [];
        const idsParaBuscar = Array.from(new Set(dataArray
          .map(ev => ev.id_empresa)
          .filter(id => id !== undefined && id !== null && String(id) && !empresasMap[String(id)])
        ));

        if (idsParaBuscar.length > 0) {
          const promises = idsParaBuscar.map(id =>
            dashboardService.getEmpresaById(id)
              .then(res => ({ id: String(id), nome: res?.nome || res?.nome_empresa || res?.name || '' }))
              .catch(err => {
                console.warn('PageEventos - falha ao buscar empresa por id', id, err);
                return { id: String(id), nome: '' };
              })
          );
          const resultados = await Promise.all(promises);
          resultados.forEach(r => {
            if (r && r.id) empresasMap[r.id] = r.nome || r.id;
          });
        }
      } catch (err) {
        console.warn('PageEventos - erro ao resolver empresas por id:', err);
      }

      const eventosFormatados = Array.isArray(data) ? data.map(ev => {
        const nome = ev.nome || ev.titulo || ev.name || '';
        let empresa = '';
        if (ev.nome_empresa) {
          empresa = ev.nome_empresa;
        } else if (ev.empresa_nome) {
          empresa = ev.empresa_nome;
        } else if (ev.empresa && typeof ev.empresa === 'object') {
          empresa = ev.empresa.nome || ev.empresa.name || ev.empresa.nome_empresa || ev.empresa.razao_social || '';
        } else if (typeof ev.empresa === 'string') {
          empresa = ev.empresa;
        } else if (ev.id_empresa) {
          if (typeof ev.id_empresa === 'object') {
            empresa = ev.id_empresa.nome || ev.id_empresa.name || ev.id_empresa.nome_empresa || '';
          }
          if (!empresa) {
            // tentar mapear via empresasMap usando id direto
            const key = String(ev.id_empresa);
            if (empresasMap[key]) empresa = empresasMap[key];
          }
        } else if (ev.criador && typeof ev.criador === 'object') {
          empresa = ev.criador.nome || ev.criador.name || '';
        }
        let endereco = '';
        if (ev.endereco_completo) {
          endereco = ev.endereco_completo;
        } else if (ev.enderecos && typeof ev.enderecos === 'string') {
          endereco = ev.enderecos;
        } else if (ev.enderecos && typeof ev.enderecos === 'object') {
          // pode ser objeto com campos de endereço
          endereco = [ev.enderecos.rua || ev.enderecos.logradouro, ev.enderecos.numero, ev.enderecos.bairro, ev.enderecos.cidade, ev.enderecos.estado, ev.enderecos.cep].filter(Boolean).join(', ');
        } else if (ev.endereco && typeof ev.endereco === 'string') {
          endereco = ev.endereco;
        } else if (ev.endereco && typeof ev.endereco === 'object') {
          endereco = [ev.endereco.rua, ev.endereco.numero, ev.endereco.bairro, ev.endereco.cidade, ev.endereco.estado, ev.endereco.cep].filter(Boolean).join(', ');
        } else if (ev.endereco_evento) {
          endereco = ev.endereco_evento;
        } else if (ev.address) {
          endereco = ev.address;
        }
        const dataEvento = ev.data || ev.data_evento || ev.date || '';
        const horario = ev.horario || ev.horario_evento || ev.hora || ev.horarioInicio || '';
        return {
          ...ev,
          nome,
          empresa,
          data: dataEvento,
          horario,
          endereco,
          descricao: ev.descricao || ev.description || ''
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
        data: evento.data || evento.data_evento || evento.date || '',
        horario: evento.horario || evento.horario_evento || evento.hora || evento.horarioInicio || '',
        endereco: evento.endereco_completo || evento.endereco || evento.endereco_evento || evento.address || '',
        descricao: evento.descricao || evento.description || ''
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({ nome: '', data: '', horario: '', endereco: '', descricao: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ nome: '', data: '', horario: '', endereco: '', descricao: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        let body;
        if (formData.imagem instanceof File) {
          const fd = new FormData();
          fd.append('nome', formData.nome);
          fd.append('data', formData.data);
          fd.append('horario', formData.horario);
          fd.append('endereco', formData.endereco);
          fd.append('descricao', formData.descricao);
          fd.append('imagem', formData.imagem);
          body = fd;
        } else {
          body = {
            nome: formData.nome,
            data: formData.data,
            horario: formData.horario,
            endereco: formData.endereco,
            descricao: formData.descricao
          };
        }

        if (isEditing) {
          await dashboardService.updateEvento(editingId, body);
        } else {
          await dashboardService.createEvento(body);
        }
        await loadEventos();
        handleCloseModal();
      } catch (err) {
        setError('Erro ao salvar evento: ' + (err.response?.data?.message || err.message));
      }
    })();
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      setEventos(eventos.filter(ev => (ev.id_evento || ev.id) !== id));
    }
  };

  function formatData(dataStr) {
    if (!dataStr) return '';
    // Se vier no formato YYYY-MM-DD, exibe como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
      return dataStr.split('-').reverse().join('/'); // 2025-02-10 -> 10/02/2025
    }
    // Se vier no formato dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
      return dataStr;
    }
    // Se vier no formato ISO, extrai só a parte da data
    if (/^\d{4}-\d{2}-\d{2}T/.test(dataStr)) {
      return dataStr.substring(0, 10).split('-').reverse().join('/');
    }
    return dataStr;
  }

  function formatHora(horaStr) {
    if (!horaStr) return '';
    // Se vier no formato HH:mm:ss ou HH:mm, exibe como está
    const match = horaStr.match(/^\d{2}:\d{2}(:\d{2})?/);
    if (match) {
      return match[0];
    }
    // Se vier no formato ISO, extrai só a parte da hora
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(horaStr)) {
      return horaStr.substring(11, 16); // pega HH:mm
    }
    return horaStr;
  }

  return (
    <div>
      <DashboardHeader />
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div className="admin-dashboard">
          <h1>Eventos</h1>
          <div className="dashboard-content">
            <div className="eventos-header-top">
              <div className="eventos-stats">
                <MdEvent size={24} color="#5FD6C3" />
                <span>Total de eventos: {eventos.length}</span>
              </div>
              <button className="btn-add-evento" onClick={() => handleOpenModal()}>
                + Adicionar novo evento
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
                      eventos.map(evento => (
                        <tr key={evento.id_evento || evento.id}>
                          <td>{evento.nome}</td>
                          <td>{evento.empresa || '-'}</td>
                          <td>{formatData(evento.data)}</td>
                          <td>{formatHora(evento.horario)}</td>
                          <td>{evento.endereco || '-'}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn-acao editar" onClick={() => handleOpenModal(evento)}>Editar</button>
                              <button className="btn-acao excluir" onClick={() => handleDelete(evento.id_evento || evento.id)}>Excluir</button>
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
                  <h2>{isEditing ? 'Editar Evento' : 'Adicionar Evento'}</h2>
                  <form onSubmit={handleSubmit}>
                    <label>Nome:
                      <input type="text" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                    </label>
                    <label>Descrição:
                      <input type="text" value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} required />
                    </label>
                    <label>Imagem:
                      <input type="file" accept="image/*" onChange={e => setFormData({ ...formData, imagem: e.target.files[0] || null })} />
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
    </div>
  );
}