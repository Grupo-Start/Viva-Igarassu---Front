import Header from "../../components/header/header";
import { Link } from "react-router-dom";
import "./Pontos.css";

export function Pontos() {
  const pontos = [
    {
      id: "matriz",
      nome: "Igreja Matriz dos Santos Cosme e Damião",
      imagem: "igreja.jpg",
    },
    {
      id: "sagrado-coracao",
      nome: "Convento Sagrado Coração de Jesus",
      imagem: "convento.png",
    },
    {
      id: "convento",
      nome: "Convento Franciscano de Santo Antônio e Pinacoteca",
      imagem: "conventofranciscano.jpeg",
    },
    {
      id: "sobrado",
      nome: "Sobrado do Imperador",
      imagem: "sobrado.jpg",
    },
    {
      id: "biblioteca",
      nome: "Biblioteca Municipal de Igarassu",
      imagem: "biblioteca.png",
    },
    {
      id: "museu",
      nome: "Museu Histórico de Igarassu",
      imagem: "museu.png",
    },
    {
      id: "artesao",
      nome: "Casa do Artesão e Centro de Informações Turísticas",
      imagem: "casa.png",
    },

  ];

  return (
    <main className="pontos-container">
      <Header />

      <section className="pontos-titulo">
        <h1>Pontos turísticos</h1>
      </section>

      <section className="pontos-grid">
        {pontos.map((ponto) => (
          <div key={ponto.id} className="ponto-card">
            <img src={ponto.imagem} alt={ponto.nome} />
            <h3>{ponto.nome}</h3>

            <Link to={`/pontos/${ponto.id}`}>
              <button>saiba mais</button>
            </Link>
          </div>
        ))}
      </section>

     
    </main>
  );
}
