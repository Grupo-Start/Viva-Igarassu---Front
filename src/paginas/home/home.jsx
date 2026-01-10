import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import FaixaInfo from "../../components/header/FaixaInfo";
import "./home.css";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { dashboardService } from '../../services/api';

export function Home() {
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return setIsLogged(false);
      const u = JSON.parse(raw);
      const logged = !!(u && (u.id || u._id || u.token || u.accessToken || u.nome || u.email));
      setIsLogged(logged);
    } catch (e) {
      setIsLogged(false);
    }
  }, []);

  const normalize = (s) => {
    try {
      return String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    } catch (e) { return String(s || '').toLowerCase(); }
  };

  const resolvePointId = async (p) => {
    try {
      const data = await dashboardService.getPontosTuristicos();
      const lista = Array.isArray(data) ? data : (data?.data || data?.pontos || []);
      const target = normalize(p.name || p.nome || '');
      const found = (lista || []).find(pt => {
        try {
          const names = [pt.nome, pt.name, pt.titulo, pt.titulo_ponto, pt.nome_ponto];
          for (const n of names) {
            if (!n) continue;
            const nn = normalize(n);
            if (!nn) continue;
            if (nn === target) return true;
            if (nn.includes(target) || target.includes(nn)) return true;
          }
        } catch (e) {}
        return false;
      });
      const resolved = found ? (found.id || found.id_ponto || found._id || found.uuid || found.uuid_ponto || '') : (p.id || '');
      return { id: resolved, obj: found || p };
    } catch (e) {
      return { id: p.id || '', obj: p };
    }
  };

  return (
    <main className="telainicial-container">
      <Header />

      <section className="imagem-topo">
        <img
          src="imagem-Telainicial.png"
          alt="imagem igarassu - tela inicial"
        />

        <FaixaInfo />
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
          {!isLogged && (
            <button className="btn-primary" onClick={() => navigate('/register')}>Cadastre-se</button>
          )}
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
              { id: 2, name: "Convento do Sagrado Coração de Jesus", unlocked: true, image: "convento.png" },
              { id: 3, name: "Convento Franciscano e Museu Pinacoteca", unlocked: true, image: "conventofranciscano.jpeg" },
              { id: 4, name: "Sobrado do Imperador", unlocked: true, image: "sobrado.jpg" },
              { id: 5, name: "Biblioteca Pública de Igarassu", unlocked: true, image: "biblioteca.png" },
              { id: 6, name: "Museu Histórico de Igarassu", unlocked: true, image: "museu.png" },
              { id: 7, name: "Casa do Artesão e Centro de Informações Turísticas", unlocked: true, image: "casa.png" }
            ];

            return (
              <div className="trail-timeline">
                {initialPoints.map((p) => (
                  <div key={p.id} className="timeline-row">
                    <div
                      className={`timeline-circle ${p.unlocked ? 'unlocked' : 'locked'}`}
                      onClick={async () => {
                        const res = await resolvePointId(p);
                        if (res && res.id) navigate(`/pontos-turisticos/${res.id}`, { state: { ponto: res.obj } });
                        else navigate('/pontos-turisticos');
                      }}
                      aria-label={`${p.name} ${p.unlocked ? '' : '(bloqueado)'}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={async (e) => { if (e.key === 'Enter') { const res = await resolvePointId(p); if (res && res.id) navigate(`/pontos-turisticos/${res.id}`, { state: { ponto: res.obj } }); else navigate('/pontos-turisticos'); } }}
                    >
                      {p.image ? (
                        <img src={`/${p.image}`} alt={p.name} className="timeline-circle__img" />
                      ) : (
                        <Icon icon="mdi:map-marker" className="timeline-circle__icon" />
                      )}

                      {p.unlocked ? (
                        <span className="timeline-badge check"><Icon icon="mdi:check-bold" /></span>
                      ) : (
                        <span className="timeline-badge lock"><Icon icon="mdi:lock" /></span>
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
