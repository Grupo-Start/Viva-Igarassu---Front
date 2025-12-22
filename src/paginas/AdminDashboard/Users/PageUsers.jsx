import { useState, useEffect } from "react";
import "./PageUsers.css";
import { DashboardHeader } from "../../../components/dashboardHeader/DashboardHeader";
import { SidebarAdmin } from "../../../components/sidebarAdmin/SidebarAdmin";
import { IoMdPeople } from "react-icons/io";
import { dashboardService } from "../../../services/api";

export function PageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('todos');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dashboardService.getUsers();
      console.log('Usuários carregados:', data);
      console.log('Primeiro usuário completo:', data[0]);
      console.log('Campos disponíveis:', Object.keys(data[0] || {}));
      
      // Adaptar estrutura do backend para o formato esperado
      const formattedUsers = Array.isArray(data) ? data.map(user => {
        const nome = user.nome || user.name || user.username || user.nomeCompleto || user.nome_completo || 'N/A';
        const tipo = (user.tipo || user.role || user.type || 'comum').toLowerCase();
        console.log('User:', user.id, 'Nome encontrado:', nome, 'Tipo:', tipo);
        return {
          id: user.id,
          nome: nome,
          email: user.email,
          tipo: tipo,
          status: user.status || user.ativo === false ? 'bloqueado' : 'ativo',
          saldoMoedas: user.saldoMoedas || user.saldo_moedas || user.moedas || user.coins || 0
        };
      }) : [];
      
      setUsers(formattedUsers);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      
      if (err.message?.includes('Network Error') || err.code === 'ERR_NETWORK') {
        setError('Não foi possível conectar ao backend. Verifique se o servidor está rodando na porta 3001.');
      } else if (err.response?.status === 404) {
        setError('Endpoint /usuarios não encontrado no backend. Verifique a API.');
      } else {
        setError(`Erro ao carregar usuários: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'ativo' ? 'bloqueado' : 'ativo';
      
      await dashboardService.updateUserStatus(userId, newStatus);
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      console.log(`Usuário ${userId} ${newStatus === 'ativo' ? 'desbloqueado' : 'bloqueado'}`);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError('Erro ao atualizar status do usuário');
      // Recarregar lista em caso de erro
      setTimeout(() => {
        setError(null);
        loadUsers();
      }, 2000);
    }
  };

  const filteredUsers = users.filter(user => {
    if (filterType === 'todos') return true;
    if (filterType === 'empreendedor') return user.tipo === 'empreendedor';
    if (filterType === 'comum') return user.tipo === 'comum';
    return true;
  });

  if (loading) {
    return (
      <div>
        <DashboardHeader/>
        <div style={{ display: 'flex', overflow: 'hidden' }}>
          <SidebarAdmin/>
          <div className="admin-dashboard">
            <h1>Usuários</h1>
            <p className="loading">Carregando usuários...</p>
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
            <h1>Usuários</h1>
            <p className="error">{error}</p>
            <button onClick={loadUsers}>Tentar novamente</button>
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
          <h1>Usuários</h1>
          <div className="dashboard-content">
            <div className="users-header">
              <div className="users-stats">
                <IoMdPeople size={24} color="#5FD6C3" />
                <span>Total de usuários: {users.length}</span>
              </div>
              <div className="filter-buttons">
                <button 
                  className={filterType === 'todos' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilterType('todos')}
                >
                  Todos ({users.length})
                </button>
                <button 
                  className={filterType === 'empreendedor' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilterType('empreendedor')}
                >
                  Empreendedores ({users.filter(u => u.tipo === 'empreendedor').length})
                </button>
                <button 
                  className={filterType === 'comum' ? 'filter-btn active' : 'filter-btn'}
                  onClick={() => setFilterType('comum')}
                >
                  Comuns ({users.filter(u => u.tipo === 'comum').length})
                </button>
              </div>
            </div>

            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Saldo de Moedas</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.nome}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.tipo === 'admin' ? 'badge-admin' : 'badge-comum'}`}>
                          {user.tipo}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.status === 'ativo' ? 'badge-ativo' : 'badge-bloqueado'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <span className="saldo-moedas">{user.saldoMoedas} moedas</span>
                      </td>
                      <td>
                        {user.tipo !== 'admin' && user.tipo !== 'adm' && (
                          <button 
                            className={`btn-toggle-status ${user.status === 'ativo' ? 'btn-block' : 'btn-unblock'}`}
                            onClick={() => handleToggleStatus(user.id, user.status)}
                          >
                            {user.status === 'ativo' ? 'Bloquear' : 'Desbloquear'}
                          </button>
                        )}
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