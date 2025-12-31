import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';

export function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const raw = localStorage.getItem('user');
    try {
      setUser(raw ? JSON.parse(raw) : null);
    } catch (e) {
      setUser(null);
    }

    const onStorage = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        const r = localStorage.getItem('user');
        try { setUser(r ? JSON.parse(r) : null); } catch (err) { setUser(null); }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const [open, setOpen] = useState(false);
  const ref = useRef();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const computeDisplayName = (u) => {
    if (!u) return null;
    const candidates = [
      u.nome,
      u.nome_completo,
      u.fullName,
      u.firstName,
      u.name,
      u.usuario_nome,
      u.username,
      u.apelido,
      u.nome_usuario,
      u.nome_empresa,
      u.email,
    ];
    for (const c of candidates) {
      if (c && String(c).trim()) return String(c).trim();
    }
    if (u.email && typeof u.email === 'string') {
      return u.email.split('@')[0];
    }
    return null;
  };
  const displayName = computeDisplayName(user);

  return (
    <header className="header">
      <div className="header-logo">
       <img src="header-logo.png" alt="logo viva igarassu" />
      </div>

      <nav className="header-nav">
        <Link to="/home">Home</Link>
        <p>|</p>
        <Link to="/quem-somos">Quem somos</Link>
        <p>|</p>
        <Link to="/cidade">A cidade</Link>
        <p>|</p>
        <Link to="/contato">Contato</Link>
      </nav>

      <div className="header-actions">
        <input 
          type="text" 
          placeholder="Pesquisar" 
          className="search-input"
        />

        {!user ? (
          <Link to="/login" className="login">
            <span>Login</span>
            <img src="/icone-login.png" alt="Login" />
          </Link>
        ) : (
          <div className="user-info" ref={ref}>
            {displayName && <div className="header-company"><span>{displayName}</span></div>}

            <button className="admin-trigger" onClick={() => setOpen(s => !s)} aria-haspopup="true" aria-expanded={open}>
              <img src="/icone-login.png" alt="Menu" />
            </button>

            {open && (
              <div className="admin-menu">
                <button className="admin-menu-item" onClick={handleLogout}>Sair</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;