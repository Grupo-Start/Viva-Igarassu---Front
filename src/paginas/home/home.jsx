import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";
import "./home.css";
import { Icon } from "@iconify/react";

export function Home() {
  return (
    <main className="telainicial-container">
      <Header />

      <section className="imagem-topo">
        <img
          src="imagem-Telainicial.png"
          alt="imagem igarassu - tela inicial"
        />

        <div className="faixa-info">
          <span className="faixa-texto">
            Agenda | Pontos Turísticos | Trilha Sítio Histórico | Recompensas
          </span>
        </div>
      </section>

      <section className="hero">
        <h1>
          Viva Igarassu. <span>Viva nossa história.</span>
        </h1>

        <br />
        <br />

        <div className="descricao-box">
          <p>
            Descubra <strong>pontos históricos</strong>, participe de{" "}
            <strong>eventos</strong>, escaneie <strong>QR Codes</strong> e ganhe{" "}
            <strong>figurinhas e recompensas</strong> enquanto explora a cidade.
          </p>
        </div>
      </section>

      <section className="como-funciona">
        <h2>
          Como funciona o Viva <br />
          Igarassu?
        </h2>

        <div className="cards">
          <div className="card">
            <Icon icon="mdi:map-marker" className="card-icon" />
            <h3>Escolha um ponto turístico</h3>
          </div>

          <div className="card">
            <Icon icon="mdi:qrcode-scan" className="card-icon" />
            <h3>Escaneie o QR Code</h3>
          </div>

          <div className="card">
            <Icon icon="mdi:gift" className="card-icon" />
            <h3>Ganhe figurinhas</h3>
          </div>

          <div className="card">
            <Icon icon="mdi:trophy" className="card-icon" />
            <h3>Troque recompensas</h3>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Conheça Igarassu de um jeito novo!</h2>
        <p>Cadastre-se e comece sua trilha histórica agora!</p>
        <button className="cta-btn">CADASTRE-SE</button>
      </section>

      <div className="faixa-topo-historico">
        <h2>Trilha Sítio Histórico</h2>
        <span className="tag-historico">#vivanossahistoria</span>
      </div>

      <section className="trilha-locais">
        <img
          src="foto.trilha.jpeg"
          alt="Trilha Sítio Histórico"
          className="imagem-trilha"
        />

        <div className="lista-locais">
        
          <ul>
            <li>Igreja Matriz dos Santos Cosme e Damião</li>
            <li>Convento Sagrado Coração de Jesus</li>
            <li>Convento Franciscano de Santo Antônio e Pinacoteca</li>
            <li>Sobrado do Imperador</li>
            <li>Biblioteca Municipal</li>
            <li>Museu Histórico de Igarassu</li>
            <li>Casa do Artesão e Centro de Informações Turísticas</li>
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
