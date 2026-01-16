import "./footer.css";
import { Link } from "react-router-dom";

export default function Footer({ admin = false }) {
  return (
    <footer className={`footer ${admin ? 'footer-admin' : ''}`} id="contato">
      <div className="footer-container">

            <div className="footer-logo">
              <img src="/header-logo.png" alt="logo viva igarassu" />
              </div>

        <div className="footer-links">
          <h4>Links úteis</h4>
          <Link to="/">Home</Link>
          <Link to="/quem-somos">Quem somos</Link>
          <Link to="/a-cidade">A cidade</Link>
        </div>

        <div className="footer-parceiros">
          <h4>Parceiros</h4>
          <Link to="/parceiros">Ver parceiros</Link>
          <Link to="/register-person" state={{ next: '/company-registration', role: 'empreendedor' }}>Seja parceiro</Link>
        </div>

        <div className="footer-contato">
          <h4>Contatos</h4>
          <p> <strong> Email: </strong> turismo@igarassu.pe.gov.br</p>
          <p> <strong>Telefone:</strong> (81) 91234-5678</p>
          <p> <strong>Endereço:</strong> Rua Barbosa Lima, 144 — CAT <br />
          Casa do Artesão de Igarassu Centro <br />
            CEP: 53610-213</p>
        </div>

       
      </div>

      <div className="footer-copy">
        © 2025 Viva Igarassu - Todos os direitos reservados
      </div>
    </footer>
  );
}