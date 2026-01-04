import { Header } from "../../components/header/Header";
import { RewardsCard } from "../../components/rewardscard/RewardsCard";
import { PaginationRewards } from "../../components/paginationRewards/PaginationRewards";
import "./RewardsPage.css";
import Footer from "../../components/footer/Footer";
import { useEffect, useState } from "react";
import { dashboardService } from "../../services/api";

export function RewardsPage() {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saldo, setSaldo] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        let mounted = true;
        const onUserUpdated = (e) => {
            try {
                const data = e?.detail;
                if (!mounted) return;
                if (data && typeof data === 'object') {
                    const s = data.saldo ?? data.saldo_moedas ?? data.estelitas ?? data.moedas ?? data.coins ?? null;
                    if (s != null) setSaldo(s);
                } else if (typeof data === 'string' || typeof data === 'number') {
                    setSaldo(Number(data) || 0);
                }
            } catch (e) {}
        };
        window.addEventListener('user:updated', onUserUpdated);
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
                    // primeiro tenta obter saldo do usuário do localStorage (caso público)
                    let s = null;
                    try {
                        const stored = localStorage.getItem('user');
                        if (stored) {
                            const u = JSON.parse(stored);
                            s = u?.saldo_moedas ?? u?.saldo ?? u?.estelitas ?? u?.moedas ?? u?.coins ?? null;
                        }
                    } catch (e) { s = null; }

                    if (s == null) {
                        // tenta a API como fallback; evite redirecionamento automático para /login
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
        return () => { mounted = false; window.removeEventListener('user:updated', onUserUpdated); };
    }, []);
    

    return (
        <div className="rewards-page">
            <Header />
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
                            <RewardsCard key={index} {...reward} onRedeemed={async () => {
                                try {
                                    const s = await dashboardService.getSaldo();
                                    setSaldo(s || 0);
                                } catch (e) {
                                    setSaldo(prev => prev);
                                }
                                // opcional: recarregar lista de recompensas
                                try { const data = await dashboardService.getRecompensas(); const mapped = Array.isArray(data) ? data.map((r, i) => ({ id: r.id ?? r._id ?? r.id_recompresas ?? r.id_recompensa ?? r.idRecompensa ?? r.codigo ?? r.cod ?? r.recompensaId ?? null, image: r.imagem_path || r.imagem || r.image || r.url_imagem || r.url || null, title: r.nome || r.title || r.nome_recompensa || `Recompensa ${i + 1}`, description: r.descricao || r.description || r.desc || '', value: r.preco_moedas || r.valor_em_moedas || r.valor || r.preco || r.price || 0, })) : []; setRewards(mapped);} catch(e){}
                            }} />
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
