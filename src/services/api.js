import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// ROTA DE LOGIN DO BACKEND
const LOGIN_ENDPOINT = '/usuarios/login';

// ROTA DO DASHBOARD
const DASHBOARD_ENDPOINT = '/dashboard/admin';

// Configurar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('Interceptor - Token existe?', !!token);
  console.log('Interceptor - URL da requisição:', config.url);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Interceptor - Header Authorization adicionado');
  } else {
    console.log('Interceptor - Token não encontrado no localStorage');
  }
  return config;
});

// Interceptor para tratar erros de autenticação
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

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Não enviar token na rota de login
  const isLoginEndpoint = endpoint.includes('/login');
  const token = !isLoginEndpoint ? localStorage.getItem('token') : null;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  console.log('=== Requisição ===');
  console.log('URL:', url);
  console.log('Método:', config.method || 'GET');
  console.log('Headers:', config.headers);
  console.log('Body:', options.body);
  console.log('================');

  try {
    const response = await fetch(url, config);
    
    console.log('Status da resposta:', response.status);
    
    if (!response.ok) {
      if (response.status === 401 && !isLoginEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Sessão expirada');
      }
      const errorData = await response.json().catch(() => ({}));
      console.log('Erro recebido:', errorData);
      throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
}

export const dashboardService = {
  getStats: async () => {
    const url = `${API_BASE_URL}${DASHBOARD_ENDPOINT}`;
    const token = localStorage.getItem('token');
    
    console.log('=== BUSCANDO ESTATÍSTICAS ===');
    console.log('URL:', url);
    console.log('Token existe?', !!token);
    
    if (!token) {
      throw new Error('Token não encontrado. Faça login novamente.');
    }
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Status:', response.status);
      const responseText = await response.text();
      console.log('Response:', responseText);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Sessão expirada');
        }
        const data = JSON.parse(responseText);
        throw new Error(data.message || data.error || 'Erro ao buscar dados');
      }
      
      const data = JSON.parse(responseText);
      console.log('Dados recebidos:', data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  },
  
  // Buscar contagem de recompensas disponíveis
  getRecompensasCount: async () => {
    const url = `${API_BASE_URL}/recompensas`;
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Erro ao buscar recompensas');
      
      const data = await response.json();
      console.log('=== RECOMPENSAS ===');
      console.log('Dados completos:', JSON.stringify(data, null, 2));
      console.log('É array?', Array.isArray(data));
      
      // Se for array, soma as quantidades de cada recompensa
      if (Array.isArray(data)) {
        console.log('Número de recompensas:', data.length);
        
        if (data.length > 0) {
          console.log('Primeira recompensa (todas as chaves):', Object.keys(data[0]));
          console.log('Primeira recompensa (completa):', data[0]);
        }
        
        let total = 0;
        data.forEach((recompensa, index) => {
          // Tenta todos os nomes possíveis de quantidade
          const qtd = recompensa.quantidade || 
                     recompensa.qtd || 
                     recompensa.estoque || 
                     recompensa.qtde ||
                     recompensa.quantidadeDisponivel ||
                     recompensa.quantidade_disponivel ||
                     parseInt(recompensa.quantidade) ||
                     0;
          
          console.log(`Recompensa ${index + 1}:`, {
            nome: recompensa.nome || recompensa.titulo || recompensa.descricao,
            quantidade: qtd,
            objeto: recompensa
          });
          total += qtd;
        });
        
        console.log('Total calculado:', total);
        return total;
      }
      
      console.log('Não é array, retornando count/total');
      return data.count || data.total || 0;
    } catch (error) {
      console.error('Erro ao buscar recompensas:', error);
      return 0;
    }
  },
  
  // Buscar contagem de resgates
  getResgatesCount: async () => {
    const url = `${API_BASE_URL}/resgates`;
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Erro ao buscar resgates');
      
      const data = await response.json();
      console.log('Resgates:', data);
      return Array.isArray(data) ? data.length : (data.count || data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar resgates:', error);
      return 0;
    }
  },

  // Buscar dados de visitas por período (7 ou 30 dias)
  getVisitsData: async (dias = 30) => {
    try {
      console.log(`Buscando visitas para ${dias} dias...`);
      const response = await api.get(`/dashboard/visitas-por-periodo?dias=${dias}`);
      console.log('Response completo:', response);
      const data = response.data;
      
      console.log(`Dados de visitas (${dias} dias):`, data);
      console.log('Tipo de data:', typeof data);
      console.log('É array?', Array.isArray(data));
      
      // Se o backend retornar array de visitas
      if (Array.isArray(data)) {
        console.log('Retornando array com', data.length, 'itens');
        return data;
      }
      
      // Se retornar objeto com chave visitas
      if (data.visitas && Array.isArray(data.visitas)) {
        console.log('Retornando data.visitas com', data.visitas.length, 'itens');
        return data.visitas;
      }
      
      console.warn('Estrutura de dados inesperada, retornando array vazio');
      // Retorna array vazio se não houver dados
      return [];
    } catch (error) {
      console.error('Erro ao buscar dados de visitas:', error);
      console.error('Detalhes do erro:', error.response?.data);
      console.error('Status do erro:', error.response?.status);
      return [];
    }
  },

  // Buscar lista de usuários
  getUsers: async () => {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  },

  // Atualizar status do usuário (bloquear/desbloquear)
  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.patch(`/usuarios/${userId}/status`, { status });
      console.log('Status atualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      throw error;
    }
  },

  getEmpresas: async () => {
    try {
      const response = await api.get('/empresa');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      throw error;
    }
  },

  updateEmpresaStatus: async (empresaId, status) => {
    try {
      const response = await api.patch(`/empresa/${empresaId}/status`, { status });
      console.log('Status da empresa atualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status da empresa:', error);
      throw error;
    }
  },

  getPontosTuristicos: async () => {
    try {
      const response = await api.get('/pontos-turisticos');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pontos turísticos:', error);
      throw error;
    }
  },

  createPontoTuristico: async (dados) => {
    try {
      const response = await api.post('/pontos-turisticos', dados);
      console.log('Ponto turístico criado:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar ponto turístico:', error);
      throw error;
    }
  },

  updatePontoTuristico: async (pontoId, dados) => {
    try {
      const response = await api.put(`/pontos-turisticos/${pontoId}`, dados);
      console.log('Ponto turístico atualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar ponto turístico:', error);
      throw error;
    }
  },

  updatePontoTuristicoStatus: async (pontoId, status) => {
    try {
      const response = await api.patch(`/pontos-turisticos/${pontoId}/status`, { status });
      console.log('Status do ponto turístico atualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status do ponto turístico:', error);
      throw error;
    }
  },

  downloadPDF: async (pontoId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('=== Download PDF ===');
      console.log('Ponto ID:', pontoId);
      console.log('Tipo do ID:', typeof pontoId);
      console.log('URL:', `${API_BASE_URL}/qrcodes/pontos-turisticos/${pontoId}/download-pdf`);
      
      const response = await axios.get(
        `${API_BASE_URL}/qrcodes/pontos-turisticos/${pontoId}/download-pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      console.error('Response data:', error.response?.data);
      console.error('Status:', error.response?.status);
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
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
      throw error;
    }
  },

  // --- Eventos ---
  getEventos: async () => {
    const response = await api.get('/eventos');
    return response.data;
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
    
    console.log('=== TENTANDO LOGIN ===');
    console.log('URL:', url);
    console.log('Email digitado:', credentials.email);
    
    for (let i = 0; i < loginDataFormats.length; i++) {
      const loginData = loginDataFormats[i];
      console.log(`\nTentativa ${i + 1}:`, loginData);
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        });
        
        console.log('Status:', response.status);
        const responseText = await response.text();
        console.log('Response:', responseText);
        
        const data = JSON.parse(responseText);
        
        if (response.ok) {
          console.log('✓ Login bem-sucedido com formato:', Object.keys(loginData));
          return data;
        }
        
        console.log('✗ Erro:', data.message || data.error);
      } catch (error) {
        console.log('✗ Falhou:', error.message);
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
