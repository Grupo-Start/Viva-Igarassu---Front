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

async function request(method, url, data = null, config = {}) {
  try {
    const response = await api.request({ method, url, data, ...config });
    return response.data;
  } catch (err) {
    const status = err.response?.status;
    if (status === 404) {
      console.warn(`API ${method.toUpperCase()} ${url} returned 404 (Not Found)`);
      return method.toLowerCase() === 'get' ? [] : null;
    }
    throw err;
  }
}

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
      if (isFormData) {
        config.headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        body = {
          nome: dados.nome,
          descricao: dados.descricao,
          quantidade: dados.quantidade,
          valor: dados.valor,
        };
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
      if (isFormData) {
        config.headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        body = {
          nome: dados.nome,
          descricao: dados.descricao,
          quantidade: dados.quantidade,
          valor: dados.valor,
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
      const response = await api.delete(`/recompensas/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getStats: async () => {
    try {
      return await request('get', DASHBOARD_ENDPOINT);
    } catch (error) {
      throw error;
    }
  },

  getRecompensasCount: async () => {
    try {
      const data = await request('get', '/recompensas');
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
      const data = await request('get', '/resgates/meus');
      return Array.isArray(data) ? data.length : data.count || data.total || 0;
    } catch (error) {
      return 0;
    }
  },

  getVisitsData: async (dias = 30) => {
    try {
      const data = await request('get', `/dashboard/visitas-por-periodo?dias=${dias}`);
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
      return await request('get', '/usuarios');
    } catch (error) {
      throw error;
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      return await request('patch', `/usuarios/${userId}/status`, { status });
    } catch (error) {
      throw error;
    }
  },

  getEmpresas: async () => {
    try {
      return await request('get', '/empresa');
    } catch (error) {
      throw error;
    }
  },

  getEmpresaById: async (id) => {
    try {
      return await request('get', `/empresa/${id}`);
    } catch (error) {
      throw error;
    }
  },

  updateEmpresaStatus: async (empresaId, status) => {
    try {
      return await request('patch', `/empresa/${empresaId}/status`, { status });
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
      const response = await api.post('/pontos-turisticos', dados);
      return response.data;
    } catch (error) {
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
  createEvento: async (dados) => {
    try {
      let config = {};
      let body = dados;
      if (dados instanceof FormData) {
        config.headers = { 'Content-Type': 'multipart/form-data' };
      }
      const response = await api.post('/eventos', body, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateEvento: async (id, dados) => {
    try {
      let config = {};
      let body = dados;
      if (dados instanceof FormData) {
        config.headers = { 'Content-Type': 'multipart/form-data' };
      }
      const response = await api.put(`/eventos/${id}`, body, config);
      return response.data;
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
        const data = await request('post', LOGIN_ENDPOINT, loginData);
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

export default { dashboardService, authService };
