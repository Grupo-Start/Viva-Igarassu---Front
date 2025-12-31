import { useState, useEffect } from "react";
import StatCard from "../../../components/StatCard/StatCard";
import "./EmpresaDashboard.css";
import { MdEvent } from "react-icons/md";
import { FaGift } from "react-icons/fa";
import { BiGift } from "react-icons/bi";
import { DashboardHeader } from "../../../components/dashboardHeader/DashboardHeader";
import { Sidebar } from "../../../components/sidebar/Sidebar";
import { api, dashboardService } from "../../../services/api";
import EventsChart from "../../../components/charts/EventsChart";

export function EmpresaDashboard() {
  const [eventsCount, setEventsCount] = useState(0);
  const [rewardsCount, setRewardsCount] = useState(0);
  const [redeemedCount, setRedeemedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eventsChartData, setEventsChartData] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        // determine empresa id from session (user saved on login/registration)
        let sessionUser = null;
        try { sessionUser = JSON.parse(localStorage.getItem('user') || 'null'); } catch (e) { sessionUser = null; }
        const empresaId = sessionUser?.empresa || sessionUser?.empresa_id || sessionUser?.id_empresa || sessionUser?.empresaId || sessionUser?.id || sessionUser?._id || null;

        const [count, eventosRes, recompensasCount, resgatesCount] = await Promise.all([
          dashboardService.countEventosMe().catch(() => 0),
          (async () => {
            try { return await api.get('/empresa/me/eventos'); }
            catch (e1) { try { return await api.get('/eventos'); } catch (e2) { return { data: [] }; } }
          })(),
          (async () => {
            try {
              if (empresaId) {
                const r = await api.get(`/recompensas?empresa=${encodeURIComponent(empresaId)}`);
                const data = r?.data ?? [];
                const arr = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
                if (arr.length > 0) {
                  const filtroEmpresa = String(empresaId || '');
                  const pertence = (rwd) => {
                    if (!rwd) return false;
                    const id1 = String(rwd.empresa?.id_empresa || rwd.empresa_id || rwd.id_empresa || rwd.empresa?._id || rwd.empresa || '');
                    const id2 = String(rwd.id_empresa || rwd.empresa_id || rwd.idEmpresa || rwd.id || '');
                    return (filtroEmpresa && (id1 === filtroEmpresa || id2 === filtroEmpresa));
                  };
                  return arr.filter(pertence).length;
                }
                // fallback to count field if provided
                return (data && (data.count || data.total)) || 0;
              }
            } catch (e) {
              // fallback to global count
            }
            try { return await dashboardService.getRecompensasCount(); } catch (e) { return 0; }
          })(),
          dashboardService.getResgatesCount().catch(() => 0),
        ]);

        const eventosRaw = eventosRes?.data ?? eventosRes ?? [];

        if (!mounted) return;
        setEventsCount(Number(count) || 0);
        setRewardsCount(Number(recompensasCount) || 0);
        setRedeemedCount(Number(resgatesCount) || 0);

        
        const normalizeDate = (d) => {
          if (!d) return null;
          if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) return d.substring(0,10);
          if (typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
            const [dd, mm, yyyy] = d.split('/');
            return `${yyyy}-${mm}-${dd}`;
          }
          const parsed = new Date(d);
          if (!isNaN(parsed.getTime())) return `${parsed.getFullYear()}-${String(parsed.getMonth()+1).padStart(2,'0')}-${String(parsed.getDate()).padStart(2,'0')}`;
          return null;
        };

        const now = new Date();
        const months = Array.from({ length: 12 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
          return { key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, mes: `${String(d.toLocaleString('pt-BR',{month:'short'})).replace('.', '')}/${d.getFullYear()}`, eventos: 0 };
        });

        const counts = {};
        if (Array.isArray(eventosRaw)) {
          for (const ev of eventosRaw) {
            const dateVal = ev.data || ev.data_evento || ev.date || ev.createdAt || ev.created_at || ev.dataCadastro || ev.data_cadastro || null;
            const nd = normalizeDate(dateVal);
            if (!nd) continue;
            const [y, m] = nd.split('-');
            const key = `${y}-${m}`;
            counts[key] = (counts[key] || 0) + (Number(ev.countEventos ?? ev.count_eventos ?? ev.total_eventos ?? ev.eventos ?? 1) || 0);
          }
        }

        const chartData = months.map(m => ({ mes: m.mes, eventos: counts[m.key] || 0 }));
        setEventsChartData(chartData);

        
        const derivedTotal = Object.values(counts).reduce((s, v) => s + (Number(v) || 0), 0);
        if ((Number(count) || 0) === 0 && derivedTotal > 0) {
          setEventsCount(derivedTotal);
        }
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    const onLocalUserChange = () => { if (mounted) load(); };
    window.addEventListener('localUserChange', onLocalUserChange);
    return () => { mounted = false; window.removeEventListener('localUserChange', onLocalUserChange); };
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
                  <h2>Eventos por mês</h2>
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


