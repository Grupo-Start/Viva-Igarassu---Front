import './Header.css';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import { dashboardService } from '../../services/api';

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
    const tryAttachCompany = async () => {
      try {
        const r = localStorage.getItem('user');
        if (!r) return;
        const u = JSON.parse(r);
        
        const tipo = (u.tipo || u.role || '').toString().toLowerCase();
        const isEmpresa = u.isEmpresa || u.is_empresa || u.isCompany || 
                          tipo.includes('empresa') || tipo.includes('empreendedor');
        if (!isEmpresa) return;
        
        const hasCompany = u && (u.nome_empresa || u.empresa || u.id_empresa || u.empresa_id || (u.empresa && (u.empresa.nome_empresa || u.empresa.nome)));
        if (hasCompany) return;
        const token = localStorage.getItem('token');
        if (!token) return;
        const userId = u.id || u._id || u.id_usuario || u.usuario || u.usuario_id || null;
        const list = await dashboardService.getEmpresas();
        const arr = Array.isArray(list) ? list : (list?.data || list?.empresas || []);
        if (!arr || !arr.length) return;
        const found = arr.find(e => {
          try {
            if (userId && (String(e.id_usuario) === String(userId) || String(e.usuario) === String(userId))) return true;
            if (u.email && (String(e.email || e.contato || '') === String(u.email))) return true;
            if (u.nome_empresa && (String(e.nome_empresa || e.nome || '') === String(u.nome_empresa))) return true;
          } catch (err) {}
          return false;
        });
        if (!found) return;
        const merged = { ...u, empresa: found.id || found._id || found.id_empresa || found.empresa_id || u.empresa, id_empresa: found.id || found._id || found.id_empresa || u.id_empresa, nome_empresa: found.nome_empresa || found.nome || found.razao_social || u.nome_empresa, empresa_obj: found };
        localStorage.setItem('user', JSON.stringify(merged));
        try { window.dispatchEvent(new Event('localUserChange')); } catch(e){}
        try { setUser(merged); } catch(e){}
      } catch (e) {}
    };
    tryAttachCompany();
    const onStorage = (e) => {
      try {
        if (!e || e.key === 'user' || e.key === 'token') {
          const r = localStorage.getItem('user');
          try { setUser(r ? JSON.parse(r) : null); } catch (err) { setUser(null); }
        }
      } catch (err) {
      }
    };
    const onLocalUserChange = () => {
      try {
        const r = localStorage.getItem('user');
        try { setUser(r ? JSON.parse(r) : null); } catch (err) { setUser(null); }
      } catch (e) {}
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('localUserChange', onLocalUserChange);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('localUserChange', onLocalUserChange); };
  }, []);

  const [open, setOpen] = useState(false);
  const ref = useRef();
  const location = useLocation();
  const isHome = (location && location.pathname === '/');

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

  const getStoredUser = () => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  };

  const getUserRole = (u) => {
    const userObj = u || getStoredUser();
    if (!userObj) return 'comum';
    const tipo = (userObj.tipo || userObj.role || '').toString().toLowerCase();
    if (userObj.isAdmin || tipo.includes('admin')) return 'admin';
    const isEmpresa = userObj.isEmpresa || userObj.is_empresa || userObj.isCompany || tipo.includes('empresa') || tipo.includes('empreendedor');
    if (isEmpresa) return 'empresa';
    return 'comum';
  };

  const goToProfile = () => {
    const role = getUserRole(user);
    if (role === 'admin') navigate('/admin-dashboard');
    else if (role === 'empresa') navigate('/empresa-dashboard/meus-dados');
    else navigate('/usuarioDashboard');
    setOpen(false);
  };

  const computeDisplayName = (u) => {
    if (!u) {
      u = getStoredUser();
    }
    if (!u) return null;
    try {
      const companyName = u.nome_empresa
        || (u.empresa_obj && (u.empresa_obj.nome_empresa || u.empresa_obj.nome || u.empresa_obj.razao_social))
        || (u.empresa && (u.empresa.nome_empresa || u.empresa.nome || u.empresa.razao_social))
        || null;
      if (companyName && String(companyName).trim()) return String(companyName).trim();
    } catch (e) {}

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
  const displayName = (user && (user.nome_empresa || (user.empresa_obj && (user.empresa_obj.nome_empresa || user.empresa_obj.nome)) || (user.empresa && (user.empresa.nome_empresa || user.empresa.nome)))) || computeDisplayName(user);
  return (
    <header className="header">
      <div className="header-logo">
        <Link to="/">
          <img src="/header-logo.png" alt="logo viva igarassu" />
        </Link>
      </div>

      <nav className="header-nav">
        {(() => {
          const items = [
            { to: '/', label: 'Home' },
            { to: '/quem-somos', label: 'Quem somos' },
            { to: '/a-cidade', label: 'A cidade' },
          ];
          return items.map((it, idx) => (
            <React.Fragment key={it.to}>
              {idx > 0 && <p className="sep">|</p>}
              <NavLink to={it.to} className={({isActive}) => isActive ? 'active' : ''}>{it.label}</NavLink>
            </React.Fragment>
          ));
        })()}
      </nav>

      <div className="header-actions" ref={ref}>
        {!user ? (
          <NavLink to="/login" className={({isActive}) => isActive ? 'login active' : 'login'}>
            <span>Login</span>
            <img src="/icone-login.png" alt="Login" />
          </NavLink>
        ) : (
          <div className="user-info">
            {displayName && <div className="header-company"><span>{displayName}</span></div>}

            <button className="admin-trigger" onClick={() => setOpen(s => !s)} aria-haspopup="true" aria-expanded={open}>
              <img src="/icone-login.png" alt="Menu" />
            </button>
          </div>
        )}

        {user && (
          <>
            <button className="mobile-user-btn" onClick={() => setOpen(s => !s)} aria-haspopup="true" aria-expanded={open}>
              <img src="/icone-login.png" alt="Menu" />
            </button>

            {getUserRole(user) === 'admin' && (
              <button className="mobile-admin-btn" onClick={() => { navigate('/admin-dashboard'); setOpen(false); }} aria-label="Admin">
                <img src="/icone-login.png" alt="Admin" />
              </button>
            )}

            {open && (
              <div className="admin-menu">
                <button className="admin-menu-item" onClick={goToProfile}>Meu perfil</button>
                <button className="admin-menu-item" onClick={handleLogout}>Sair</button>
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
}

export default Header;