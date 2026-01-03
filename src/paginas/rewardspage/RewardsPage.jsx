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

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            setLoading(true);
                try {
                const data = await dashboardService.getRecompensas();
                const mapped = Array.isArray(data)
                    ? data.map((r, i) => ({
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
                    const s = await dashboardService.getSaldo();
                    if (mounted) setSaldo(s || 0);
                } catch (e) {
                    if (mounted) setSaldo(null);
                }
                if (mounted) setLoading(false);
            }
        };
        fetchData();
        return () => { mounted = false; };
    }, []);

    return (
        <div className="rewards-page">
            <Header />
            <main className="rewards-main">
                <h2 className="rewards-title">Recompensas</h2>
                <p className="rewards-balance">
                    Você já ganhou: <strong>{saldo != null ? `${saldo} ESTELITAS` : '—'}</strong>
                </p>

                {loading && <p>Carregando recompensas...</p>}
                {error && <p>Erro ao carregar recompensas.</p>}

                <div className="rewards-grid">
                    {rewards.map((reward, index) => (
                        <RewardsCard key={index} {...reward} />
                    ))}
                </div>
                <PaginationRewards />
            </main>
            <Footer />
        </div>
    );
}
