import "./Quemsomos.css";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import { FaLandmark, FaLightbulb, FaUniversalAccess } from 'react-icons/fa';

export function Quemsomos() {
  return (
    <>
      <Header />
      <div className="quemsomos-bg">
        <main className="conteudo">
          <div className="topo-viva">
            <span className="viva-texto">QUEM SOMOS</span>
          </div>

          <section className="quem-somos">
            <div className="texto-projeto" aria-labelledby="quem-somos-title">
              <p>
               O Viva Igarassu é uma plataforma digital criada para valorizar, 
               divulgar e fortalecer o turismo, a cultura e a história da cidade de Igarassu – PE. 
               Nosso propósito é conectar moradores, visitantes e empreendedores locais por meio de uma 
               experiência interativa, informativa e acessível.
              </p>
              <br />
              <p>
                Por meio de recursos como QR Codes, sistema de recompensas, figurinhas e moedas virtuais, 
                incentivamos a exploração consciente da cidade, promovendo o engajamento dos usuários e o 
                fortalecimento do comércio e do turismo local.
              </p>
              <br />
              <p>
                O Viva Igarassu nasce com o compromisso de preservar a história, impulsionar a economia criativa e 
                mostrar que a tecnologia pode ser uma grande aliada no desenvolvimento cultural e turístico do 
                município..
              </p>
              <br />
            </div>

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

            <div className="valores" aria-labelledby="valores-title">
              <h2>⭐ NOSSOS VALORES</h2>

              <div className="valores-cards">
                <div className="valor-card">
                  <FaLandmark className="valor-icon" aria-hidden="true" />
                  <strong>Preservação Histórica</strong>
                  <p>
                    Honramos a importância de Igarassu, promovendo seu acervo
                    cultural e religioso.
                  </p>
                </div>

                <div className="valor-card">
                  <FaLightbulb className="valor-icon" aria-hidden="true" />
                  <strong>Inovação</strong>
                  <p>
                    Unimos tradição e tecnologia para criar novas possibilidades
                    turísticas.
                  </p>
                </div>

                <div className="valor-card">
                  <FaUniversalAccess className="valor-icon" aria-hidden="true" />
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
      </div>
      <Footer />
    </>
  );
}