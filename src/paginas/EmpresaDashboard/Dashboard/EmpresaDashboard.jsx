import { useState, useEffect } from "react";
import StatCard from "../../../components/StatCard/StatCard";
import "./EmpresaDashboard.css";
import { MdEvent } from "react-icons/md";
import { FaGift } from "react-icons/fa";
import { BiGift } from "react-icons/bi";
import { DashboardHeader } from "../../../components/dashboardHeader/DashboardHeader";
import { Sidebar } from "../../../components/sidebar/Sidebar";
import { dashboardService } from "../../../services/api";
import { EventsChart } from "../../../components/charts/EventsChart";

export function EmpresaDashboard() {
  const [eventsCount, setEventsCount] = useState(0);
  const [rewardsCount, setRewardsCount] = useState(0);
  const [redeemedCount, setRedeemedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eventsChartData, setEventsChartData] = useState([]);
  useEffect(() => {
    let mounted = true;
    async function loadStats() {
      try {
        setLoading(true);
        const eventos = await dashboardService.getEventos();
        const eventosArray = Array.isArray(eventos) ? eventos : (Array.isArray(eventos?.data) ? eventos.data : []);
        const eventosCount = eventosArray.length || (eventos.count || 0);
        const recompensasCount = await dashboardService.getRecompensasCount();
        const resgatesCount = await dashboardService.getResgatesCount();

        if (!mounted) return;
        setEventsCount(eventosCount || 0);
        setRewardsCount(recompensasCount || 0);
        setRedeemedCount(resgatesCount || 0);
        const normalizeDate = (d) => {
          if (!d) return null;
          if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
          if (/^\d{4}-\d{2}-\d{2}T/.test(d)) return d.substring(0,10);
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
            const [dd, mm, yyyy] = d.split('/');
            return `${yyyy}-${mm}-${dd}`;
          }
          const parsed = new Date(d);
          if (!isNaN(parsed.getTime())) {
            const y = parsed.getFullYear();
            const m = String(parsed.getMonth() + 1).padStart(2,'0');
            const day = String(parsed.getDate()).padStart(2,'0');
            return `${y}-${m}-${day}`;
          }
          return null;
        };

        const days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2,'0');
          const day = String(d.getDate()).padStart(2,'0');
          days.push(`${y}-${m}-${day}`);
        }

        const countsMap = {};
        eventosArray.forEach(ev => {
          const raw = ev.data || ev.data_evento || ev.date || ev.createdAt || ev.created_at || ev.data_criacao || ev.dataCadastro || ev.data_cadastro || '';
          const nd = normalizeDate(raw);
          if (!nd) return;
          countsMap[nd] = (countsMap[nd] || 0) + 1;
        });

        const chartData = days.map(d => ({ data: d, total_eventos: countsMap[d] || 0 }));
        setEventsChartData(chartData);
      } catch (err) {
        console.error('Erro ao carregar estatísticas da empresa', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadStats();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <DashboardHeader />
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <Sidebar />
        <div className="empresa-dashboard">
          <h1>Dashboard</h1>
          <div className="dashboard-content">
            <div className="stat-cards-container">
              <StatCard title="Eventos" value={eventsCount} loading={loading} icon={<MdEvent />} />
              <StatCard title="Recompensas Cadastradas" value={rewardsCount} loading={loading} icon={<BiGift />} />
              <StatCard title="Recompensas Resgatadas" value={redeemedCount} loading={loading} icon={<FaGift />} />
            </div>

            <div className="chart-section">
              <div className="chart-header">
                <div className="chart-title-group">
                  <h2>Eventos cadastrados por dia (últimos 30 dias)</h2>
                </div>
              </div>
              <EventsChart data={eventsChartData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}