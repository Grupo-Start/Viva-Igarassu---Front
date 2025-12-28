import React, { useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Chart.css';
import { api, dashboardService } from '../../services/api';

const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function normalizeDateString(value) {
  if (!value && value !== 0) return null;
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.substring(0,10);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [dd, mm, yyyy] = value.split('/');
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  const d = new Date(value);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  return null;
}

function toMonthLabel(year, monthIndex) {
  return `${MONTH_NAMES[monthIndex]}/${year}`;
}

function detectDateKeyFromArray(arr) {
  if (!Array.isArray(arr)) return null;
  const candidates = ['data', 'data_evento', 'date', 'created_at', 'createdAt', 'dt', 'dataCadastro', 'data_cadastro'];
  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;
    for (const k of candidates) if (k in item) return k;
  }
  return null;
}

export default function EventsChart({ data = null, empresaId = null, height = 300 }) {
  const [fetched, setFetched] = useState(null);
  const [loading, setLoading] = useState(false);

  
  const resolvedEmpresaId = useMemo(() => {
    if (empresaId) return empresaId;
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u.empresa || u.empresa_id || u.id_empresa || u.empresaId || u.empresa?.id || u.id || u._id || null;
    } catch (e) { return null; }
  }, [empresaId]);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      if (data && Array.isArray(data) && data.length > 0) return;
      setLoading(true);
      try {
        const year = new Date().getFullYear();
        
        const resp = await dashboardService.countEventosByMonth(year);
        
        const now = new Date();
        const monthsTemplate = Array.from({ length: 12 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
          return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, mes: toMonthLabel(d.getFullYear(), d.getMonth()), eventos: 0 };
        });

        const countsMap = {};
        if (resp) {
          if (Array.isArray(resp)) {
            for (const it of resp) {
              const value = Number(it.count ?? it.total ?? it.eventos ?? it.value ?? it.qty ?? 0) || 0;
              let key = null;
              const candidate = it.key ?? it.month ?? it.mes ?? it.label ?? it.date;
              if (candidate && typeof candidate === 'string' && /^\d{4}-\d{2}/.test(candidate)) {
                key = candidate.substring(0,7);
              } else if (candidate && typeof candidate === 'number') {
                
                const m = Number(candidate);
                if (m >= 1 && m <= 12) {
                  const ky = `${new Date().getFullYear()}-${String(m).padStart(2,'0')}`;
                  key = ky;
                }
              } else if (candidate && typeof candidate === 'string') {
                
                const mm = candidate.match(/(\d{1,2})\/(\d{4})$/);
                if (mm) {
                  const mnum = Number(mm[1]);
                  key = `${mm[2]}-${String(mnum).padStart(2,'0')}`;
                } else {
                  const ymd = candidate.match(/(\d{4})-(\d{2})/);
                  if (ymd) key = `${ymd[1]}-${ymd[2]}`;
                }
              }
              if (key) countsMap[key] = (countsMap[key] || 0) + value;
            }
          } else if (typeof resp === 'object') {
            
            for (const k of Object.keys(resp)) countsMap[String(k).substring(0,7)] = Number(resp[k]) || 0;
          }
        }

        
        const filled = monthsTemplate.map(m => ({ mes: m.mes, eventos: countsMap[m.key] || 0 }));
        if (mounted) setFetched(filled);
      } catch (err) {
        console.error('Erro ao buscar eventos agregados por mês', err);
        if (mounted) setFetched([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    return () => { mounted = false; };
  }, [data, resolvedEmpresaId]);

  const source = data ?? fetched ?? [];

  const monthly = useMemo(() => {
    
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`, mes: toMonthLabel(d.getFullYear(), d.getMonth()), eventos: 0 };
    });
    if (!Array.isArray(source) || source.length === 0) return months.map(m => ({ mes: m.mes, eventos: 0 }));

    
    if (
      source[0] &&
      (source[0].mes || source[0].month) &&
      (typeof source[0].eventos !== 'undefined' || typeof source[0].total_eventos !== 'undefined' || typeof source[0].count !== 'undefined')
    ) {
      return source.map(item => ({ mes: String(item.mes ?? item.month), eventos: Number(item.eventos ?? item.total_eventos ?? item.count ?? 0) }));
    }

    const dateKey = detectDateKeyFromArray(source);
    if (!dateKey) return months.map(m => ({ mes: m.mes, eventos: 0 }));

    for (const item of source) {
      const nd = normalizeDateString(item[dateKey]);
      if (!nd) continue;
      const [y, mm] = nd.split('-');
      const key = `${y}-${mm}`;
      const idx = months.findIndex(m => m.key === key);
      if (idx < 0) continue;
      const value = Number(item.countEventos ?? item.count_eventos ?? item.total_eventos ?? item.eventos ?? item.count ?? 0);
      const add = (!isNaN(value) && value > 0) ? value : 1;
      months[idx].eventos = (months[idx].eventos || 0) + add;
    }

    return months.map(m => ({ mes: m.mes, eventos: m.eventos }));
  }, [source]);

  if (import.meta.env.MODE === 'development') {
    try { console.debug('EventsChart monthly:', monthly); } catch (e) {}
  }

  if (loading) return <div className="visits-chart-container">Carregando gráfico...</div>;
  if (!monthly || monthly.length === 0) return <div className="visits-chart-container">Sem dados para exibir</div>;

  return (
    <div className="visits-chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={monthly}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" interval={0} tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip formatter={(value) => value} />
          <Legend formatter={() => 'Eventos'} />
          <Line type="monotone" dataKey="eventos" stroke="#0A84FF" strokeWidth={2} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
