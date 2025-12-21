import './Header.css';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="header">
  {/* Logo */}
      <div className="header-logo">
       <img src="header-logo.png" alt="logo viva igarassu" />
      </div>

      {/* Menu */}
      <nav className="header-nav">
        <Link to="/home">Home</Link>
        <p>|</p>
        <Link to="/quem-somos">Quem somos</Link>
        <p>|</p>
        <Link to="/cidade">A cidade</Link>
        <p>|</p>
        <Link to="/contato">Contato</Link>
      </nav>

      {/* Pesquisa + Login */}
      <div className="header-actions">
        <input 
          type="text" 
          placeholder="Pesquisar" 
          className="search-input"
        />

        <Link to="/login" className="login">
          <span>Login</span>
          <img src="/icone-login.png" alt="Login" />
        </Link>
      </div>
    </header>
  );
}

export default Header;