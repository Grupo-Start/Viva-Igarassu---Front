import './DashboardHeader.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { authService, dashboardService } from '../../services/api';


export function DashboardHeader() {
  const [open, setOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const location = useLocation();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const navigate = useNavigate();
  const ref = useRef();
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = localStorage.getItem('user');
        if (!raw) {
          if (mounted) setCompanyName('');
          if (mounted) setIsAdminUser(false);
          return;
        }
        const user = JSON.parse(raw);
        const role = String(user.role || user.tipo || '').toLowerCase();

        if (role.includes('empreendedor')) {
          try {
            const nomeEmpresa = await dashboardService.setNomeEmpresa();
            if (mounted) setCompanyName(nomeEmpresa || user.nome_empresa || user.nome || user.name || '');
          } catch (err) {
            if (mounted) setCompanyName(user.nome_empresa || user.nome || user.name || '');
          }
        } else {
          const userName = user.nome || user.name || user.usuario || user.usuario_nome || '';
          if (mounted) setCompanyName(userName);
        }

        const isAdminFlag = user.isAdmin || user.is_admin || false;
        const adminDetected = isAdminFlag === true || role === 'adm' || role.includes('adm') || (user.role && String(user.role).toLowerCase().includes('adm'));
        if (mounted) setIsAdminUser(!!adminDetected);
      } catch (error) {
        
      }
    })();
    return () => { mounted = false; };
  }, [location.pathname]);
 

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
        {companyName && (
          <div className="header-company">
            <span>{companyName}</span>
          </div>
        )}
        {companyName && (
          <button className="company-trigger" onClick={() => setOpen(s => !s)} aria-label="Empresa">
            <img src="/icone-login.png" alt="Empresa" />
          </button>
        )}
        {isAdminUser && (
          <Link
            to="/admin-dashboard"
            className="Admin"
            aria-haspopup="true"
            onClick={(e) => {
              try {
                if (typeof window !== 'undefined' && window.innerWidth <= 520) {
                  e.preventDefault();
                  setOpen(s => !s);
                }
              } catch (err) {}
            }}
          >
            <span className="admin-label">Admin</span>
          </Link>
        )}

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
