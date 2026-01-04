import axios from 'axios';

let API_BASE_URL = 'http://localhost:3001';
try {
  if (typeof import.meta !== 'undefined' && import.meta && import.meta.env && import.meta.env.VITE_API_URL) {
    API_BASE_URL = import.meta.env.VITE_API_URL;
  }
} catch (e) {
  try {
    if (typeof process !== 'undefined' && process && process.env && process.env.REACT_APP_API_URL) {
      API_BASE_URL = process.env.REACT_APP_API_URL;
    }
  } catch (e2) {}
}

const LOGIN_ENDPOINT = '/usuarios/login';
const DASHBOARD_ENDPOINT = '/dashboard/admin';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  try {
    if (config && config.data && (typeof FormData !== 'undefined') && config.data instanceof FormData) {
      config.headers = config.headers || {};
      if (Object.prototype.hasOwnProperty.call(config.headers, 'Content-Type')) delete config.headers['Content-Type'];
    }
  } catch (e) { }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const cfg = error?.config || {};
      const headers = cfg.headers || {};
      const combined = { ...(headers.common || {}), ...headers };
      let skipHeader = false;
      for (const k of Object.keys(combined)) {
        try {
          if (String(k).toLowerCase() === 'x-skip-auth-redirect') {
            skipHeader = true;
            break;
          }
        } catch (e) {}
      }
      const status = error.response?.status;
      console.warn('api.interceptor.response: request error', { url: cfg.url, method: cfg.method, status, skipHeader });
      if (status === 401 && !skipHeader) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } catch (e) {
    }
    return Promise.reject(error);
  }
);

