import { useState, useEffect } from "react";
import { Sidebarusuario } from "../../../components/sidebarusuario/Sidebarusuario";
import { Header } from "../../../components/header/Header";
import { Giftcard } from "../../../components/giftcard/Giftcard";
import { dashboardService } from "../../../services/api";
import "./usuarioDashboard.css";
import moeda from "../../../assets/moeda.png";
import livraria from "../../../assets/livraria igarassu.jpg";

export function UsuarioDashboard() {
    const [figurinhasCount, setFigurinhasCount] = useState(0);
    const [saldo, setSaldo] = useState(0);
    const [resgates, setResgates] = useState([]);
    const [loading, setLoading] = useState(true);

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
                setResgates(dashboard.recompensas_resgatadas || dashboard.resgates || dashboard.recompensas || []);
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
                            
                            {resgates.map((resgate) => (
                                <Giftcard
                                    key={resgate.id}
                                    image={resgate.recompensa?.imagem || resgate.imagem || livraria}
                                    value={`$ ${resgate.recompensa?.valor || resgate.valor || 0}`}
                                    discount={resgate.recompensa?.desconto || resgate.desconto || ""}
                                    store={resgate.recompensa?.empresa?.nome || resgate.loja || ""}
                                    code={resgate.codigo || resgate.id}
                                />
                            ))}
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}