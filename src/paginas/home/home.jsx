import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import "./home.css";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export function Home() {
  const navigate = useNavigate();
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
            <span className="faixa-link" onClick={() => navigate('/eventspage')}>Agenda</span> | <span className="faixa-link" onClick={() => navigate('/pontos-turisticos')}>Pontos Turísticos</span> | <span className="faixa-link" onClick={() => {
              const target = document.getElementById('trilha-historico');
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            }}>Trilha Sítio Histórico</span> | <span className="faixa-link" onClick={() => navigate('/rewardspage')}>Recompensas</span>
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

        <div className="hero-ctas">
          <button className="btn-primary" onClick={() => navigate('/register')}>Cadastre-se</button>
          <button className="btn-secondary" onClick={() => navigate('/pontos-turisticos')}>Explorar pontos</button>
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
      </section>

      <div className="faixa-topo-historico" id="trilha-historico">
        <h2>Trilha Sítio Histórico</h2>
        <span className="tag-historico">#vivanossahistoria</span>
      </div>

      <section className="trilha-locais">
        

        <div className="lista-locais">
          {(() => {
            const initialPoints = [
              { id: 1, name: "Igreja Matriz dos Santos Cosme e Damião", unlocked: true, image: "igreja.jpg" },
              { id: 2, name: "Convento Sagrado Coração de Jesus", unlocked: true, image: "convento.png" },
              { id: 3, name: "Convento Franciscano de Santo Antônio e Pinacoteca", unlocked: true, image: "conventofranciscano.jpeg" },
              { id: 4, name: "Sobrado do Imperador", unlocked: false, image: "sobrado.jpg" },
              { id: 5, name: "Biblioteca Municipal", unlocked: false, image: "biblioteca.png" },
              { id: 6, name: "Museu Histórico de Igarassu", unlocked: false, image: "museu.png" },
              { id: 7, name: "Casa do Artesão e Centro de Informações Turísticas", unlocked: false, image: "casa.png" }
            ];

            return (
              <div className="trail-timeline">
                {initialPoints.map((p) => (
                  <div key={p.id} className="timeline-row">
                    <div
                      className={`timeline-circle ${p.unlocked ? 'unlocked' : 'locked'}`}
                      onClick={() => p.unlocked && navigate('/pontos-turisticos')}
                      aria-label={p.name}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' && p.unlocked) navigate('/pontos-turisticos'); }}
                    >
                      {p.image ? (
                        <img src={`/${p.image}`} alt={p.name} className="timeline-circle__img" />
                      ) : (
                        <Icon icon="mdi:map-marker" className="timeline-circle__icon" />
                      )}

                      {p.unlocked ? (
                        <span className="timeline-badge check">✓</span>
                      ) : (
                        <span className="timeline-badge lock">🔒</span>
                      )}
                    </div>

                    <div className={`timeline-label ${p.unlocked ? 'unlocked' : 'locked'}`}>
                      <div className="timeline-label__text">{p.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      <Footer />
    </main>
  );
}
