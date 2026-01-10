import "./Acidade.css";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaLandmark,
} from "react-icons/fa";
import Header from "../../components/header/header";
import Footer from "../../components/footer/Footer";

export function Acidade() {
  return (
    <>
      <Header />

      {/* BANNER */}
      <section className="banner-cidade">
        <img
          src="/igreja.jpeg"
          alt="Igreja de Igarassu"
          className="banner-img"
        />

        <div className="banner-conteudo">
          <span className="hashtag">#vivanossahistória</span>
          <h1>Igarassu</h1>
          <p>
            Uma das cidades mais antigas do Brasil, onde a história colonial ganha
            vida
          </p>
        </div>
      </section>

      {/* CARDS INFO */}
      <section className="info-cards">
        <div className="info-card">
          <FaMapMarkerAlt />
          <h3>Localização</h3>
          <p>Pernambuco, Brasil</p>
          <p>Região Metropolitana do Recife</p>
        </div>

        <div className="info-card">
          <FaCalendarAlt />
          <h3>Fundação</h3>
          <p>27 de setembro de 1535</p>
          <p>Segunda vila mais antiga do Brasil</p>
        </div>

        <div className="info-card">
          <FaUsers />
          <h3>População</h3>
          <p>Aprox. 118 mil habitantes</p>
          <p>Estimativa IBGE</p>
        </div>

        <div className="info-card">
          <FaLandmark />
          <h3>Patrimônio</h3>
          <p>Conjunto histórico tombado</p>
          <p>IPHAN</p>
        </div>
      </section>

      {/* SOBRE - CARD GRANDE */}
      <section className="sobre-wrapper">
        <div className="sobre-card">
          <h2>Sobre a Cidade</h2>

          <p>
            Igarassu é um município brasileiro do estado de Pernambuco,
            localizado na Região Metropolitana do Recife. Seu nome vem do tupi e
            significa “canoa grande”.
          </p>

          <p>
            A cidade é conhecida por seu importante conjunto arquitetônico
            colonial e por abrigar a Igreja de São Cosme e São Damião, considerada
            a mais antiga do Brasil ainda em funcionamento.
          </p>

          <p>
            Além da rica história, Igarassu possui belas praias como a Praia de
            Gavoa, Praia do Janga e a paradisíaca Ilha de Itamaracá nas
            proximidades.
          </p>
        </div>
    <br />
    <br />
    
        {/* FRASE FINAL */}
        <span className="rodape-texto">
          <strong className="rodape-igarassu">Igarassu</strong> – Onde a história
          do Brasil começou
        </span>
      </section>

      <Footer />
    </>
  );
}
