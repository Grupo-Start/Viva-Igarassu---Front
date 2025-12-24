import './DashboardHeader.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { authService } from '../../services/api';

export function DashboardHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="header">

      <div className="header-logo">
        <img src="/header-logo.png" alt="logo viva igarassu" />
      </div>

      <div className="header-actions" ref={ref}>
        <Link to="/Admin-Dashboard" className="Admin">
          <span>Admin</span>
        </Link>

        <button className="admin-trigger" onClick={() => setOpen(s => !s)} aria-haspopup="true" aria-expanded={open}>
          <img src="/icone-login.png" alt="Admin" />
        </button>

        {open && (
          <div className="admin-menu">
            <button className="admin-menu-item" onClick={handleLogout}>Sair</button>
          </div>
        )}
      </div>

    </header>
  );
}
