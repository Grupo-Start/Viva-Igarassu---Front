import { useState, useEffect } from "react";
import StatCard from "../../components/StatCard/StatCard";
import "./AdminDashboard.css";
import { dashboardService } from "../../services/api";
import { IoMdPeople } from "react-icons/io";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { MdEvent } from "react-icons/md";
import { FaGift } from "react-icons/fa";
import { BiGift } from "react-icons/bi";


export function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    events: 0,
    redeemedRewards: 0,
    availableRewards: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Buscando dados do dashboard...');
      
      // Buscar dados principais do dashboard
      const data = await dashboardService.getStats();
      console.log('Dados recebidos do backend:', data);
      
      // Buscar recompensas e resgates separadamente
      const [recompensasCount, resgatesCount] = await Promise.all([
        dashboardService.getRecompensasCount(),
        dashboardService.getResgatesCount(),
      ]);
      
      console.log('Recompensas disponíveis:', recompensasCount);
      console.log('Resgates:', resgatesCount);
      
      setStats({
        users: data.users || data.usuarios || data.totalUsuarios || data.countUsuarios || 0,
        companies: data.companies || data.empresas || data.totalEmpresas || data.countEmpresas || 0,
        events: data.events || data.eventos || data.totalEventos || data.countEventos || 0,
        redeemedRewards: resgatesCount,
        availableRewards: recompensasCount,
      });
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError(`Erro ao carregar os dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <h1>Dashboard Administrativo</h1>
        <p className="loading">Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <h1>Dashboard Administrativo</h1>
        <p className="error">{error}</p>
        <button onClick={loadDashboardData}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
        <h1>Dashboard Administrativo</h1>
        <div className="stat-cards-container">
            <StatCard
                title="Usuários"
                value={stats.users}
                icon={<IoMdPeople />}
            />
            <StatCard
                title="Empresas"
                value={stats.companies}
                icon={<HiOutlineOfficeBuilding />}
            />
            <StatCard
                title="Eventos"
                value={stats.events}
                icon={<MdEvent />}
            />
            <StatCard
                title="Recompensas Resgatadas"
                value={stats.redeemedRewards}
                icon={<FaGift />}
            />
            <StatCard
                title="Recompensas Disponíveis"
                value={stats.availableRewards}
                icon={<BiGift />}
            />
        </div>
    </div>
  );
}