import { useState, useEffect } from "react";
import "./EmpresaEventos.css";
import { DashboardHeader } from "../../../components/dashboardHeader/DashboardHeader";
import { Sidebar } from "../../../components/sidebar/Sidebar";
import { MdEvent } from "react-icons/md";
import { dashboardService, API_BASE_URL } from "../../../services/api";

export function EmpresaEventos() {
  const initialForm = {
    nome: '',
    data: '',
    horario: '',
    endereco: '',
    descricao: '',
    imagem: null,
    imagemPreview: null,
    imagem_path: null
  };

  function formatEnderecoResolved(resolved) {
    if (!resolved) return '';
    try {
      if (typeof resolved === 'string') return resolved;
      if (typeof resolved === 'object') {
        if (resolved.endereco_completo) return resolved.endereco_completo;
        const rua = resolved.logradouro || resolved.rua || resolved.nome || resolved.address || '';
        const numero = resolved.numero || resolved.numero_endereco || resolved.n || '';
        const complemento = resolved.complemento || resolved.compl || '';
        const bairro = resolved.bairro || '';
        const cidade = resolved.cidade || resolved.localidade || '';
        const estado = resolved.estado || resolved.uf || '';
        const cep = resolved.cep || resolved.codigo_postal || '';
        const parts = [rua, numero, complemento, bairro, cidade, estado, cep].map(p => (p || '').toString().trim()).filter(Boolean);
        if (parts.length > 0) return parts.join(', ');
        return JSON.stringify(resolved);
      }
      return String(resolved);
    } catch (e) { return '';} 
  }

  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { loadEventos(); }, []);

  const loadEventos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getEventosMe();
      let arr = Array.isArray(data) ? data : [];

      const ids = Array.from(new Set(
        arr.map(ev => ev.id_endereco || ev.idEndereco || ev.endereco_id || (ev.endereco && ev.endereco.id) || null).filter(Boolean)
      ));

      const addressMap = {};
      if (ids.length > 0) {
        await Promise.all(ids.map(async (id) => {
          try {
            const addr = await dashboardService.getEnderecoById(id);
            addressMap[String(id)] = addr;
          } catch (e) {
            const status = e?.response?.status;
            if (status === 404) addressMap[String(id)] = null;
            else console.warn('Erro ao buscar endereco id', id, e?.message || e);
          }
        }));
      }

      const enriched = arr.map(ev => {
        const id = ev.id_endereco || ev.idEndereco || ev.endereco_id || (ev.endereco && ev.endereco.id) || null;
        const fetched = id ? addressMap[String(id)] : null;
        const resolved = fetched ?? ev.endereco ?? ev.endereco_completo ?? ev.enderecos ?? ev.endereco_evento ?? null;
        return { ...ev, _endereco_resolved: resolved };
      });

      const parseEventDate = (ev) => {
        const dateStr = ev.data || ev.data_evento || ev.date || ev.data_hora || ev.start || '';
        if (!dateStr) return Infinity;
        try {
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
            const [d, m, y] = dateStr.split('/');
            return new Date(`${y}-${m}-${d}T00:00:00`).getTime();
          }
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date(dateStr + 'T00:00:00').getTime();
          const t = Date.parse(dateStr);
          return isNaN(t) ? Infinity : t;
        } catch (e) { return Infinity; }
      };

      enriched.sort((a, b) => parseEventDate(b) - parseEventDate(a));
      
      setEventos(enriched);
    } catch (err) {
      console.error('Falha ao carregar eventos', err);
      setError('Erro ao carregar eventos: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const resolveEventImage = (ev) => {
    const imgField = ev?.imagem_path || ev?.imagem || ev?.image || ev?.imagemPath || null;
    if (!imgField) return null;
    if (typeof imgField === 'string') {
      if (imgField.startsWith('http')) return imgField;
      if (imgField.startsWith('/')) return `${String(API_BASE_URL).replace(/\/$/, '')}${imgField}`;
      return `${String(API_BASE_URL).replace(/\/$/, '')}/${String(imgField).replace(/^\/+/, '')}`;
    }
    return null;
  };

  const handleOpenModal = (evento) => {
    setError(null);
    if (evento) {
      setIsEditing(true);
      setEditingId(evento.id_evento || evento.id || null);
      const horaVal = normalizeTime(evento.horario || evento.hora || evento.horario_evento || evento.data_hora || evento.dataHora || '');
      const enderecoResolved = formatEnderecoResolved(evento._endereco_resolved ?? evento.endereco ?? evento.endereco_completo ?? evento.address ?? null);
      const rawImg = evento.imagem_path ?? evento.imagem ?? null;
      const imgPreview = (typeof rawImg === 'string' && rawImg) ? (rawImg.startsWith('http') ? rawImg : (rawImg.startsWith('/') ? `${String(API_BASE_URL).replace(/\/$/, '')}${rawImg}` : `${String(API_BASE_URL).replace(/\/$/, '')}/${String(rawImg).replace(/^\/+/, '')}`)) : null;
      setFormData({
        nome: evento.nome || '',
        data: evento.data ? String(evento.data).substring(0, 10) : (evento.data_evento ? String(evento.data_evento).substring(0,10) : ''),
        horario: horaVal,
        endereco: enderecoResolved || (evento.endereco || evento.endereco_completo || ''),
        descricao: evento.descricao || '',
        imagem: rawImg,
        imagemPreview: imgPreview,
        imagem_path: rawImg
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData(initialForm);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData(initialForm);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    (async () => {
      try {
        const required = ['nome', 'data', 'horario', 'endereco', 'descricao'];
        const missing = required.filter(key => !formData[key] || String(formData[key]).trim() === '');
        if (missing.length > 0) {
          setError('Campos obrigatórios não preenchidos: ' + missing.join(', '));
          return;
        }

        let empresaId = null;
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          empresaId = u.empresa || u.empresa_id || u.id_empresa || u.empresaId || u.id || u._id || null;
        } catch (e) { empresaId = null; }
        if (!empresaId) {
          setError('É necessário estar logado como empresa para cadastrar eventos.');
          return;
        }

        let body;
        const computedISO = (() => {
          try { if (formData.data && formData.horario) return new Date(`${formData.data}T${formData.horario}`).toISOString(); } catch (e) { }
          return null;
        })();

        if (formData.imagem instanceof File) {
          const fd = new FormData();
          fd.append('nome', formData.nome);
          fd.append('descricao', formData.descricao);
          fd.append('data', formData.data);
          fd.append('horario', formData.horario);
          fd.append('endereco', formData.endereco);
          fd.append('endereco_completo', formData.endereco);
            fd.append('imagem', formData.imagem);
            try { if (!fd.get('image')) fd.append('image', formData.imagem); } catch(e){}
            try { if (!fd.get('file')) fd.append('file', formData.imagem); } catch(e){}

          try { if (formData.imagem_path && typeof formData.imagem_path === 'string' && !fd.get('imagem_path')) fd.append('imagem_path', formData.imagem_path); } catch(e){}
          if (computedISO) fd.append('data_hora', computedISO);
          fd.append('titulo', formData.nome);
          fd.append('name', formData.nome);
          fd.append('date', formData.data);
          fd.append('data_evento', formData.data);
          fd.append('hora', formData.horario);
          fd.append('descricao_evento', formData.descricao);
          body = fd;
        } else {
          body = {
            nome: formData.nome,
            titulo: formData.nome,
            name: formData.nome,
            descricao: formData.descricao,
            descricao_evento: formData.descricao,
            data: formData.data,
            data_evento: formData.data,
            date: formData.data,
            horario: formData.horario,
            hora: formData.horario,
            endereco: formData.endereco,
            endereco_completo: formData.endereco,
            endereco_evento: formData.endereco,
            imagem_path: (typeof formData.imagem === 'string') ? formData.imagem : (formData.imagem_path || undefined),
          };
          if (computedISO) body.data_hora = computedISO;
        }

        const empresaVal = (empresaId && !isNaN(Number(empresaId))) ? Number(empresaId) : empresaId;
        if (body instanceof FormData) {
          body.append('id_empresa', String(empresaVal));
          body.append('empresa_id', String(empresaVal));
          body.append('empresa', String(empresaVal));
        } else {
          body.id_empresa = empresaVal;
          body.empresa_id = empresaVal;
          body.empresa = empresaVal;
        }

        if (isEditing) await dashboardService.updateEvento(editingId, body);
        else await dashboardService.createEvento(body);

        await loadEventos();
        handleCloseModal();
      } catch (err) {
        console.error('Falha ao salvar evento', err, err?.response?.data);
        let serverMessage = err?.response?.data?.message ?? err?.response?.data ?? err.message;
        try { if (typeof serverMessage === 'object') serverMessage = JSON.stringify(serverMessage); } catch(e){}
        setError('Erro ao salvar evento: ' + serverMessage);
      }
    })();
  };

  const handleDelete = (id) => {
    (async () => {
      if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;
      try {
        await dashboardService.deleteEvento(id);
        await loadEventos();
      } catch (err) {
        console.error('Falha ao excluir evento', err);
        setError('Erro ao excluir evento: ' + (err.response?.data?.message || err.message));
      }
    })();
  };

  function formatData(dataStr) {
    if (!dataStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) return dataStr.split('-').reverse().join('/');
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) return dataStr;
    if (/^\d{4}-\d{2}-\d{2}T/.test(dataStr)) return dataStr.substring(0, 10).split('-').reverse().join('/');
    return dataStr;
  }

  function formatHora(horaStr) {
    if (!horaStr) return '';
    const match = horaStr.match(/^\d{2}:\d{2}(:\d{2})?/);
    if (match) return match[0];
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(horaStr)) return horaStr.substring(11, 16);
    return horaStr;
  }

  function normalizeTime(h) {
    if (!h) return '';
    try {
      if (typeof h === 'string') {
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(h)) return h.substring(0,5);
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(h)) return h.substring(h.indexOf('T') + 1, h.indexOf('T') + 6);
      }
      const d = new Date(h);
      if (!isNaN(d)) {
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      }
    } catch (e) {}
    return '';
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
                      <th>Imagem</th>
                      <th>Empresa</th>
                      <th>Data</th>
                      <th>Horário</th>
                      <th>Endereço</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventos.length === 0 ? (
                      <tr><td colSpan="7">Nenhum evento encontrado.</td></tr>
                    ) : (
                      eventos.map(evento => (
                        <tr key={evento.id_evento || evento.id}>
                          <td>{evento.nome}</td>
                          <td>{(() => {
                            const src = resolveEventImage(evento);
                            if (!src) return <span style={{ color: '#aaa' }}>Sem imagem</span>;
                            return <img src={src} alt={evento.nome || 'imagem'} style={{ maxWidth: 80, maxHeight: 60, objectFit: 'cover', borderRadius: 4 }} />;
                          })()}</td>
                          <td>{(evento.empresa && typeof evento.empresa === 'object') ? (evento.empresa.nome_empresa || evento.empresa.nome || evento.empresa.name || evento.empresa.razao_social || '-') : (evento.empresa || '-')}</td>
                          <td>{formatData(evento.data)}</td>
                          <td>{formatHora(evento.horario)}</td>
                          <td>{(() => {
                            const resolved = evento._endereco_resolved;
                            if (resolved) {
                              if (typeof resolved === 'object') {
                                if (resolved.endereco_completo) return resolved.endereco_completo;
                                const rua = resolved.logradouro || resolved.rua || resolved.nome || resolved.address || '';
                                const numero = resolved.numero || resolved.numero_endereco || resolved.n || '';
                                const complemento = resolved.complemento || resolved.compl || '';
                                const bairro = resolved.bairro || '';
                                const cidade = resolved.cidade || resolved.localidade || '';
                                const estado = resolved.estado || resolved.uf || '';
                                const cep = resolved.cep || resolved.codigo_postal || '';
                                const parts = [rua, numero, complemento, bairro, cidade, estado, cep].map(p => (p || '').toString().trim()).filter(Boolean);
                                if (parts.length > 0) return parts.join(', ');
                                return JSON.stringify(resolved);
                              }
                              return String(resolved);
                            }
                            const e = evento.endereco || evento.endereco_completo || evento.address || evento.id_endereco || null;
                            if (!e) return '-';
                            const isIdLike = typeof e === 'string' && /^[0-9a-fA-F\-]{8,}$/.test(e);
                            if (isIdLike && !(e.includes(' ') || e.includes(','))) return `ID: ${e} (endereço não disponível)`;
                            if (typeof e === 'object') {
                              if (e.endereco_completo) return e.endereco_completo;
                              const rua = e.logradouro || e.rua || e.nome || e.address || '';
                              const numero = e.numero || e.numero_endereco || '';
                              const complemento = e.complemento || '';
                              const bairro = e.bairro || '';
                              const cidade = e.cidade || e.localidade || '';
                              const estado = e.estado || e.uf || '';
                              const cep = e.cep || '';
                              const parts = [rua, numero, complemento, bairro, cidade, estado, cep].map(p => (p || '').toString().trim()).filter(Boolean);
                              if (parts.length > 0) return parts.join(', ');
                              return JSON.stringify(e);
                            }
                            return e;
                          })()}</td>
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
                      <input
                        type="text"
                        placeholder="Ex: R. Barbosa Lima, S/N, Centro, Igarassu, PE, 53615-000"
                        value={formData.endereco}
                        onChange={e => setFormData({ ...formData, endereco: e.target.value })}
                        required
                      />
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
