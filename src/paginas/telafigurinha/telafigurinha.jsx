import "./Telafigurinha.css";
import escudo from "../../assets/figucoventofranciscano.png";

export function Telafigurinha() {
  return (
    <div className="parabens-container">
      <h1 className="titulo">PARABÉNS!</h1>
      <p className="subtitulo">
        Você ganhou $250 estelitas e uma figurinha exclusiva!
      </p>

      <div className="card">
        <div className="card-left">
          <img src={escudo} alt="Escudo" />
        </div>

        <div className="divisor"></div>

        <div className="card-right">
          <span className="ganhou">VOCÊ GANHOU</span>
          <span className="valor">$ 250</span>
          <span className="moeda">ESTELITAS</span>
        </div>
      </div>

      <button className="btn-album">Ver meu álbum</button>
    </div>
  );
}
