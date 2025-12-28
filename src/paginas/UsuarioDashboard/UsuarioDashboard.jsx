import { Sidebarusuario } from "../../components/sidebarusuario/Sidebarusuario";
import { Header } from "../../components/header/Header";
import { Giftcard } from "../../components/giftcard/Giftcard";
import "./usuarioDashboard.css";
import moeda from "../../assets/moeda.png";
import livraria from "../../assets/livraria igarassu.jpg";

export function UsuarioDashboard() {
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
                                $ 100,00 Estelitas
                            </h2>

                        </div>

                        <div className="conquista-card2">
                            <h2>
                                Total de figurinhas resgatadas:
                                <br />
                                1
                            </h2>
                        </div>

                    </div>

                    <div className="resgate-conrainer">
                        <h2 className="resgate-recompensa"><br />Recompensas resgatadas:</h2>
                        <hr />

                        <div className="giftcard-usuario-dashboard">
                        <Giftcard
                            image={livraria}
                            value="$ 200"
                            discount="Desconto 10%"
                            store="Livraria Maria Bonita"
                            code="2f7f87"
                        />

                         <Giftcard
                            image={livraria}
                            value="$ 100"
                            discount="Desconto 5%"
                            store="Livraria Maria Bonita"
                            code="2f7f88"
                        />

                        <Giftcard
                            image={livraria}
                            value="$ 300"
                            discount="Desconto 15%"
                            store="Livraria Maria Bonita"
                            code="2f7f89"
                        />



                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}