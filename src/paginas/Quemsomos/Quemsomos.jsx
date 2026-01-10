import "./Quemsomos.css";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/header";

export function Quemsomos() {
  return (
    <>
      <Header />

      <main className="conteudo">
        {/* TOPO */}
        <div className="topo-viva">
          <span className="viva-texto">VIVA</span>
          <img
            src="/Igarassu.png"
            alt="Igarassu"
            className="igarassu-img"
          />
        </div>

        {/* TEXTO DO PROJETO */}
        <section className="quem-somos">
          <div className="texto-projeto">
            <p>
              O Projeto Viva Igarassu tem como objetivo promover e modernizar a
              experiência turística na cidade, conectando visitantes aos
              principais pontos históricos, culturais, religiosos e naturais de
              Igarassu, Pernambuco.
            </p>
            <br />
            <p>
              Cada ponto turístico do sítio histórico contará com um QR Code
              exclusivo, permitindo que o visitante registre sua presença e
              acumule pontos, conquistas e recompensas dentro da plataforma.
            </p>
            <br />
            <p>
              A iniciativa transforma a visitação em uma jornada interativa,
              divertida e educativa, incentivando o conhecimento da cultura
              local, o aumento do fluxo turístico e o fortalecimento da economia
              e da identidade cultural da região.
            </p>
            <br />
          </div>

          {/* MISSÃO */}
          <div className="missao">
            <h2>NOSSA MISSÃO</h2>
            <p>
              Valorizar Igarassu como o destino histórico mais importante de
              Pernambuco, promovendo o turismo através da tecnologia e
              oferecendo aos visitantes uma experiência envolvente e acessível.
              Buscamos estimular a descoberta dos patrimônios culturais,
              ambientais e religiosos, aproximando cada pessoa da essência e da
              história da cidade.
            </p>
          </div>

          {/* VALORES */}
          <div className="valores">
            <h2>⭐ NOSSOS VALORES</h2>

            <div className="valores-cards">
              <div className="valor-card">
                <strong>Preservação Histórica</strong>
                <p>
                  Honramos a importância de Igarassu, promovendo seu acervo
                  cultural e religioso.
                </p>
              </div>

              <div className="valor-card">
                <strong>Inovação</strong>
                <p>
                  Unimos tradição e tecnologia para criar novas possibilidades
                  turísticas.
                </p>
              </div>

              <div className="valor-card">
                <strong>Acessibilidade</strong>
                <p>
                  Experiência simples, intuitiva e gratuita para todos os
                  visitantes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}