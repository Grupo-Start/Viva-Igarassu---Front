import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./sidebarusuario.css";



export function Sidebarusuario() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleResetPassword = () => {
    navigate('/alterar-senha');
  };

  return (
    <div className="layout">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="sidebar-header">
          <h2>{open ? "Olá!" : ""}</h2>
          <button className="toggle" onClick={() => setOpen(!open)}>
            ☰
          </button>
        </div>

        <ul className="menu">
          <li
            onClick={() => navigate('/usuarioDashboard')}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/usuarioDashboard'); }}
            role="button"
            tabIndex={0}
          >
            {open && " Dashboard Usuário"}
          </li>
          <li
            onClick={() => navigate('/usuarioDados')}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/usuarioDados'); }}
            role="button"
            tabIndex={0}
          >
            {open && " Meus Dados"}
          </li>
          <li
            onClick={() => navigate('/usuarioFigurinhas')}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/usuarioFigurinhas'); }}
            role="button"
            tabIndex={0}
          >
            {open && " Meu Álbum"}
          </li>
          <li
            onClick={handleResetPassword}
            onKeyDown={(e) => { if (e.key === 'Enter') handleResetPassword(); }}
            role="button"
            tabIndex={0}
          >
            {open && " Redefinir senha"}
          </li>
          <li
            onClick={handleLogout}
            onKeyDown={(e) => { if (e.key === 'Enter') handleLogout(); }}
            role="button"
            tabIndex={0}
          >
            {open && " Sair"}
          </li>
        </ul>
      </aside>

      
    </div>
  );
}