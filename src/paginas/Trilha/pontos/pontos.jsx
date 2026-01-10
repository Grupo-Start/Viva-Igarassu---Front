import Header from "../../../components/header/Header";
import FaixaInfo from "../../../components/header/FaixaInfo";
import Footer from "../../../components/footer/Footer";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { dashboardService } from "../../../services/api";
import "./Pontos.css";

const imagensLocais = {
  "biblioteca": "biblioteca.png",
  "casa do artesão": "casa.png",
  "convento do sagrado": "convento.png",
  "convento franciscano": "conventofranciscano.jpeg",
  "igreja matriz": "igreja.jpg",
  "museu histórico": "museu.png",
  "sobrado do imperador": "sobrado.jpg",
};

const getImagemPorNome = (nome) => {
  if (!nome) return '';
  const nomeLower = nome.toLowerCase();
  for (const [key, value] of Object.entries(imagensLocais)) {
    if (nomeLower.includes(key)) return value;
  }
  return '';
};

export function Pontos() {
  const [pontos, setPontos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPontos = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getPontosTuristicos();
        const lista = Array.isArray(data) ? data : (data?.data || data?.pontos || []);
        const ordenado = lista.sort((a, b) => {
          const nomeA = (a.nome || a.name || '').toLowerCase();
          const nomeB = (b.nome || b.name || '').toLowerCase();
          return nomeA.localeCompare(nomeB, 'pt-BR');
        });
        setPontos(ordenado);
      } catch (error) {
        console.error("Erro ao buscar pontos turísticos:", error);
        setPontos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPontos();
  }, []);

  return (
    <div className="page-layout">
    <main className="pontos-container">
      <Header />

      <FaixaInfo />
      <section className="pontos-titulo">
        <h1>Pontos Turísticos</h1>
      </section>

      {loading ? (
        <section className="pontos-grid">
          <p>Carregando pontos turísticos...</p>
        </section>
      ) : (
        <section className="pontos-grid">
          {pontos.map((ponto, index) => {
            const id = ponto.id || ponto.id_ponto || ponto._id;
            const nome = ponto.nome || ponto.name;
            let imagem = ponto.imagem || ponto.foto || ponto.image || ponto.url_imagem || '';
            if (!imagem) {
              imagem = getImagemPorNome(nome);
            }
            
            return (
              <div key={id} className="ponto-card">
                {imagem && (
                  <img 
                    src={imagem.startsWith('http') ? imagem : `/${imagem}`} 
                    alt={nome} 
                  />
                )}
                <h3>{nome}</h3>

                <Link to={`/pontos-turisticos/${id}`}>
                  <button>Saiba mais</button>
                </Link>
              </div>
            );
          })}
        </section>
      )}
    </main>
    <Footer />
    </div>
  );
}
