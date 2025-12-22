import { useState, useEffect } from "react";
import "./PageEmpresas.css";
import { DashboardHeader } from "../../../components/dashboardHeader/DashboardHeader";
import { SidebarAdmin } from "../../../components/sidebarAdmin/SidebarAdmin";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { dashboardService } from "../../../services/api";

export function PageEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTipoServico, setFilterTipoServico] = useState('todos');

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dashboardService.getEmpresas();
      console.log('Empresas carregadas:', data);
      console.log('Primeira empresa completa:', JSON.stringify(data[0], null, 2));
      console.log('Campos disponíveis:', Object.keys(data[0] || {}));
      
      const formattedEmpresas = Array.isArray(data) ? data.map(empresa => {
        const nome = empresa.nome_empresa || empresa.nome || empresa.name || 'N/A';
        const email = empresa.usuarios?.email || empresa.usuario?.email || empresa.empreendedor?.email || 'N/A';
        const tipoServico = empresa.tipo_servico || empresa.tipoServico || empresa.servico || empresa.categoria || 'N/A';
        console.log('Empresa:', empresa.id_empresa, 'Nome:', nome, 'Email:', email, 'Tipo Serviço:', tipoServico);
        return {
          id: empresa.id_empresa || empresa.id,
          nome: nome,
          cnpj: empresa.cnpj || 'N/A',
          email: email,
          telefone: empresa.telefone || empresa.phone || empresa.contato || 'N/A',
          tipoServico: tipoServico,
          status: empresa.status || (empresa.ativo === false ? 'inativo' : 'ativo')
        };
      }) : [];
      
      setEmpresas(formattedEmpresas);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
      
      if (err.message?.includes('Network Error') || err.code === 'ERR_NETWORK') {
        setError('Não foi possível conectar ao backend.');
      } else if (err.response?.status === 404) {
        setError('Endpoint /empresas não encontrado no backend.');
      } else {
        setError(`Erro ao carregar empresas: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (empresaId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
      
      console.log(`Tentando atualizar empresa ${empresaId} para status: ${newStatus}`);
      await dashboardService.updateEmpresaStatus(empresaId, newStatus);
      
      setEmpresas(empresas.map(empresa => 
        empresa.id === empresaId ? { ...empresa, status: newStatus } : empresa
      ));
      
      console.log(`✓ Empresa ${empresaId} ${newStatus === 'ativo' ? 'ativada' : 'desativada'}`);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      console.error('Resposta do servidor:', err.response?.data);
      console.error('Status HTTP:', err.response?.status);
      
      const errorMsg = err.response?.status === 404 
        ? 'Endpoint PATCH /empresa/:id/status não implementado no backend'
        : err.response?.data?.message || 'Erro ao atualizar status da empresa';
      
      setError(errorMsg);
      setTimeout(() => {
        setError(null);
        loadEmpresas();
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div>
        <DashboardHeader/>
        <div style={{ display: 'flex', overflow: 'hidden' }}>
          <SidebarAdmin/>
          <div className="admin-dashboard">
            <h1>Empresas</h1>
            <p className="loading">Carregando empresas...</p>
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
            <h1>Empresas</h1>
            <p className="error">{error}</p>
            <button onClick={loadEmpresas}>Tentar novamente</button>
          </div>
        </div>
      </div>
    );
  }

  const normalizeString = (str) => {
    return str?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+de\s+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const filteredEmpresas = empresas.filter(empresa => {
    if (filterTipoServico === 'todos') return true;
    return normalizeString(empresa.tipoServico) === normalizeString(filterTipoServico);
  });

  const tiposServico = ['hospedagem', 'artesanato', 'alimentação', 'transporte', 'guia de turismo', 'outros'];

  const countByTipo = (tipo) => {
    if (tipo === 'todos') return empresas.length;
    return empresas.filter(e => normalizeString(e.tipoServico) === normalizeString(tipo)).length;
  };

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
 
  return (
    <div>
      <DashboardHeader/>
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <SidebarAdmin/>
        <div className="admin-dashboard">
          <h1>Empresas</h1>
          <div className="dashboard-content">
            <div className="empresas-header">
              <div className="empresas-stats">
                <HiOutlineOfficeBuilding size={24} color="#5FD6C3" />
                <span>Total de empresas: {empresas.length}</span>
              </div>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${filterTipoServico === 'todos' ? 'active' : ''}`}
                  onClick={() => setFilterTipoServico('todos')}
                >
                  Todos ({countByTipo('todos')})
                </button>
                {tiposServico.map(tipo => (
                  <button 
                    key={tipo}
                    className={`filter-btn ${filterTipoServico === tipo ? 'active' : ''}`}
                    onClick={() => setFilterTipoServico(tipo)}
                  >
                    {capitalize(tipo)} ({countByTipo(tipo)})
                  </button>
                ))}
              </div>
            </div>

            <div className="empresas-table-container">
              <table className="empresas-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CNPJ</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Tipo de Serviço</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmpresas.map((empresa) => (
                    <tr key={empresa.id}>
                      <td>{empresa.nome}</td>
                      <td>{empresa.cnpj}</td>
                      <td>{empresa.email}</td>
                      <td>{empresa.telefone}</td>
                      <td>{empresa.tipoServico}</td>
                      <td>
                        <span className={`badge ${empresa.status === 'ativo' ? 'badge-ativo' : 'badge-inativo'}`}>
                          {empresa.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`btn-toggle-status ${empresa.status === 'ativo' ? 'btn-deactivate' : 'btn-activate'}`}
                          onClick={() => handleToggleStatus(empresa.id, empresa.status)}
                        >
                          {empresa.status === 'ativo' ? 'Desativar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}