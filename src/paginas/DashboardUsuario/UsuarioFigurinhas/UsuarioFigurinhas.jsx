import "./UsuarioFigurinhas.css";
import { Sidebarusuario } from "../../../components/sidebarusuario/Sidebarusuario";
import { Header } from "../../../components/header/Header";
import { useState, useEffect } from "react";
import { dashboardService } from "../../../services/api";

import figuCosmeDamiao from "../../../assets/figu_cosme_e_damiao.png";
import figuSagradoCoracao from "../../../assets/figu_sagrado_coracao.png";
import figuArtesao from "../../../assets/figu_artesao.png";
import figuBiblioteca from "../../../assets/figu_biblioteca.png";
import figuConventoFranciscano from "../../../assets/figu_covento_franciscano.png";
import figuMuseu from "../../../assets/figu_museu.png";
import figuSobrado from "../../../assets/figu_sobrado.png";

const imagensFigurinhas = {
    "cosme": figuCosmeDamiao,
    "damiao": figuCosmeDamiao,
    "cosme e damiao": figuCosmeDamiao,
    "santos cosme": figuCosmeDamiao,
    "igreja matriz": figuCosmeDamiao,
    "sagrado": figuSagradoCoracao,
    "sagrado coracao": figuSagradoCoracao,
    "coracao de jesus": figuSagradoCoracao,
    "artesao": figuArtesao,
    "artesão": figuArtesao,
    "casa do artesao": figuArtesao,
    "casa do artesão": figuArtesao,
    "biblioteca": figuBiblioteca,
    "biblioteca municipal": figuBiblioteca,
    "convento": figuConventoFranciscano,
    "franciscano": figuConventoFranciscano,
    "convento franciscano": figuConventoFranciscano,
    "museu": figuMuseu,
    "museu historico": figuMuseu,
    "museu histórico": figuMuseu,
    "sobrado": figuSobrado,
    "sobrado do imperador": figuSobrado,
    "imperador": figuSobrado,
};

function getImagemFigurinha(nome) {
    if (!nome) return null;
    const nomeLower = nome.toLowerCase();
    
    for (const [chave, imagem] of Object.entries(imagensFigurinhas)) {
        if (nomeLower.includes(chave)) {
            return imagem;
        }
    }
    return null;
}

export function UsuarioFigurinhas() {
    const [figurinhas, setFigurinhas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFigurinhas = async () => {
            try {
                setLoading(true);
                const data = await dashboardService.getMinhasFigurinhas();
                
                let lista = [];
                if (data?.figurinhas && Array.isArray(data.figurinhas)) {
                    lista = data.figurinhas.filter(f => 
                        f.conquistada === true || 
                        f.desbloqueada === true || 
                        f.coletada === true ||
                        f.usuario_tem === true
                    );
                    
                    if (lista.length === 0 && data.conquistadas > 0) {
                        lista = data.figurinhas.slice(0, data.conquistadas);
                    }
                } else if (Array.isArray(data)) {
                    lista = data;
                }
                
                if (lista.length > 0) {
                }
                setFigurinhas(lista);
            } catch (err) {
                console.error("Erro ao carregar figurinhas:", err);
                setError("Erro ao carregar suas figurinhas. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchFigurinhas();
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

                <main className="figurinhas-container">
                    <h1 className="titulo-album">Álbum de figurinhas</h1>
                    <hr/>
                    <div className="album-header">
                        <div className="album-stats">Você tem <strong>{figurinhas.length}</strong> figurinhas</div>
                    </div>
                    
                    {loading && (
                        <div className="loading-message">Carregando suas figurinhas...</div>
                    )}
                    
                    {error && (
                        <div className="error-message">{error}</div>
                    )}
                    
                    {!loading && !error && figurinhas.length === 0 && (
                        <div className="empty-message">
                            Você ainda não possui figurinhas. Visite pontos turísticos para colecionar!
                        </div>
                    )}
                    
                    <div className="album-box">
                        {figurinhas.map((figurinha, index) => {
                            const nome = figurinha.nome 
                                || figurinha.Figurinha?.nome
                                || figurinha.figurinha?.nome;
                            const imagem = getImagemFigurinha(nome)
                                || figurinha.imagem 
                                || figurinha.foto 
                                || figurinha.url_imagem 
                                || figurinha.Figurinha?.imagem
                                || figurinha.figurinha?.imagem;

                            const key = figurinha.id_figurinha || figurinha.id || `fig-${index}`;

                            return (
                                <div className="figurinha" key={key} aria-label={nome || `Figurinha ${index + 1}`}>
                                    {imagem ? (
                                        <img
                                            src={imagem}
                                            alt={nome || 'Figurinha'}
                                            loading="lazy"
                                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = figuSobrado; }}
                                        />
                                    ) : (
                                        <div className="placeholder" aria-hidden="true">?</div>
                                    )}
                                    <span>{nome || 'Sem nome'}</span>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>
        </div>
    );
}
