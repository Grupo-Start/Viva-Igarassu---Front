import { useState, useEffect } from "react";
import "../admin-common.css";
import "./PageEventos.css";
import { DashboardHeader } from "../../../components/dashboardHeader/DashboardHeader";
import { SidebarAdmin } from "../../../components/sidebarAdmin/SidebarAdmin";
import { MdEvent } from "react-icons/md";
import { dashboardService, API_BASE_URL } from "../../../services/api";

export function PageEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
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
  const [formData, setFormData] = useState(initialForm);

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

      const parseEventDate = (ev) => {
        const dateStr = ev.data || ev.data_evento || ev.date || ev.data_hora || ev.start || '';
        if (!dateStr) return Infinity;
        try {
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
            const [d,m,y] = dateStr.split('/');
            return new Date(`${y}-${m}-${d}T00:00:00`).getTime();
          }
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date(dateStr + 'T00:00:00').getTime();
          const t = Date.parse(dateStr);
          return isNaN(t) ? Infinity : t;
        } catch (e) { return Infinity; }
      };

      eventosFormatados.sort((a,b) => parseEventDate(b) - parseEventDate(a));
      setEventos(eventosFormatados);
    } catch (err) {
      setError("Erro ao carregar eventos: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resolveEventImage = (ev) => {
    const imgField = ev.imagem_path || ev.imagem || ev.image || ev.imagemPath || null;
    if (!imgField) return null;
    if (typeof imgField === 'string') {
      if (imgField.startsWith('http')) return imgField;
      if (imgField.startsWith('/')) return `${String(API_BASE_URL).replace(/\/$/, '')}${imgField}`;
      return `${String(API_BASE_URL).replace(/\/$/, '')}/${String(imgField).replace(/^\/+/, '')}`;
    }
    return null;
  };

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

  const handleOpenModal = (evento = null) => {
    if (evento) {
      setIsEditing(true);
      setEditingId(evento.id_evento || evento.id);
      const horaVal = normalizeTime(evento.horario || evento.hora || evento.horario_evento || evento.data_hora || evento.dataHora || '');
      const enderecoResolved = evento.endereco_completo || evento.endereco || evento.endereco_evento || evento.address || '';
      const rawImg = evento.imagem_path ?? evento.imagem ?? null;
      const imgPreview = (typeof rawImg === 'string' && rawImg)
        ? (rawImg.startsWith('http') ? rawImg : (rawImg.startsWith('/') ? `${String(API_BASE_URL).replace(/\/$/, '')}${rawImg}` : `${String(API_BASE_URL).replace(/\/$/, '')}/${String(rawImg).replace(/^\/+/, '')}`))
        : null;
      setFormData({
        nome: evento.nome || evento.titulo || evento.name || '',
        data: evento.data ? String(evento.data).substring(0, 10) : (evento.data_evento ? String(evento.data_evento).substring(0,10) : ''),
        horario: horaVal,
        endereco: enderecoResolved || '',
        descricao: evento.descricao || evento.description || '',
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        const required = ['nome', 'data', 'horario', 'endereco', 'descricao'];
        const missing = required.filter(key => !formData[key] || String(formData[key]).trim() === '');
        if (missing.length > 0) {
          setError('Campos obrigatórios não preenchidos: ' + missing.join(', '));
          return;
        }
        const computedISO = (() => {
          try { if (formData.data && formData.horario) return new Date(`${formData.data}T${formData.horario}`).toISOString(); } catch (e) { }
          return null;
        })();

        let body;
        if (formData.imagem instanceof File) {
          const fd = new FormData();
          fd.append('nome', formData.nome);
          fd.append('titulo', formData.nome);
          fd.append('name', formData.nome);

          fd.append('data', formData.data);
          fd.append('data_evento', formData.data);
          fd.append('date', formData.data);
          try {
            if (formData.data && formData.horario) {
              const iso = new Date(`${formData.data}T${formData.horario}`).toISOString();
              fd.append('data_hora', iso);
              fd.append('datahora', iso);
              fd.append('start', iso);
            }
          } catch(e) {}

          fd.append('horario', formData.horario);
          fd.append('horario_evento', formData.horario);
          fd.append('hora', formData.horario);

          fd.append('endereco', formData.endereco);
          fd.append('endereco_evento', formData.endereco);
          fd.append('endereco_completo', formData.endereco);

          fd.append('descricao', formData.descricao);
          fd.append('description', formData.descricao);

          fd.append('imagem', formData.imagem);
          body = fd;
        } else {
          body = {
            nome: formData.nome,
            titulo: formData.nome,
            name: formData.nome,

            data: formData.data,
            data_evento: formData.data,
            date: formData.data,

            horario: formData.horario,
            horario_evento: formData.horario,
            hora: formData.horario,

            endereco: formData.endereco,
            endereco_evento: formData.endereco,
            endereco_completo: formData.endereco,
            imagem_path: (typeof formData.imagem === 'string') ? formData.imagem : (formData.imagem_path || undefined),

            descricao: formData.descricao,
            description: formData.descricao
          };
          try {
            if (formData.data && formData.horario) {
              const iso = new Date(`${formData.data}T${formData.horario}`).toISOString();
              body.data_hora = iso;
              body.datahora = iso;
              body.start = iso;
            }
          } catch(e) {}
        }

        try {
        } catch (e) { console.warn('Falha ao logar payload', e); }

        try {
          let id_endereco = formData.id_endereco || null;
          if (!id_endereco) {
            if (body instanceof FormData) {
              const enderecoStr = body.get('endereco') || body.get('endereco_completo') || '';
              if (enderecoStr) {
                try {
                  const addr = await dashboardService.createEndereco({ endereco_completo: enderecoStr });
                  id_endereco = addr?.id ?? addr?.id_endereco ?? addr?.idEndereco ?? addr?._id ?? addr?.codigo ?? null;
                  if (id_endereco) body.append('id_endereco', id_endereco);
                } catch (e) { console.warn('Falha ao criar endereco (ignorando, continue):', e); }
              }
            } else {
              const enderecoStr = body.endereco || body.endereco_completo || '';
              if (enderecoStr) {
                try {
                  const addr = await dashboardService.createEndereco({ endereco_completo: enderecoStr });
                  id_endereco = addr?.id ?? addr?.id_endereco ?? addr?.idEndereco ?? addr?._id ?? addr?.codigo ?? null;
                  if (id_endereco) body.id_endereco = id_endereco;
                } catch (e) { console.warn('Falha ao criar endereco (ignorando, continue):', e); }
              }
            }

            try {
              const raw = (body instanceof FormData)
                ? (body.get('endereco') || body.get('endereco_completo') || '')
                : (body.endereco || body.endereco_completo || '');
              if (raw && !id_endereco) {
                if (body instanceof FormData) {
                  body.append('endereco_completo', raw);
                  body.append('endereco', raw);
                  body.append('address', raw);
                } else {
                  body.endereco_completo = raw;
                  body.endereco = raw;
                  body.address = raw;
                }
              }
            } catch (e) { console.warn('Falha ao anexar fallback de endereco:', e); }
          } else {
            if (body instanceof FormData) {
              body.append('id_endereco', id_endereco);
            } else {
              body.id_endereco = id_endereco;
            }
          }

          try {
            let empresaId = formData.id_empresa || formData.empresa || null;
            if (!empresaId) {
              try {
                const u = JSON.parse(localStorage.getItem('user') || '{}');
                empresaId = u.empresa || u.empresa_id || u.id_empresa || u.empresaId || u.id || u._id || null;
              } catch (e) { empresaId = null; }
            }
            if (empresaId) {
              if (body instanceof FormData) {
                body.append('id_empresa', empresaId);
                body.append('empresa', empresaId);
                body.append('empresa_id', empresaId);
              } else {
                body.id_empresa = empresaId;
                body.empresa = empresaId;
                body.empresa_id = empresaId;
              }
            }

            if (isEditing) {
              await dashboardService.updateEvento(editingId, body);
            } else {
              await dashboardService.createEvento(body);
            }
          } catch (e) {
            throw e;
          }
        } catch (err) {
          console.error('Falha ao salvar evento (admin)', err, err?.response?.data);
          let serverMessage = err?.response?.data?.message ?? err?.response?.data ?? err.message;
          try { if (typeof serverMessage === 'object') serverMessage = JSON.stringify(serverMessage); } catch(e){}
          setError('Erro ao salvar evento: ' + serverMessage);
        }
        await loadEventos();
        handleCloseModal();
      } catch (err) {
        setError('Erro ao salvar evento: ' + (err.response?.data?.message || err.message));
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
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
      return dataStr.split('-').reverse().join('/');
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
      return dataStr;
    }
    if (/^\d{4}-\d{2}-\d{2}T/.test(dataStr)) {
      return dataStr.substring(0, 10).split('-').reverse().join('/');
    }
    return dataStr;
  }

  function formatHora(horaStr) {
    if (!horaStr) return '';
    const match = horaStr.match(/^\d{2}:\d{2}(:\d{2})?/);
    if (match) {
      return match[0];
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(horaStr)) {
      return horaStr.substring(11, 16);
    }
    return horaStr;
  }

  return (
    <div>
      <DashboardHeader />
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <SidebarAdmin />
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
                      <input type="file" accept="image/*" onChange={e => setFormData({ ...formData, imagem: e.target.files[0] || null, imagemPreview: e.target.files[0] ? URL.createObjectURL(e.target.files[0]) : formData.imagemPreview })} />
                      {(formData.imagemPreview || (typeof formData.imagem === 'string' && formData.imagem)) && (
                        <div style={{ marginTop: 8 }}>
                          <img
                            src={formData.imagemPreview ? formData.imagemPreview : (formData.imagem && (formData.imagem.startsWith('http') ? formData.imagem : (formData.imagem.startsWith('/') ? `${String(API_BASE_URL).replace(/\/$/, '')}${formData.imagem}` : `${String(API_BASE_URL).replace(/\/$/, '')}/${String(formData.imagem).replace(/^\/+/, '')}`)))}
                            alt="preview"
                            style={{ maxWidth: 120, maxHeight: 90, objectFit: 'cover', borderRadius: 4 }}
                          />
                        </div>
                      )}
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