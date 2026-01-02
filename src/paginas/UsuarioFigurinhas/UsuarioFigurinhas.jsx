import "./UsuarioFigurinhas.css";
import { Sidebarusuario } from "../../components/sidebarusuario/Sidebarusuario";
import { Header } from "../../components/header/Header";
import cosmeDamiao from "../../assets/figu_cosme_e_damiao.png";
import sagradoCoracao from "../../assets/figu_sagrado_coracao.png";

export function UsuarioFigurinhas() {
    return (
        <div>
            <header>
                <Header />
            </header>

            <div className="dashboard-layout-container">
                <nav>
                    <Sidebarusuario />
                </nav>

                <main className="figurinhas-container">
                    <h1 className="titulo-album">Álbum de figurinhas</h1>
                    <hr/>
                    <div className="album-box">
                        <div className="figurinha">
                            <img
                                src={cosmeDamiao}
                                alt="Igreja Matriz dos Santos Cosme e Damião"
                            />
                            <span>Igreja Matriz dos Santos Cosme e Damião</span>
                        </div>

                        <div className="figurinha">
                            <img
                                src={sagradoCoracao}
                                alt="Sagrado Coração de Jesus"
                            />
                            <span>Sagrado Coração de Jesus</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
