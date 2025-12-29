import "./footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

            <div className="footer-logo">
            <img src="header-logo.png" alt="logo viva igarassu" />
        </div>

        <div className="footer-links">
          <h4>Links úteis</h4>
          <a href="#">Home</a>
          <a href="#">Quem somos</a>
          <a href="#">A cidade</a>
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