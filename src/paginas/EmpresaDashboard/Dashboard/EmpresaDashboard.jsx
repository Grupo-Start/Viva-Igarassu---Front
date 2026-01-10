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
        let sessionUser = null;
        try { sessionUser = JSON.parse(localStorage.getItem('user') || 'null'); } catch (e) { sessionUser = null; }
        let empresaIdRaw = sessionUser?.empresa || sessionUser?.empresa_id || sessionUser?.id_empresa || sessionUser?.empresaId || sessionUser?.empresaId || null;
        if (!empresaIdRaw) {
          empresaIdRaw = sessionUser?.id || sessionUser?._id || null;
        }
        let empresaId = null;
        try {
          if (empresaIdRaw && typeof empresaIdRaw === 'object') {
            empresaId = empresaIdRaw.id || empresaIdRaw._id || empresaIdRaw.id_empresa || empresaIdRaw.empresaId || null;
          } else if (empresaIdRaw != null) {
            empresaId = String(empresaIdRaw);
          }
        } catch (e) {
          empresaId = empresaIdRaw;
        }

        let count = 0;
        let eventosRaw = [];
        let recompensasCount = 0;
        let resgatesCount = 0;

        const sumQuantities = (v) => {
          if (v === undefined || v === null) return undefined;
          if (typeof v === 'number') return v;
          if (Array.isArray(v)) {
            return v.reduce((acc, item) => {
              if (!item) return acc;
              const q = item.quantidade ?? item.quantidade_disponivel ?? item.quantidadeDisponivel ?? item.qtd ?? item.qtde ?? item.estoque ?? item.stock ?? item.amount ?? item.available ?? 0;
              const n = Number(q);
              return acc + (Number.isFinite(n) ? n : 0);
            }, 0);
          }
          if (typeof v === 'object') {
            const items = Array.isArray(v.items) ? v.items : (Array.isArray(v.data) ? v.data : Object.values(v));
            if (Array.isArray(items)) return sumQuantities(items);
            return undefined;
          }
          const n = Number(v);
          return Number.isFinite(n) ? n : undefined;
        };

        let dashboardEmpresaData = null;
        try {
          if (empresaId) {
            const r = await api.get(`/dashboard/empresa/${encodeURIComponent(empresaId)}`, { headers: { 'X-Skip-Auth-Redirect': '1' } });
            dashboardEmpresaData = r?.data ?? null;
          } else {
            try { const r2 = await api.get(`/dashboard/empresa/me`, { headers: { 'X-Skip-Auth-Redirect': '1' } }); dashboardEmpresaData = r2?.data ?? null; } catch (e) { dashboardEmpresaData = null; }
          }
        } catch (e) { dashboardEmpresaData = null; }

        if (dashboardEmpresaData && (dashboardEmpresaData.recompensas_disponiveis != null || dashboardEmpresaData.recompensas_resgatadas != null)) {
          count = dashboardEmpresaData.eventos ?? await dashboardService.countEventosMe().catch(() => 0);
          try {
            const eventosRes = await (async () => { try { return await api.get('/empresa/me/eventos'); } catch { try { return await api.get('/eventos'); } catch { return { data: [] }; } } })();
            eventosRaw = eventosRes?.data ?? eventosRes ?? [];
          } catch (e) { eventosRaw = []; }

          const av = dashboardEmpresaData.recompensas_disponiveis ?? dashboardEmpresaData.recompensasDisponiveis ?? dashboardEmpresaData.recompensas;
          if (av != null) {
            if (typeof av === 'number') recompensasCount = av;
            else if (Array.isArray(av)) {
              const summed = sumQuantities(av);
              recompensasCount = summed !== undefined ? summed : av.length;
            } else {
              const n = Number(av);
              recompensasCount = Number.isFinite(n) ? n : 0;
            }
          }

          const rr = dashboardEmpresaData.recompensas_resgatadas ?? dashboardEmpresaData.resgates ?? dashboardEmpresaData.resgates_count ?? null;
          if (rr != null) {
            if (typeof rr === 'number') resgatesCount = rr;
            else if (Array.isArray(rr)) resgatesCount = rr.length;
            else {
              const n = Number(rr);
              resgatesCount = Number.isFinite(n) ? n : 0;
            }
          }
        } else {
          const [c, eventosRes, recompensasResp, resgatesResp] = await Promise.all([
            dashboardService.countEventosMe().catch(() => 0),
            (async () => { try { return await api.get('/empresa/me/eventos'); } catch (e1) { try { return await api.get('/eventos'); } catch (e2) { return { data: [] }; } } })(),
            (async () => {
              try {
                if (empresaId) {
                  const r = await api.get(`/recompensas?empresa=${encodeURIComponent(empresaId)}`);
                  const data = r?.data ?? [];
                  const explicit = data.recompensas_disponiveis ?? data.recompensasDisponiveis ?? null;
                  if (explicit != null) {
                    if (typeof explicit === 'number') return explicit;
                    if (Array.isArray(explicit)) {
                      const summed = sumQuantities(explicit);
                      return summed !== undefined ? summed : explicit.length;
                    }
                    const n = Number(explicit);
                    return Number.isFinite(n) ? n : 0;
                  }
                  const arr = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : (Array.isArray(data.data) ? data.data : []));
                  if (arr.length > 0) {
                    const filtroEmpresa = String(empresaId || '');
                    const filtered = arr.filter(rwd => {
                      try {
                        const id1 = String(rwd.empresa?.id_empresa || rwd.empresa_id || rwd.id_empresa || rwd.empresa?._id || rwd.empresa || '');
                        const id2 = String(rwd.id_empresa || rwd.empresa_id || rwd.idEmpresa || rwd.id || '');
                        return filtroEmpresa && (id1 === filtroEmpresa || id2 === filtroEmpresa);
                      } catch (e) { return false; }
                    });
                    const summed = sumQuantities(filtered);
                    return summed !== undefined ? summed : filtered.length;
                  }
                  return (data && (data.count || data.total)) || 0;
                }
              } catch (e) { }
              try { return await dashboardService.getRecompensasCount(); } catch (e) { return 0; }
            })(),
            dashboardService.getResgatesCountEmpresa(empresaId).catch(() => 0),
          ]);

          count = c;
          eventosRaw = eventosRes?.data ?? eventosRes ?? [];
          recompensasCount = Number(recompensasResp) || 0;
          resgatesCount = Number(resgatesResp) || 0;
        }

        if (!mounted) return;
        setEventsCount(Number(count) || 0);
        setRewardsCount(Number(recompensasCount) || 0);
        setRedeemedCount(Number(resgatesCount) || 0);

        try {
          const numericResgates = Number(resgatesCount) || 0;
          if (numericResgates === 0 && empresaId) {
            try {
              const allRes = await api.get('/resgates', { headers: { 'X-Skip-Auth-Redirect': '1' } });
              const allData = allRes?.data ?? [];
              if (Array.isArray(allData) && allData.length > 0) {
                const filtered = allData.filter(item => {
                  try {
                    const id1 = String(item.empresa?.id_empresa || item.empresa_id || item.id_empresa || item.empresa?._id || item.empresa || '').trim();
                    const id2 = String(item.id_empresa || item.empresa_id || item.empresaId || item.empresa || '').trim();
                    return id1 === String(empresaId) || id2 === String(empresaId);
                  } catch (e) { return false; }
                });
                if (filtered.length > 0) setRedeemedCount(filtered.length);
              }
            } catch (e) { }
          }
        } catch (e) {}

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


