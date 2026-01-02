
import Footer from "../../components/footer/footer";
import "./home.css";
import { Icon } from "@iconify/react";

export function Home() {
    return (
        <div>
           
            <h1>Home</h1>
            <Footer/>
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
