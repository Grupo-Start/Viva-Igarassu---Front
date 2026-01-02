import Header from "../../components/header/header";
import "./Pontoturistico.css";
import { useParams } from "react-router-dom";

export function Pontoturistico() {
   const { id } = useParams();

  console.log(id);
  return (
    <main className="ponto-container">
      <Header />

      <section className="ponto-titulo">
        <h4>Pontos turísticos</h4>
        <h1>Convento Franciscano de Santo Antônio e Pinacoteca</h1>
      </section>

      <section className="ponto-principal">
        <img
          src="conventofranciscano.jpeg"
          alt="Convento Franciscano de Santo Antônio"
          className="ponto-imagem"
        />

        <p className="ponto-descricao">
          Um dos mais belos conjuntos coloniais da cidade, o convento
          encanta pela arquitetura histórica e atmosfera de paz. A
          Pinacoteca abriga um valioso acervo de arte sacra e pinturas
          antigas, preservando séculos de fé, cultura e tradição
          franciscana em Igarassu.
        </p>
      </section>

      <section className="ponto-cards">
        <div className="card-info">
          <div className="card-header">
            <h3>Curiosidades Históricas</h3>
          </div>

          <ul>
            <li>✨ A igreja abriga obras de arte sacra de grande valor histórico</li>
            <li>🏛️ Exemplar importante da arquitetura colonial portuguesa</li>
            <li>🙏 Um importante centro de peregrinação religiosa durante séculos</li>
            <li>📜 Conectada ao patrimônio cultural de Pernambuco</li>
          </ul>
        </div>

        <div className="card-info">
          <div className="card-header">
            <h3>Mapa</h3>
          </div>

         <a
  href="https://www.bing.com/maps/search?FORM=KC2MAP&style=r&q=Convento+e+Igreja+de+Santo+Ant%C3%B4nio+e+pinacoteca&cp=-7.831013%7E-34.914794&lvl=13.1"
  target="_blank"
  rel="noopener noreferrer"
>
  <img
    src="mapa.png"
    alt="Trilha Sítio Histórico"
    className="mapa-imagem"
  />
</a>

        </div>
      </section>

      <section className="ponto-cta">
        <h2>RESGATE AGORA A SUA FIGURINHA!</h2>
        <button>ESCANEI AQUI</button>
      </section>
    </main>
  );
}
