
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SidebarAdmin.css";
import { LuMenu } from "react-icons/lu";

export function SidebarAdmin() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="layout">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="sidebar-header">
          <h2>{open ? "Olá, Admin!" : ""}</h2>
          <button className="toggle" onClick={() => setOpen(!open)}>
            <LuMenu />
          </button>
        </div>

        <ul className="menu">
          <li 
            className={location.pathname === '/Admin-Dashboard' ? 'menu-active' : ''} 
            onClick={() => navigate('/Admin-Dashboard')}
          >
            {open && "Dashboard"}
          </li>
          <li 
            className={location.pathname === '/Admin-Dashboard/Users' ? 'menu-active' : ''} 
            onClick={() => navigate('/Admin-Dashboard/Users')}
          >
            {open && "Usuários"}
          </li>
          <li 
            className={location.pathname === '/Admin-Dashboard/Empresas' ? 'menu-active' : ''} 
            onClick={() => navigate('/Admin-Dashboard/Empresas')}
          >
            {open && "Empresas"}
          </li>
          <li>{open && "Pontos Turísticos"}</li>
          <li>{open && "Eventos"}</li>
          <li>{open && "Recompensas"}</li>
          <li>{open && "Configurações"}</li>
        </ul>
      </aside>
    </div>
  );
}

