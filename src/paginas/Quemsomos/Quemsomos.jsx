import "./Quemsomos.css";
import { FaStar } from "react-icons/fa";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";

export function Quemsomos() {
  return (
   <div>
   <Header/>
   

    <main className="conteudo">
           
      <section className="blocos">
        <div className="bloco-secao">
          <h2 className="titulo">
        
            O VIVA IGARASSU
              <FaStar className="estrela" />
          </h2>

          <div className="bloco">
            <p>
              O Projeto Viva Igarassu tem como objetivo promover e modernizar a
              experiência turística na cidade, conectando visitantes aos principais
              pontos históricos, culturais, religiosos e naturais de Igarassu,
              Pernambuco. Cada ponto turístico do sítio histórico contará com um QR
              Code exclusivo, permitindo que o visitante registre sua presença e
              acumule pontos, conquistas e recompensas dentro da plataforma. A
              iniciativa transforma a visitação em uma jornada interativa,
              divertida e educativa, incentivando o conhecimento da cultura local,
              o aumento do fluxo turístico e o fortalecimento da economia e da
              identidade cultural da região.
            </p>
          </div>
        </div>

        <div className="bloco-secao">
          <h2 className="titulo">
            NOSSA MISSÃO
              <FaStar className="estrela" />
          </h2>

          <div className="bloco">
            <p>
              Valorizar Igarassu como o destino histórico mais importante de
              Pernambuco, promovendo o turismo através da tecnologia e oferecendo
              aos visitantes uma experiência envolvente e acessível. Buscamos
              estimular a descoberta dos patrimônios culturais, ambientais e
              religiosos, aproximando cada pessoa da essência e da história da
              cidade.
            </p>
          </div>
        </div>

 
        <div className="bloco-secao">
          <h2 className="titulo">
          
            NOSSOS VALORES
              <FaStar className="estrela" />
          </h2>

          <div className="valores-container">
            <div className="valor-card">
              <strong>Preservação Histórica</strong>
              <p>
                Honramos a importância de Igarassu, promovendo seu acervo cultural e
                religioso.
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
                Experiência simples, intuitiva e gratuita para todos os visitantes.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
    </div>
  );
}