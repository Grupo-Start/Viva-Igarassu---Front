import { useState, useEffect } from "react";
import { Sidebarusuario } from "../../../components/sidebarusuario/Sidebarusuario";
import { Header } from "../../../components/header/Header";
import { Giftcard } from "../../../components/giftcard/Giftcard";
import { PaginationRewards } from "../../../components/paginationRewards/PaginationRewards";
import { dashboardService, API_BASE_URL } from "../../../services/api";
import "./usuarioDashboard.css";
import moeda from "../../../assets/moeda.png";
import livraria from "../../../assets/livraria igarassu.jpg";

export function UsuarioDashboard() {
    const [figurinhasCount, setFigurinhasCount] = useState(0);
    const [saldo, setSaldo] = useState(0);
    const [resgates, setResgates] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                
                const dashboard = await dashboardService.getDashboardUsuario();
                
                const count = dashboard.figurinhas?.total_conquistadas 
                    || dashboard.totalFigurinhas 
                    || dashboard.total_conquistadas 
                    || 0;
                setFigurinhasCount(count);
                
                setSaldo(dashboard.usuario?.saldo || dashboard.saldo_moedas || dashboard.saldo || 0);
                const initialResgates = dashboard.recompensas_resgatadas || dashboard.resgates || dashboard.recompensas || [];

                if ((!initialResgates || initialResgates.length === 0)) {
                    try {
                        const meus = await dashboardService.getMeusResgates();
                        setResgates(Array.isArray(meus) ? meus : initialResgates);
                    } catch (e) {
                        setResgates(initialResgates);
                    }
                } else {
                    setResgates(initialResgates);
                }
            } catch (err) {
                console.error("Erro ao carregar dados do dashboard:", err);
                const user = JSON.parse(localStorage.getItem("user") || "{}");
                setSaldo(user.saldo_moedas || user.saldo || user.estelitas || 0);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div>

            <header>
                <Header />
            </header>


            <div className="dashboard-layout-container">
                <nav>
                    <Sidebarusuario />
                </nav>

                <main className="usuario-dashboard-main">
                    <h1>Minhas Conquistas</h1>
                    <hr />

                    <div className="conquistas-container">
                        <div className="conquista-card">
                            <img className="moeda" src={moeda} alt="Moeda" />
                            <h2>
                                Saldo
                                <br />
                                $ {saldo} Estelitas
                            </h2>

                        </div>

                        <div className="conquista-card2">
                            <h2>
                                Total de figurinhas resgatadas:
                                <br />
                                {loading ? "..." : figurinhasCount}
                            </h2>
                        </div>

                    </div>

                    <div className="resgate-conrainer">
                        <h2 className="resgate-recompensa"><br />Recompensas resgatadas:</h2>
                        <hr />

                        <div className="giftcard-usuario-dashboard">
                            {loading && <p>Carregando recompensas...</p>}
                            
                            {!loading && resgates.length === 0 && (
                                <p className="empty-resgates">Você ainda não resgatou nenhuma recompensa.</p>
                            )}
                            
                            {(() => {
                                const totalPages = Math.max(1, Math.ceil(resgates.length / ITEMS_PER_PAGE));
                                if (currentPage > totalPages) setCurrentPage(1);
                                const start = (currentPage - 1) * ITEMS_PER_PAGE;
                                const end = start + ITEMS_PER_PAGE;
                                const pageItems = resgates.slice(start, end);

                                return pageItems.map((resgate, idx) => {
                                const resolvedImage = (function(){

                                    let imgField = resgate.recompensa?.imagem_path || resgate.recompensa?.imagem || resgate.imagem || resgate.imagem_path || '';
                                    const base = String(API_BASE_URL).replace(/\/$/, '');
                                    if (!imgField) {
                                        return livraria;
                                    }
                                    try {
                                        imgField = String(imgField).trim();
                                        let resolved = null;

                                        if (/^https?:\/\//i.test(imgField)) {
                                            resolved = imgField;
                                        } else {


                                            try {
                                                const lastHttp = imgField.toLowerCase().lastIndexOf('http');
                                                if (lastHttp > 0) {
                                                    resolved = imgField.slice(lastHttp);
                                                }
                                            } catch (e) {  }

                                            if (!resolved && /^\/\//.test(imgField)) resolved = `${window.location.protocol}${imgField}`;

                                            if (!resolved && imgField.indexOf(base) !== -1) resolved = imgField;

                                            if (!resolved && imgField.startsWith('/')) resolved = `${base}${imgField}`;

                                            if (!resolved) resolved = `${base}/${imgField.replace(/^\/+/, '')}`;
                                        }

                                        return resolved || livraria;
                                    } catch (e) {

                                        return livraria;
                                    }
                                })();
                                
                                    return (
                                    <Giftcard
                                        key={resgate.id || resgate.codigo || idx}
                                        image={resolvedImage}
                                        value={`$ ${resgate.recompensa?.valor || resgate.valor || resgate.recompensa?.preco_moedas || 0}`}
                                        discount={resgate.recompensa?.desconto || resgate.desconto || ""}
                                        store={resgate.recompensa?.empresa?.nome || resgate.loja || resgate.empresa || ""}
                                        code={resgate.codigo || resgate.id || resgate.recompensa?.codigo || ''}
                                        title={resgate.recompensa?.nome || resgate.nome || resgate.titulo || ''}
                                        description={resgate.recompensa?.descricao || resgate.descricao || resgate.description || ''}
                                    />
                                );
                                });
                            })()}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
                            <PaginationRewards
                                currentPage={currentPage}
                                totalPages={Math.max(1, Math.ceil(resgates.length / ITEMS_PER_PAGE))}
                                onPageChange={(p) => setCurrentPage(p)}
                            />
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}