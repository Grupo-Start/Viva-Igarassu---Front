import { useState, useEffect } from "react";
import StatCard from "../../../components/StatCard/StatCard";
import "../admin-common.css";
import "./AdminDashboard.css";
import { dashboardService } from "../../../services/api";
import { IoMdPeople } from "react-icons/io";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { MdEvent } from "react-icons/md";
import { FaGift } from "react-icons/fa";
import { BiGift } from "react-icons/bi";
import { DashboardHeader } from "../../../components/dashboardHeader/DashboardHeader";
import { SidebarAdmin } from "../../../components/sidebarAdmin/SidebarAdmin";
import { VisitsChart } from "../../../components/charts/VisitsChart";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    events: 0,
    redeemedRewards: 0,
    availableRewards: 0,
  });
  const [visitsData, setVisitsData] = useState([]);
  const [visitsPeriod, setVisitsPeriod] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadVisitsData();
  }, [visitsPeriod]);

  const loadVisitsData = async () => {
    try {
      const visits = await dashboardService.getVisitsData(visitsPeriod);
      setVisitsData(visits);
    } catch (err) {
      console.warn('Erro ao carregar visitas:', err);
    }
  };

  const getTotalVisits = () => {
    return visitsData.reduce((acc, item) => acc + (item.total_visitas || 0), 0);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dashboardService.getStats();
      
      const [recompensasCount, resgatesCount] = await Promise.all([
        dashboardService.getRecompensasCount(),
        dashboardService.getResgatesCount(),
      ]);
      
      setStats({
        users: data.users || data.usuarios || data.totalUsuarios || data.countUsuarios || 0,
        companies: data.companies || data.empresas || data.totalEmpresas || data.countEmpresas || 0,
        events: data.events || data.eventos || data.totalEventos || data.countEventos || 0,
        redeemedRewards: resgatesCount,
        availableRewards: recompensasCount,
      });
    } catch (err) {
      setError(`Erro ao carregar os dados: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div>
      <DashboardHeader/>
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <SidebarAdmin/>
        <div className="admin-dashboard">
            <h1>Dashboard Administrativo</h1>
            <div className="dashboard-content">
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
                <div className="chart-section">
                    <div className="chart-header">
                        <div className="chart-title-group">
                            <h2>Visitas por Período</h2>
                            <span className="total-visits">Total: {getTotalVisits()} visitas</span>
                        </div>
                        <div className="period-filter">
                            <button
                              className={`filter-btn ${visitsPeriod === 7 ? 'active' : ''}`}
                              onClick={() => setVisitsPeriod(7)}
                            >
                              7 dias
                            </button>
                            <button
                              className={`filter-btn ${visitsPeriod === 30 ? 'active' : ''}`}
                              onClick={() => setVisitsPeriod(30)}
                            >
                              30 dias
                            </button>
                        </div>
                    </div>
                    <VisitsChart data={visitsData} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}