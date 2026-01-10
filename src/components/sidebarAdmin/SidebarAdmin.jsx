import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SidebarAdmin.css";
import { LuMenu } from "react-icons/lu";

export function SidebarAdmin() {
  const [open, setOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true));
  const navigate = useNavigate();
  const location = useLocation();

  return (
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="sidebar-header">
          <h2>{open ? "Olá, Admin!" : ""}</h2>
          <button className="toggle" onClick={() => setOpen(!open)}>
            <LuMenu />
          </button>
        </div>

        <ul className="menu">
          <li 
            className={location.pathname === '/admin-dashboard' ? 'menu-active' : ''} 
            onClick={() => {
              navigate('/admin-dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {open && "Dashboard"}
          </li>
          <li 
            className={location.pathname === '/admin-dashboard/users' ? 'menu-active' : ''} 
            onClick={() => {
              navigate('/admin-dashboard/users');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {open && "Usuários"}
          </li>
          <li 
            className={location.pathname === '/admin-dashboard/empresas' ? 'menu-active' : ''} 
            onClick={() => {
              navigate('/admin-dashboard/empresas');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {open && "Empresas"}
          </li>
          <li 
            className={location.pathname === '/admin-dashboard/pontos-turisticos' ? 'menu-active' : ''} 
            onClick={() => {
              navigate('/admin-dashboard/pontos-turisticos');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {open && "Pontos Turísticos"}
          </li>
          <li 
            className={location.pathname === '/admin-dashboard/eventos' ? 'menu-active' : ''} 
            onClick={() => {
              navigate('/admin-dashboard/eventos');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {open && "Eventos"}
          </li>
          <li 
            className={location.pathname === '/admin-dashboard/recompensas' ? 'menu-active' : ''}
            onClick={() => {
              navigate('/admin-dashboard/recompensas');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {open && "Recompensas"}
          </li>
        </ul>
      </aside>
  );
}

