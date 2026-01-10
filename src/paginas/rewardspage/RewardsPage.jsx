import { Header } from "../../components/header/Header";
import FaixaInfo from "../../components/header/FaixaInfo";
import { RewardsCard } from "../../components/rewardscard/RewardsCard";
import { PaginationRewards } from "../../components/paginationRewards/PaginationRewards";
import "./RewardsPage.css";
import Footer from "../../components/footer/Footer";
import React, { useEffect, useState } from "react";
import { dashboardService } from "../../services/api";

export function RewardsPage() {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saldo, setSaldo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    const refreshSaldo = async () => {
        try {
            
            try {
                const dashboard = await dashboardService.getDashboardUsuario();
                const s = dashboard?.usuario?.saldo ?? dashboard?.saldo ?? dashboard?.saldo_moedas ?? null;
                console.debug('[RewardsPage] refreshSaldo: dashboard result', { dashboard, s });
                if (s != null) {
                    setSaldo(s);
                    return;
                }
            } catch (e) {
            }

            let s = null;
            try {
                const stored = localStorage.getItem('user');
                if (stored) {
                    const u = JSON.parse(stored);
                    s = u?.saldo ?? u?.saldo_moedas ?? u?.estelitas ?? u?.moedas ?? u?.coins ?? null;
                }
            } catch (e) { s = null; }

            if (s == null) {
                try {
                    const s2 = await dashboardService.getSaldo();
                    console.debug('[RewardsPage] refreshSaldo: getSaldo fallback', { s2 });
                    s = (s2 != null) ? s2 : null;
                } catch (e) { s = null; }
            }
            console.debug('[RewardsPage] refreshSaldo: final saldo', { s });
            setSaldo(s != null ? s : 0);
        } catch (e) { setSaldo(null); }
    };

    const lastUserRef = React.useRef(null);
    const pollIntervalRef = React.useRef(null);

    useEffect(() => {
        let mounted = true;
        const onUserUpdated = (e) => {
            try {
                const data = e?.detail;
                console.debug('[RewardsPage] user:updated event', { data });
                if (!mounted) return;
                if (data && typeof data === 'object') {
                    const s1 = data.saldo ?? data.saldo_moedas ?? data.estelitas ?? data.moedas ?? data.coins ?? null;
                    const s2 = data.usuario ? (data.usuario.saldo ?? data.usuario.saldo_moedas ?? null) : null;
                    const s3 = data.meusDados ? (data.meusDados.saldo ?? null) : null;
                    const s = s1 ?? s2 ?? s3 ?? null;
                    if (s != null) { setSaldo(s); return; }
                    try {
                        const maybeDashboard = data.dashboard || data.usuario?.dashboard || null;
                        const sd = maybeDashboard ? (maybeDashboard.saldo ?? maybeDashboard.saldo_moedas ?? null) : null;
                        if (sd != null) { setSaldo(sd); return; }
                    } catch (e) {}
                } else if (typeof data === 'string' || typeof data === 'number') {
                    setSaldo(Number(data) || 0);
                }
            } catch (e) {}
        };
        const onLocalUserChange = () => {
            try {
                if (!mounted) return;
                const stored = localStorage.getItem('user');
                if (stored) {
                    try {
                        const u = JSON.parse(stored);
                        const s = u?.saldo ?? u?.saldo_moedas ?? u?.estelitas ?? u?.moedas ?? u?.coins ?? (u?.usuario ? (u.usuario.saldo ?? null) : null);
                        if (s != null) { setSaldo(s); return; }
                    } catch (e) {}
                }
                
                refreshSaldo();
            } catch (e) {}
        };
        window.addEventListener('user:updated', onUserUpdated);
        

        const onStorage = (ev) => {
            try {
                if (!mounted) return;
                if (!ev) return;
                if (ev.key === 'user' || ev.key === 'saldo') {
                    
                    try {
                        const stored = localStorage.getItem('user');
                        if (stored) {
                            const u = JSON.parse(stored);
                            const s = u?.saldo ?? u?.saldo_moedas ?? u?.estelitas ?? u?.moedas ?? u?.coins ?? null;
                            if (s != null) { setSaldo(s); return; }
                        }
                    } catch (e) {}
                    
                    refreshSaldo();
                }
            } catch (e) {}
        };

        const onFocus = () => { try { refreshSaldo(); } catch (e) {} };
        window.addEventListener('storage', onStorage);
        window.addEventListener('focus', onFocus);
        window.addEventListener('localUserChange', onLocalUserChange);
        const fetchData = async () => {
            setLoading(true);
                try {
                const data = await dashboardService.getRecompensas();
                const mapped = Array.isArray(data)
                    ? data.map((r, i) => ({
                          raw: r,
                          id: r.id ?? r._id ?? r.id_recompresas ?? r.id_recompensa ?? r.idRecompensa ?? r.codigo ?? r.cod ?? r.recompensaId ?? null,
                          image: r.imagem_path || r.imagem || r.image || r.url_imagem || r.url || null,
                          title: r.nome || r.title || r.nome_recompensa || `Recompensa ${i + 1}`,
                          description: r.descricao || r.description || r.desc || '',
                          value: r.preco_moedas || r.valor_em_moedas || r.valor || r.preco || r.price || 0,
                      }))
                    : [];
                if (mounted) setRewards(mapped);
                } catch (err) {
                console.error('Erro ao buscar recompensas:', err);
                if (mounted) setError(err);
            } finally {
                try {

                    let s = null;
                    try {
                            const stored = localStorage.getItem('user');
                            if (stored) {
                                const u = JSON.parse(stored);
                                s = u?.saldo ?? u?.saldo_moedas ?? u?.estelitas ?? u?.moedas ?? u?.coins ?? null;
                            }
                    } catch (e) { s = null; }

                    if (s == null) {

                        try {
                            const s2 = await dashboardService.getSaldo();
                            s = (s2 != null) ? s2 : null;
                        } catch (e) {
                            s = null;
                        }
                    }

                    if (mounted) setSaldo(s != null ? s : 0);
                } catch (e) {
                    if (mounted) setSaldo(null);
                }
                if (mounted) setLoading(false);
            }
        };
        fetchData();
        
        try { lastUserRef.current = localStorage.getItem('user'); } catch (e) { lastUserRef.current = null; }
        
        try {
            pollIntervalRef.current = setInterval(() => {
                try {
                    const cur = localStorage.getItem('user');
                    if (cur !== lastUserRef.current) {
                        lastUserRef.current = cur;
                        try {
                            const u = cur ? JSON.parse(cur) : null;
                            const s = u?.saldo ?? u?.saldo_moedas ?? u?.estelitas ?? u?.moedas ?? u?.coins ?? (u?.usuario ? (u.usuario.saldo ?? null) : null);
                            if (s != null) setSaldo(s);
                            else refreshSaldo();
                        } catch (e) { refreshSaldo(); }
                    }
                } catch (e) {}
            }, 1000);
        } catch (e) {}
        return () => {
            mounted = false;
            window.removeEventListener('user:updated', onUserUpdated);
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('localUserChange', onLocalUserChange);
            try { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); } catch (e) {}
        };
    }, []);
    

    return (
        <div className="rewards-page">
            <Header />
            <FaixaInfo />
            <main className="rewards-main">
                <h2 className="rewards-title">Recompensas</h2>
                <p className="rewards-balance">
                    Saldo: <strong>{saldo != null ? `${saldo} ESTELITAS` : '—'}</strong>
                </p>

                {loading && <p>Carregando recompensas...</p>}
                {error && <p>Erro ao carregar recompensas.</p>}

                <div className="rewards-grid">
                    {(() => {
                        const totalPages = Math.max(1, Math.ceil(rewards.length / ITEMS_PER_PAGE));
                        if (currentPage > totalPages) setCurrentPage(1);
                        const start = (currentPage - 1) * ITEMS_PER_PAGE;
                        const end = start + ITEMS_PER_PAGE;
                        const pageItems = rewards.slice(start, end);

                        return pageItems.map((reward, index) => (
                            <RewardsCard
                                key={index}
                                {...reward}
                                saldo={saldo}
                                onRedeemed={async () => {
                                    try { await refreshSaldo(); } catch (e) {}
                                    
                                    try {
                                        const dash = await dashboardService.getDashboardUsuario();
                                        const forced = dash?.usuario?.saldo ?? dash?.saldo ?? dash?.saldo_moedas ?? null;
                                        if (forced != null) setSaldo(forced);
                                        else {
                                            
                                            setTimeout(async () => {
                                                try {
                                                    const dash2 = await dashboardService.getDashboardUsuario();
                                                    const forced2 = dash2?.usuario?.saldo ?? dash2?.saldo ?? dash2?.saldo_moedas ?? null;
                                                    if (forced2 != null) setSaldo(forced2);
                                                } catch (e) {}
                                            }, 600);
                                        }
                                    } catch (e) {}

                                    try {
                                        const data = await dashboardService.getRecompensas();
                                        const mapped = Array.isArray(data)
                                            ? data.map((r, i) => ({
                                                  id: r.id ?? r._id ?? r.id_recompresas ?? r.id_recompensa ?? r.idRecompensa ?? r.codigo ?? r.cod ?? r.recompensaId ?? null,
                                                  image: r.imagem_path || r.imagem || r.image || r.url_imagem || r.url || null,
                                                  title: r.nome || r.title || r.nome_recompensa || `Recompensa ${i + 1}`,
                                                  description: r.descricao || r.description || r.desc || '',
                                                  value: r.preco_moedas || r.valor_em_moedas || r.valor || r.preco || r.price || 0,
                                              }))
                                            : [];
                                        setRewards(mapped);
                                    } catch (e) {}
                                }}
                            />
                        ));
                    })()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                    <PaginationRewards
                        currentPage={currentPage}
                        totalPages={Math.max(1, Math.ceil(rewards.length / ITEMS_PER_PAGE))}
                        onPageChange={(p) => setCurrentPage(p)}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}
