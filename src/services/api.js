import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const LOGIN_ENDPOINT = '/usuarios/login';
const DASHBOARD_ENDPOINT = '/dashboard/admin';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const dashboardService = {
  getRecompensas: async () => {
    try {
      const response = await api.get('/recompensas');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createRecompensa: async (dados) => {
    try {
      let config = {};
      let body = dados;
      const isFormData = dados instanceof FormData;
      if (isFormData) {
      } else {
        body = {
          nome: dados.nome,
          descricao: dados.descricao,
          quantidade: dados.quantidade,
          quantidade_disponivel: dados.quantidade || dados.quantidade_disponivel || dados.qtde || dados.estoque,
          valor: dados.valor,
          preco_moedas: dados.valor || dados.preco_moedas || dados.preco || dados.preco_moeda,
          valor_em_moedas: dados.valor || dados.preco_moedas,
          empresa: dados.empresa || dados.id_empresa || dados.empresa_id || dados.empresaId,
        };
      }
      if (isFormData) {
        try {
          const ensure = (key, alias) => {
            const v = body.get(key) || body.get(alias);
            if (v != null && v !== '') {
              if (!body.get(alias)) body.append(alias, v);
            }
          };
          ensure('quantidade', 'quantidade_disponivel');
          ensure('quantidade', 'qtde');
          ensure('valor', 'preco_moedas');
          ensure('valor', 'valor_em_moedas');
          ensure('empresa', 'id_empresa');
          ensure('empresa', 'empresa_id');
        } catch (e) {
          console.warn('createRecompensa: falha ao normalizar FormData', e);
        }
      }
      try {
        if (isFormData) {
          const entries = [];
          for (const p of body.entries()) entries.push([p[0], p[1]]);
          console.debug('createRecompensa: enviando FormData entries ->', entries, 'config:', config);
        } else {
          console.debug('createRecompensa: enviando JSON ->', body, 'config:', config);
        }
      } catch (e) {
        console.warn('createRecompensa: erro ao serializar payload para log', e);
      }

      const response = await api.post('/recompensas', body, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateRecompensa: async (id, dados) => {
    try {
      let config = {};
      let body = dados;
      const isFormData = dados instanceof FormData;
      if (isFormData) {
        try {
          const ensure = (key, alias) => {
            const v = body.get(key) || body.get(alias);
            if (v != null && v !== '') {
              if (!body.get(alias)) body.append(alias, v);
            }
          };
          ensure('quantidade', 'quantidade_disponivel');
          ensure('valor', 'preco_moedas');
          ensure('valor', 'valor_em_moedas');
          ensure('empresa', 'id_empresa');
        } catch (e) {
          console.warn('updateRecompensa: falha ao normalizar FormData', e);
        }
      } else {
        body = {
          nome: dados.nome,
          descricao: dados.descricao,
          quantidade: dados.quantidade,
          quantidade_disponivel: dados.quantidade || dados.quantidade_disponivel,
          valor: dados.valor,
          preco_moedas: dados.valor || dados.preco_moedas,
          valor_em_moedas: dados.valor || dados.preco_moedas,
          empresa: dados.empresa || dados.id_empresa || dados.empresa_id,
        };
      }
      const response = await api.put(`/recompensas/${id}`, body, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteRecompensa: async (id) => {
    try {
      if (!id) throw new Error('deleteRecompensa: id inválido ou ausente');
      // Normaliza caso o componente tenha passado um objeto com o id em campos diversos
      const resolvedId = (typeof id === 'object' && id !== null)
        ? (id.id || id._id || id.id_recompensas || id.idRecompensas || id.id_recompensa || id.recompensaId || id.uuid || id.toString && id.toString())
        : id;
      console.debug('deleteRecompensa: resolved id ->', resolvedId);
      if (!resolvedId) throw new Error('deleteRecompensa: não foi possível extrair id da recompensa');

      try {
        const response = await api.delete(`/recompensas/${encodeURIComponent(resolvedId)}`);
        return response.data;
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || '';
        console.warn('deleteRecompensa: primeira tentativa falhou', err?.response?.status, msg);
        if (msg && String(msg).includes('id_recompensas')) {
          console.debug('deleteRecompensa: tentando fallback DELETE /recompensas com body { id_recompresas }');
          const response2 = await api.delete('/recompensas', { data: { id_recompresas: resolvedId } });
          return response2.data;
        }
        throw err;
      }
    } catch (error) {
      console.warn('deleteRecompensa: erro ao chamar DELETE /recompensas/:id', error?.response?.status, error?.response?.data);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const res = await api.get(DASHBOARD_ENDPOINT);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  getRecompensasCount: async () => {
    try {
      const response = await api.get('/recompensas');
      const data = response.data;
      if (Array.isArray(data)) {
        return data.reduce((sum, recompensa) => {
          const qtd =
            recompensa.quantidade ||
            recompensa.qtd ||
            recompensa.estoque ||
            recompensa.qtde ||
            recompensa.quantidadeDisponivel ||
            recompensa.quantidade_disponivel ||
            parseInt(recompensa.quantidade) ||
            0;
          return sum + qtd;
        }, 0);
      }
      return data.count || data.total || 0;
    } catch (error) {
      return 0;
    }
  },

  getResgatesCount: async () => {
    try {
      const response = await api.get('/resgates/meus');
      const data = response.data;
      return Array.isArray(data) ? data.length : data.count || data.total || 0;
    } catch (error) {
      return 0;
    }
  },

  getVisitsData: async (dias = 30) => {
    try {
      const response = await api.get(`/dashboard/visitas-por-periodo?dias=${dias}`);
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data.visitas && Array.isArray(data.visitas)) return data.visitas;
      console.warn('Estrutura de dados inesperada, retornando array vazio');
      return [];
    } catch (error) {
      return [];
    }
  },

  getUsers: async () => {
    try {
      const res = await api.get('/usuarios');
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      const res = await api.patch(`/usuarios/${userId}/status`, { status });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  getEmpresas: async () => {
    try {
      const res = await api.get('/empresa');
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  setNomeEmpresa: async () => {
    try {
      const res = await api.get('/empresa');
      const empresas = res.data;
      const nomeEmpresa = empresas[0]?.nome_empresa;
      return nomeEmpresa;
    } catch (error) {
      throw error;
    }
  },

  getEmpresaById: async (id) => {
    try {
      const res = await api.get(`/empresa/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  countEventos: async (empresaId) => {
    try {
      const res = await api.get(`/empresa/${empresaId}/countEventos`);
      const data = res.data; 
      if (data == null) return 0;
      if (typeof data === 'number') return data;
      return data.total ?? data.countEventos ?? data.totalEventos ?? data.total_eventos ?? data.count_eventos ?? 0;
    } catch (error) {
      return 0;
    }
  },

  countEventosMe: async () => {
    try {
      const res = await api.get('/empresa/me/eventos/count');
      const data = res.data;
      if (data == null) return 0;
      if (typeof data === 'number') return data;
      return data.total ?? data.count ?? data.countEventos ?? data.total_eventos ?? data.count_eventos ?? 0;
    } catch (error) {
      return 0;
    }
  },

  getEmpresaByQuery: async (queryString) => {
    try {
      const res = await api.get(`/empresa?${queryString}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  updateEmpresaStatus: async (empresaId, status) => {
    try {
      const res = await api.patch(`/empresa/${empresaId}/status`, { status });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  updateEmpresa: async (empresaId, dados) => {
    try {
      const res = await api.put(`/empresa/${empresaId}`, dados);
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  getPontosTuristicos: async () => {
    try {
      const response = await api.get('/pontos-turisticos');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createPontoTuristico: async (dados) => {
    try {
      // build minimal JSON payload
      let jsonPayload = {};
      if (dados instanceof FormData) {
        for (const [k, v] of dados.entries()) jsonPayload[k] = v;
      } else if (typeof dados === 'object' && dados !== null) {
        jsonPayload = { ...dados };
      } else {
        jsonPayload = { nome: String(dados) };
      }

      // ensure required fields
      const nomeVal = jsonPayload.nome || jsonPayload.name || jsonPayload.titulo || jsonPayload.nome_ponto || '';
      jsonPayload.nome = jsonPayload.nome || nomeVal;
      jsonPayload.nome_ponto = jsonPayload.nome_ponto || nomeVal;

      if (jsonPayload.endereco && !jsonPayload.endereco_completo) jsonPayload.endereco_completo = jsonPayload.endereco;

      if (!jsonPayload.descricao) jsonPayload.descricao = jsonPayload.description || '';
      if (!jsonPayload.horario_funcionamento) jsonPayload.horario_funcionamento = jsonPayload.horario || '';

      // attach empresa id if available
      try {
        const rawUser = localStorage.getItem('user');
        const u = rawUser ? JSON.parse(rawUser) : {};
        const empresaId = u.empresa || u.empresa_id || u.id_empresa || u.empresaId || u.id || u._id || null;
        if (empresaId && !jsonPayload.id_empresa && !jsonPayload.empresa) {
          jsonPayload.id_empresa = empresaId;
          jsonPayload.empresa = empresaId;
        }
      } catch (e) {}

      console.log('createPontoTuristico: payload final (antes de filtrar) ->', jsonPayload);

      // validação cliente: nome é obrigatório no modelo Prisma do backend
      if (!jsonPayload.nome || String(jsonPayload.nome).trim() === '') {
        throw new Error('createPontoTuristico: campo "nome" é obrigatório');
      }

      // Filtrar somente os campos esperados pelo backend/prisma para evitar erros de campo inválido
      const allowed = new Set([
        'nome',
        'descricao',
        'horario_funcionamento',
        'tipo',
        'endereco_completo',
        'id_endereco',
        'id_figurinha',
        'empresa',
        'id_empresa'
      ]);
      const finalPayload = {};
      for (const k of Object.keys(jsonPayload)) {
        if (allowed.has(k)) finalPayload[k] = jsonPayload[k];
      }

      console.log('createPontoTuristico: payload enviado ->', finalPayload);

      // Tentativa direta no endpoint canônico do backend
      const endpoints = ['/pontos-turisticos'];
      const config = { headers: { 'Content-Type': 'application/json' } };
      let lastErr = null;
      for (const ep of endpoints) {
        try {
          const res = await api.post(ep, finalPayload, config);
          console.log('createPontoTuristico: resposta OK', ep, res.status, res.data);
          return res.data;
        } catch (err) {
          lastErr = err;
          console.warn('createPontoTuristico: tentativa', ep, 'falhou', err?.response?.status, err?.response?.data || err?.message);
        }
      }
      throw lastErr || new Error('createPontoTuristico: sem endpoint disponível');
    } catch (error) {
      console.error('createPontoTuristico: erro final', error?.response?.status, error?.response?.data || error?.message || error);
      throw error;
    }
  },

  updatePontoTuristico: async (pontoId, dados) => {
    try {
      const response = await api.put(`/pontos-turisticos/${pontoId}`, dados);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePontoTuristicoStatus: async (pontoId, status) => {
    try {
      const response = await api.patch(`/pontos-turisticos/${pontoId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deletePontoTuristico: async (pontoId) => {
    try {
      const response = await api.delete(`/pontos-turisticos/${encodeURIComponent(pontoId)}`);
      return response.data;
    } catch (error) {
      // fallback: some backends expect DELETE with body
      try {
        const resp2 = await api.delete('/pontos-turisticos', { data: { id_ponto: pontoId, id: pontoId } });
        return resp2.data;
      } catch (e) {
        throw error;
      }
    }
  },

  downloadPDF: async (pontoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/qrcodes/pontos-turisticos/${pontoId}/download-pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  downloadQRCode: async (pontoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/qrcodes/pontos-turisticos/${pontoId}/download-qrcode`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getEventos: async () => {
    try {
      const response = await api.get('/eventos');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getEventosMe: async () => {
    try {
      // Primeiro, tentar o endpoint específico da empresa (se o backend suportar)
      let resp;
      try {
        resp = await api.get('/empresa/me/eventos');
      } catch (e) {
        // fallback genérico
        resp = await api.get('/eventos');
      }
      const respData = resp?.data ?? [];
      let arr = [];
      if (Array.isArray(respData)) arr = respData;
      else if (Array.isArray(respData?.data)) arr = respData.data;
      else if (Array.isArray(respData?.eventos)) arr = respData.eventos;
      else if (Array.isArray(respData?.items)) arr = respData.items;
      else if (Array.isArray(respData?.results)) arr = respData.results;

      let empresaId = null;
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        empresaId = u.empresa || u.empresa_id || u.id_empresa || u.empresaId || u.empresa?.id || u.id || u._id || null;
      } catch (e) { empresaId = null; }

      if (!empresaId) return arr;

      const filtered = arr.filter(ev => {
        const evEmpresaId = ev.id_empresa ?? ev.empresa_id ?? ev.idEmpresa ?? ev.empresa?.id ?? ev.empresaId ?? ev.empresa?._id ?? ev.empresa ?? null;
        if (evEmpresaId && String(evEmpresaId) === String(empresaId)) return true;
        const creator = ev.criador || ev.creator || ev.owner || ev.usuario || ev.user || ev.responsavel;
        if (creator && typeof creator === 'object') {
          const cid = creator.id || creator._id || creator.id_empresa || creator.empresa_id;
          if (cid && String(cid) === String(empresaId)) return true;
        }
        try { if (JSON.stringify(ev).includes(String(empresaId))) return true; } catch(e){}
        return false;
      });
      return filtered;
    } catch (error) {
      throw error;
    }
  },
  countEventosByMonth: async (year) => {
    try {
      const res = await api.get(`/empresa/me/eventos/count-by-month?year=${year}`);
      return res.data;
    } catch (error) {
      return [];
    }
  },
  createEvento: async (dados) => {
    try {
      let config = {};
      let body = dados;
      const endpoints = ['/eventos', '/empresa/me/eventos', '/empresa/eventos', '/eventos/me'];
      let lastError = null;
      for (const ep of endpoints) {
        try {
          if (body instanceof FormData) {
            const entries = [];
            for (const p of body.entries()) entries.push([p[0], p[1]]);
            console.debug('createEvento: tentando endpoint', ep, 'com FormData:', entries);
          } else {
            console.debug('createEvento: tentando endpoint', ep, 'com JSON:', body);
          }
          const response = await api.post(ep, body, config);
          console.debug('createEvento: resposta OK', ep, response?.status, response?.data);
          return response.data;
        } catch (err) {
          lastError = err;
          const status = err?.response?.status;
          console.warn(`createEvento: tentativa ${ep} falhou com status ${status}`);
          console.warn('createEvento: response.data', err?.response?.data);
        }
      }
      try {
        if (!(body instanceof FormData)) {
          const wrappers = ['evento', 'data', 'body'];
          for (const w of wrappers) {
            try {
              const wrapped = { [w]: body };
              console.debug('createEvento: tentando envelope', w, '->', wrapped);
              const res = await api.post('/eventos', wrapped, config);
              console.debug('createEvento: resposta envelope OK', res?.status, res?.data);
              return res.data;
            } catch (e) {
              lastError = e;
              console.warn(`createEvento: tentativa envelope ${w} falhou`, e?.response?.status);
              console.warn('createEvento: envelope response.data', e?.response?.data);
            }
          }
        }
      } catch (e) {
        lastError = lastError || e;
      }
      throw lastError || new Error('createEvento: sem endpoint disponível');
    } catch (error) {
      throw error;
    }
  },

  createEndereco: async (dados) => {
    try {
      const payload = typeof dados === 'string' ? { endereco_completo: dados } : dados;
      const response = await api.post('/enderecos', payload);
      return response.data;
    } catch (error) {
      try {
        const payload = typeof dados === 'string' ? { endereco_completo: dados } : dados;
        const response = await api.post('/endereco', payload);
        return response.data;
      } catch (e) {
        throw e || error;
      }
    }
  },

  getEnderecoById: async (id) => {
    try {
      const res = await api.get(`/enderecos/${id}`);
      return res.data;
    } catch (error) {
      try {
        const res2 = await api.get(`/endereco/${id}`);
        return res2.data;
      } catch (e) {
        throw error;
      }
    }
  },

  updateEvento: async (id, dados) => {
    try {
      let config = {};
      let body = dados;
      const response = await api.put(`/eventos/${id}`, body, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteEvento: async (id) => {
    try {
      const res = await api.delete(`/eventos/${id}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
};

export const authService = {
  login: async (credentials) => {
    const url = `${API_BASE_URL}${LOGIN_ENDPOINT}`;
    const loginDataFormats = [
      { email: credentials.email, password: credentials.password },
      { email: credentials.email, senha: credentials.password },
      { usuario: credentials.email, password: credentials.password },
      { usuario: credentials.email, senha: credentials.password },
    ];
    for (let i = 0; i < loginDataFormats.length; i++) {
      const loginData = loginDataFormats[i];
      try {
        const res = await api.post(LOGIN_ENDPOINT, loginData);
        const data = res.data;
        if (data) return data;
      } catch (error) {

      }
    }
    throw new Error('Todas as tentativas falharam. Verifique email/senha ou backend.');
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export { api, API_BASE_URL };

export default { dashboardService, authService };