export const dashboardService = {
  getRecompensas: async () => {
    try {
      const response = await api.get('/recompensas', { headers: { 'X-Skip-Auth-Redirect': '1' } });
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
          const imgFile = body.get('imagem') || body.get('image') || body.get('file');
          if (imgFile instanceof File) {
            if (!body.get('image')) body.append('image', imgFile);
            if (!body.get('file')) body.append('file', imgFile);
          }
        } catch (e) {
          console.warn('createRecompensa: falha ao normalizar FormData', e);
        }
        config.headers = config.headers || {};
        if (Object.prototype.hasOwnProperty.call(config.headers, 'Content-Type')) delete config.headers['Content-Type'];
      }
      try {
        if (isFormData) {
          const entries = [];
          for (const p of body.entries()) entries.push([p[0], p[1]]);
        } else {
        }
      } catch (e) {
        console.warn('createRecompensa: erro ao serializar payload para log', e);
      }

      if (isFormData) {
          try {
            const entries = [];
            for (const p of body.entries()) entries.push([p[0], p[1]]);
          } catch (e) {}
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
          const imgFile = body.get('imagem') || body.get('image') || body.get('file');
          if (imgFile instanceof File) {
            if (!body.get('image')) body.append('image', imgFile);
            if (!body.get('file')) body.append('file', imgFile);
          }
        } catch (e) {
          console.warn('updateRecompensa: falha ao normalizar FormData', e);
        }
        config.headers = config.headers || {};
        if (Object.prototype.hasOwnProperty.call(config.headers, 'Content-Type')) delete config.headers['Content-Type'];
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
      if (isFormData) {
        try {
          const entries = [];
          for (const p of body.entries()) entries.push([p[0], p[1]]);
        } catch (e) {}
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
      const resolvedId = (typeof id === 'object' && id !== null)
        ? (id.id || id._id || id.id_recompensas || id.idRecompensas || id.id_recompensa || id.recompensaId || id.uuid || id.toString && id.toString())
        : id;
      if (!resolvedId) throw new Error('deleteRecompensa: não foi possível extrair id da recompensa');

      try {
        const response = await api.delete(`/recompensas/${encodeURIComponent(resolvedId)}`);
        return response.data;
      } catch (err) {
        const msg = err?.response?.data?.message || err?.message || '';
        console.warn('deleteRecompensa: primeira tentativa falhou', err?.response?.status, msg);
        if (msg && String(msg).includes('id_recompensas')) {
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

  resgatarRecompensa: async (recompensaId, extra = {}) => {
    try {

      const endpoints = [];

      if (recompensaId) endpoints.push(`/resgates/${encodeURIComponent(recompensaId)}`);

      if (!recompensaId && extra && extra.codigo) endpoints.push(`/resgates/${encodeURIComponent(extra.codigo)}`);

      endpoints.push('/resgates');
      if (recompensaId) endpoints.push(`/recompensas/${encodeURIComponent(recompensaId)}/resgatar`, `/recompensas/${encodeURIComponent(recompensaId)}/resgate`);
      endpoints.push('/recompensas/resgatar');
      endpoints.push('/resgates/meus');

      const payloadOptions = [];
      if (recompensaId) {
        payloadOptions.push({ id_recompensa: recompensaId });
        payloadOptions.push({ id_recompresas: recompensaId });
        payloadOptions.push({ id_recompensas: recompensaId });
        payloadOptions.push({ recompensa_id: recompensaId });
        payloadOptions.push({ id: recompensaId });
        payloadOptions.push({ idRecompensa: recompensaId });
        payloadOptions.push({ recompensa: recompensaId });
      }

      payloadOptions.push({});

      let lastErr = null;
      for (const ep of endpoints) {
        for (const payload of payloadOptions) {
          try {
            const body = Object.keys(payload).length ? { ...payload, ...extra } : { ...extra };
            const res = await api.post(ep, body);

            try {
              const me = await dashboardService.getMeusDados();
              try {

                const latestSaldo = await dashboardService.getSaldo().catch(() => null);
                if (me && typeof me === 'object') {
                  if (latestSaldo != null) me.saldo = latestSaldo;
                  try { localStorage.setItem('user', JSON.stringify(me)); } catch (e) { /* ignore */ }
                  try { window.dispatchEvent(new CustomEvent('user:updated', { detail: me })); } catch (e) {}
                } else if (latestSaldo != null) {

                  try { localStorage.setItem('saldo', String(latestSaldo)); } catch (e) {}
                  try { window.dispatchEvent(new CustomEvent('user:updated', { detail: { saldo: latestSaldo } })); } catch (e) {}
                }
              } catch (e) {

              }
            } catch (e) {

            }
            return res.data;
          } catch (err) {
            lastErr = err;
          }
        }
      }
      throw lastErr || new Error('resgatarRecompensa: nenhum endpoint disponível');
    } catch (error) {
      throw error;
    }
  },

  getMinhasFigurinhas: async () => {
    try {
      const response = await api.get('/meu-album-de-figurinhas');
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar figurinhas:", error);
      return [];
    }
  },

  getDashboardUsuario: async () => {
    try {
      const response = await api.get('/dashboard/usuario');
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar dashboard:", error);
      throw error;
    }
  },

  getMinhasFigurinhasCount: async () => {
    try {
      const dashboard = await dashboardService.getDashboardUsuario();
      return dashboard.totalFigurinhas || dashboard.figurinhas || dashboard.count || 0;
    } catch (error) {
      return 0;
    }
  },

  getMeusResgates: async () => {
    try {
      const dashboard = await dashboardService.getDashboardUsuario();
      return dashboard.resgates || dashboard.recompensas || [];
    } catch (error) {
      return [];
    }
  },

  getSaldo: async () => {
    try {
      const dashboard = await dashboardService.getDashboardUsuario();
      return dashboard.saldo || dashboard.estelitas || 0;
    } catch (error) {
      return 0;
    }
  },

  getMeusDados: async () => {
    try {
      const endpoints = [
        '/usuarios/me',
        '/auth/me',
        '/usuarios/perfil',
      ];
      for (const ep of endpoints) {
        try {
          const response = await api.get(ep);
          return response.data;
        } catch (e) {
          if (e?.response?.status !== 404) throw e;
        }
      }
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    }
  },

  atualizarMeusDados: async (dados) => {
    try {
      const endpoints = [
        '/usuarios/me',
        '/auth/me',
        '/usuarios/perfil',
      ];
      const body = {
        nome: dados.nome || dados.nome_completo,
        nome_completo: dados.nome || dados.nome_completo,
      };
      let lastErr = null;
      for (const ep of endpoints) {
        try {
          const response = await api.put(ep, body);
          const updatedUser = response.data;
          const stored = localStorage.getItem('user');
          if (stored) {
            const user = JSON.parse(stored);
            const merged = { ...user, ...updatedUser, nome: body.nome, nome_completo: body.nome_completo };
            localStorage.setItem('user', JSON.stringify(merged));
          }
          return updatedUser;
        } catch (e) {
          lastErr = e;
          if (e?.response?.status === 404 || e?.response?.status === 405) continue;
          throw e;
        }
      }
      for (const ep of endpoints) {
        try {
          const response = await api.patch(ep, body);
          const updatedUser = response.data;
          const stored = localStorage.getItem('user');
          if (stored) {
            const user = JSON.parse(stored);
            const merged = { ...user, ...updatedUser, nome: body.nome, nome_completo: body.nome_completo };
            localStorage.setItem('user', JSON.stringify(merged));
          }
          return updatedUser;
        } catch (e) {
          lastErr = e;
        }
      }
      if (lastErr) throw lastErr;
      throw new Error('atualizarMeusDados: nenhum endpoint respondeu');
    } catch (error) {
      throw error;
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
      const empresas = res.data || [];
      let chosen = null;
      try {
        const raw = localStorage.getItem('user');
        const u = raw ? JSON.parse(raw) : null;
        const userId = u && (u.id || u._id || u.id_usuario || u.usuario_id || u.usuario);
        const userEmail = u && (u.email || u.usuario || null);
        const userNomeEmpresa = u && (u.nome_empresa || u.nome_empresa || u.nome || null);

        if (Array.isArray(empresas) && empresas.length) {
          chosen = empresas.find(e => {
            try {
              if (userId && (String(e.id_usuario) === String(userId) || String(e.usuario) === String(userId) || String(e.id) === String(userId) || String(e._id) === String(userId))) return true;
              if (userEmail && (String(e.email || e.contato || '') === String(userEmail))) return true;
              if (userNomeEmpresa && (String(e.nome_empresa || e.nome || e.razao_social || '') === String(userNomeEmpresa))) return true;
            } catch (err) {}
            return false;
          }) || empresas[0];
        } else {
          chosen = empresas;
        }
      } catch (e) {
        chosen = empresas[0];
      }
      const nome = chosen && (chosen.nome_empresa || chosen.nome || chosen.razao_social || null);
      return nome;
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

  registrarVisita: async (pontoId) => {
    try {
      if (!pontoId) throw new Error('registrarVisita: pontoId inválido');
      const endpoints = [
        `/pontos-turisticos/${encodeURIComponent(pontoId)}/visita`,
        `/pontos-turisticos/${encodeURIComponent(pontoId)}/visitar`,
        `/pontos-turisticos/${encodeURIComponent(pontoId)}/registrar-visita`,
        '/visitas',
        '/resgates',
      ];

      const payloadOptions = [
        {},
        { id_ponto: pontoId },
        { ponto_id: pontoId },
        { pontoId },
        { id: pontoId },
      ];

      let lastErr = null;
      for (const ep of endpoints) {
        for (const payload of payloadOptions) {
          try {
            const body = Object.keys(payload).length ? payload : {};
            const res = await api.post(ep, body);
            return res.data;
          } catch (err) {
            lastErr = err;
          }
        }
      }
      throw lastErr || new Error('registrarVisita: nenhum endpoint disponível');
    } catch (error) {
      throw error;
    }
  },

  resolveQrToken: async (token) => {
    try {
      if (!token) throw new Error('resolveQrToken: token ausente');
      const tryPaths = [
        `/visitas/qr?token=${encodeURIComponent(token)}`,
        `/qr?token=${encodeURIComponent(token)}`,
        `/qrcodes/resolve?token=${encodeURIComponent(token)}`,
        `/qrcodes?token=${encodeURIComponent(token)}`,
        `/registrar/qr?token=${encodeURIComponent(token)}`,
      ];
      for (const p of tryPaths) {
        try {
          const resp = await api.get(p);
          return resp.data;
        } catch (e) {
        }
      }
    } catch (error) {
      try {
        const resp2 = await api.get(`/qrcodes/resolve?token=${encodeURIComponent(token)}`);
        return resp2.data;
      } catch (e) {
        throw error;
      }
    }
  },

  visitarViaQr: async (token) => {
    try {
      if (!token) throw new Error('visitarViaQr: token ausente');
      try {
        const respDirect = await api.post(`/visitas/qr?token=${encodeURIComponent(token)}`, {});
        return respDirect.data;
      } catch (firstErr) {
        const statusFirst = firstErr?.response?.status || null;
        if (statusFirst === 409) {
          try { return firstErr.response.data; } catch (e) { }
        }
        console.warn('visitarViaQr: POST /visitas/qr inicial falhou, seguindo para outros endpoints', statusFirst, firstErr?.response?.data || firstErr?.message || firstErr);
      }

      const endpoint = '/qr';
      const payloadKeys = ['token', 'id_qr_code', 'id_qrcode', 'id', 'codigo', 'code', 'qr'];
      const headersJson = { 'Content-Type': 'application/json' };
      const headersForm = { 'Content-Type': 'application/x-www-form-urlencoded' };

      let lastErr = null;
      const authHeader = {};
      try {
        const t = localStorage.getItem('token');
        if (t) authHeader.Authorization = `Bearer ${t}`;
      } catch (e) {}

      for (const key of payloadKeys) {
        const body = { [key]: token };
        try {
          const res = await api.post(endpoint, body, { headers: { ...headersJson, ...authHeader } });
          return res.data;
        } catch (e) {
          lastErr = e;
          console.warn('visitarViaQr: POST JSON falhou', endpoint, key, e?.response?.status, e?.response?.data || e?.message || e);
        }
        try {
          const params = new URLSearchParams();
          params.append(key, token);
          const res2 = await api.post(endpoint, params.toString(), { headers: { ...headersForm, ...authHeader } });
          return res2.data;
        } catch (e) {
          lastErr = e;
          console.warn('visitarViaQr: POST form falhou', endpoint, key, e?.response?.status, e?.response?.data || e?.message || e);
        }
      }

      try {
        const resg = await api.get(`${endpoint}?token=${encodeURIComponent(token)}`, { headers: { ...authHeader } });
        return resg.data;
      } catch (eg) {
        lastErr = eg;
      }

      try {
        const respFallback = await api.post(`/visitas/qr?token=${encodeURIComponent(token)}`, {}, { headers: { ...authHeader } });
        return respFallback.data;
      } catch (efb) {
        lastErr = efb;
        console.warn('visitarViaQr: fallback POST /visitas/qr falhou', efb?.response?.status, efb?.response?.data || efb?.message || efb);
      }

      try {
        const jwt = (typeof localStorage !== 'undefined') ? localStorage.getItem('token') : null;
        const headersAbs = jwt ? { Authorization: `Bearer ${jwt}` } : {};
        const absResp = await axios.post(`${API_BASE_URL}/visitas/qr?token=${encodeURIComponent(token)}`, {}, { headers: headersAbs });
        return absResp.data;
      } catch (eabs) {
        lastErr = eabs;
        const st = eabs?.response?.status || null;
        if (st === 409) {
          try { return eabs.response.data; } catch (e2) {}
        }
        console.warn('visitarViaQr: fallback absoluto falhou', eabs?.response?.status, eabs?.response?.data || eabs?.message || eabs);
      }

      throw lastErr || new Error('visitarViaQr: sem endpoint válido');
    } catch (error) {
      throw error;
    }
  },

  createPontoTuristico: async (dados) => {
    try {
      let jsonPayload = {};
      if (dados instanceof FormData) {
        for (const [k, v] of dados.entries()) jsonPayload[k] = v;
      } else if (typeof dados === 'object' && dados !== null) {
        jsonPayload = { ...dados };
      } else {
        jsonPayload = { nome: String(dados) };
      }

      const nomeVal = jsonPayload.nome || jsonPayload.name || jsonPayload.titulo || jsonPayload.nome_ponto || '';
      jsonPayload.nome = jsonPayload.nome || nomeVal;
      jsonPayload.nome_ponto = jsonPayload.nome_ponto || nomeVal;

      if (jsonPayload.endereco && !jsonPayload.endereco_completo) jsonPayload.endereco_completo = jsonPayload.endereco;

      if (!jsonPayload.descricao) jsonPayload.descricao = jsonPayload.description || '';
      if (!jsonPayload.horario_funcionamento) jsonPayload.horario_funcionamento = jsonPayload.horario || '';

      try {
        const rawUser = localStorage.getItem('user');
        const u = rawUser ? JSON.parse(rawUser) : {};
        const empresaId = u.empresa || u.empresa_id || u.id_empresa || u.empresaId || u.id || u._id || null;
        if (empresaId && !jsonPayload.id_empresa && !jsonPayload.empresa) {
          jsonPayload.id_empresa = empresaId;
          jsonPayload.empresa = empresaId;
        }
      } catch (e) {}

      if (!jsonPayload.nome || String(jsonPayload.nome).trim() === '') {
        throw new Error('createPontoTuristico: campo "nome" é obrigatório');
      }

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

      const endpoints = ['/pontos-turisticos'];
      const config = { headers: { 'Content-Type': 'application/json' } };
      let lastErr = null;
      for (const ep of endpoints) {
        try {
          const res = await api.post(ep, finalPayload, config);
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
      const response = await api.get('/eventos', { headers: { 'X-Skip-Auth-Redirect': '1' } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getEventosMe: async () => {
    try {
      let resp;
      try {
        resp = await api.get('/empresa/me/eventos');
      } catch (e) {
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
      const isFormData = body instanceof FormData;
      if (isFormData) {
        try {
          const ensure = (key, alias) => {
            const v = body.get(key) || body.get(alias);
            if (v != null && v !== '') {
              if (!body.get(alias)) body.append(alias, v);
            }
          };
          ensure('imagem', 'image');
          ensure('imagem', 'file');
          const imgFile = body.get('imagem') || body.get('image') || body.get('file');
          if (imgFile instanceof File) {
            if (!body.get('image')) body.append('image', imgFile);
            if (!body.get('file')) body.append('file', imgFile);
          }
        } catch (e) {
          console.warn('createEvento: falha ao normalizar FormData', e);
        }
        config.headers = config.headers || {};
        if (Object.prototype.hasOwnProperty.call(config.headers, 'Content-Type')) delete config.headers['Content-Type'];
      }
      let lastError = null;
      for (const ep of endpoints) {
        try {
          if (body instanceof FormData) {
            const entries = [];
            for (const p of body.entries()) entries.push([p[0], p[1]]);
          } else {
          }
          const response = await api.post(ep, body, config);
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
              const res = await api.post('/eventos', wrapped, config);
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
      const isFormData = (typeof FormData !== 'undefined') && (body instanceof FormData);
      if (isFormData) {
        try {
          const ensure = (key, alias) => {
            const v = body.get(key) || body.get(alias);
            if (v != null && v !== '') {
              if (!body.get(alias)) body.append(alias, v);
            }
          };
          ensure('imagem', 'image');
          ensure('imagem', 'file');
          ensure('data', 'data_evento');
          ensure('horario', 'hora');
          const imgFile = body.get('imagem') || body.get('image') || body.get('file');
          if (imgFile instanceof File) {
            if (!body.get('image')) body.append('image', imgFile);
            if (!body.get('file')) body.append('file', imgFile);
          }
        } catch (e) {
          console.warn('updateEvento: falha ao normalizar FormData', e);
        }
        config.headers = config.headers || {};
        if (Object.prototype.hasOwnProperty.call(config.headers, 'Content-Type')) delete config.headers['Content-Type'];
      }


      try {
        const response = await api.put(`/eventos/${encodeURIComponent(id)}`, body, config);
        return response.data;
      } catch (err) {


        if (isFormData) {
          try {

            try {
              if (!body.get('_method')) body.append('_method', 'PUT');
            } catch (e) {}
            const respPost = await api.post(`/eventos/${encodeURIComponent(id)}`, body, config);
            return respPost.data;
          } catch (postErr) {

            try {
              const cfg2 = { ...(config || {}) };
              cfg2.headers = { ...(cfg2.headers || {}), 'X-HTTP-Method-Override': 'PUT' };
              const respPost2 = await api.post(`/eventos/${encodeURIComponent(id)}`, body, cfg2);
              return respPost2.data;
            } catch (postErr2) {

              try {
                try { if (!body.get('_method')) body.append('_method', 'PUT'); } catch(e){}
                try { if (!body.get('id')) body.append('id', String(id)); } catch(e){}
                const respPost3 = await api.post('/eventos', body, config);
                return respPost3.data;
              } catch (postErr3) {

                try {
                  const respPost4 = await api.post(`/eventos?_method=PUT`, body, config);
                  return respPost4.data;
                } catch (postErr4) {
                  console.warn('updateEvento: multiple POST fallbacks failed', postErr4?.response?.status);

                  try {
                    const respPatch = await api.patch(`/eventos/${encodeURIComponent(id)}`, body, config);
                    return respPatch.data;
                  } catch (patchErr) {
                    console.warn('updateEvento: PATCH also failed', patchErr?.response?.status);
                    throw postErr4 || postErr3 || postErr2 || postErr || patchErr || err;
                  }
                }
              }
            }
          }
        }

        try {
          const resp2 = await api.patch(`/eventos/${encodeURIComponent(id)}`, body, config);
          return resp2.data;
        } catch (err2) {
          console.warn('updateEvento: falha ao atualizar evento em /eventos/:id', err?.response?.status, err2?.response?.status);
          throw err2 || err;
        }
      }
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
  register: async (user) => {
    try {
      if (!user) throw new Error('register: payload ausente');
      const nome = user.nome || user.name || user.nome_completo || user.nomeCompleto;
      const email = user.email || user.usuario || user.emailAddress;
      const senha = user.senha || user.password || user.pwd;
      const role = user.role || user.tipo || user.type || 'comum';

      const body = {
        ...(nome ? { nome_completo: nome } : {}),
        ...(email ? { email } : {}),
        ...(senha ? { senha } : {}),
        ...(user && user.role ? { role: user.role } : {}),
      };

      try {
        const res = await api.post('/usuarios/cadastrar', body, { headers: { 'X-Skip-Auth-Redirect': '1' } });
        return res.data;
      } catch (err) {
        const status = err?.response?.status;
        const respData = err?.response?.data;
        console.warn('authService.register: /usuarios/cadastrar falhou', status, respData);
        if (status === 401) {
          const msg = (respData && respData.message) ? respData.message : '401 Unauthorized';
          const e = new Error(`register: endpoint exige autorização - ${msg}`);
          e.response = err.response;
          throw e;
        }
        throw err;
      }
    } catch (error) {
      throw error;
    }
  },
  login: async (credentials) => {
    const url = `${API_BASE_URL}${LOGIN_ENDPOINT}`;
    const loginDataFormats = [
      { email: credentials.email, password: credentials.password },
      { email: credentials.email, senha: credentials.password },
      { usuario: credentials.email, password: credentials.password },
      { usuario: credentials.email, senha: credentials.password },
    ];
    let lastErr = null;
    for (let i = 0; i < loginDataFormats.length; i++) {
      const loginData = loginDataFormats[i];
      try {
        const res = await api.post(LOGIN_ENDPOINT, loginData, { headers: { 'X-Skip-Auth-Redirect': '1' } });
        const data = res.data;
        if (data) return data;
      } catch (error) {
        lastErr = error;
      }
    }
    if (lastErr) throw lastErr;
    throw new Error('Todas as tentativas falharam. Verifique email/senha ou backend.');
  },
  requestPasswordReset: async (emailOrPayload) => {
    try {
      if (!emailOrPayload) throw new Error('requestPasswordReset: email ausente');
      const email = typeof emailOrPayload === 'string' ? emailOrPayload : (emailOrPayload.email || emailOrPayload.usuario || emailOrPayload.emailAddress);
      const payloads = [ { email } ];
      const endpoints = [
        '/auth/forgot-password',
        '/usuarios/forgot-password',
        '/usuarios/forgot',
      ];
      let lastErr = null;
      for (const ep of endpoints) {
        for (const body of payloads) {
          try {
            const res = await api.post(ep, body, { headers: { 'X-Skip-Auth-Redirect': '1' } });
            return res.data;
          } catch (err) {
            lastErr = err;
          }
        }
      }
      if (lastErr) throw lastErr;
      throw new Error('requestPasswordReset: nenhum endpoint respondeu');
    } catch (error) {
      throw error;
    }
  },
  verifyResetToken: async (token) => {
    try {
      if (!token) throw new Error('verifyResetToken: token ausente');
      const tryPaths = [
        `/auth/validate-reset-token?token=${encodeURIComponent(token)}`,
      ];
      for (const p of tryPaths) {
        try {
          const resp = await api.get(p, { headers: { 'X-Skip-Auth-Redirect': '1' } });
          return resp.data;
        } catch (e) {
        }
      }
      return { ok: true };
    } catch (error) {
      throw error;
    }
  },
  resetPassword: async (payload) => {
    try {
      if (!payload) throw new Error('resetPassword: payload ausente');
      const token = payload.token || payload.token_reset || payload.code || payload.codigo;
      const senha = payload.senha || payload.password || payload.newPassword || payload.new_password || payload.novaSenha;
      if (!senha) throw new Error('resetPassword: nova senha ausente');
      const bodies = [
        { token, novaSenha: senha },
        { token, senha },
        { token, password: senha },
        { code: token, senha },
        { codigo: token, senha },
      ];
      const endpoints = [
        '/auth/reset-password',
        '/usuarios/reset-password',
        '/usuarios/redefinir-senha',
        '/auth/reset',
        '/password/reset',
        '/usuarios/reset'
      ];
      let lastErr = null;
      for (const ep of endpoints) {
        for (const b of bodies) {
          try {
            const res = await api.post(ep, b, { headers: { 'X-Skip-Auth-Redirect': '1' } });
            return res.data;
          } catch (err) {
            lastErr = err;
          }
        }
      }
      if (lastErr) throw lastErr;
      throw new Error('resetPassword: nenhum endpoint respondeu');
    } catch (error) {
      throw error;
    }
  },
  changePassword: async (senhaAtual, novaSenha) => {
    try {
      if (!senhaAtual || !novaSenha) throw new Error('changePassword: senhas ausentes');
      const endpoints = [
        '/usuarios/me/senha',
        '/auth/change-password',
        '/usuarios/change-password',
        '/usuarios/alterar-senha',
        '/auth/alterar-senha',
      ];
      const bodies = [
        { senhaAtual, novaSenha },
        { senha_atual: senhaAtual, nova_senha: novaSenha },
        { currentPassword: senhaAtual, newPassword: novaSenha },
      ];
      let lastErr = null;
      for (const ep of endpoints) {
        for (const b of bodies) {
          try {
            const res = await api.put(ep, b);
            return res.data;
          } catch (err) {
            if (err?.response?.status === 404 || err?.response?.status === 405) {
              try {
                const resPost = await api.post(ep, b);
                return resPost.data;
              } catch (errPost) {
                lastErr = errPost;
              }
            } else {
              lastErr = err;
            }
          }
        }
      }
      if (lastErr) throw lastErr;
      throw new Error('changePassword: nenhum endpoint respondeu');
    } catch (error) {
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export { api, API_BASE_URL };

export default { dashboardService, authService };
