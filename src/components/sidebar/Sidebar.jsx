import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./sidebar.css";
import { LuMenu } from "react-icons/lu";

export function Sidebar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  // Sidebar will display a static greeting; header shows company/user name
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // no dynamic company name in sidebar; keep static greeting

  return (
    <div className="layout">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="sidebar-header">
          <h2>{open ? "Olá!" : ""}</h2>
          <button className="toggle" onClick={() => setOpen(!open)}>
            <LuMenu />
          </button>
        </div>

        <ul className="menu">
          <li>
            <NavLink end to="/Empresa-Dashboard" className={({isActive}) => isActive ? 'menu-item menu-active' : 'menu-item'}>
              {open ? ' Dashboard' : 'D'}
            </NavLink>
          </li>
          <li>
            <NavLink to="/Empresa-Dashboard/MeusDados" className={({isActive}) => isActive ? 'menu-item menu-active' : 'menu-item'}>
              {open ? ' Meus dados' : 'M'}
            </NavLink>
          </li>
          <li>
            <NavLink to="/Empresa-Dashboard/RedefinirSenha" className={({isActive}) => isActive ? 'menu-item menu-active' : 'menu-item'}>
              {open ? ' Redefinir senha' : 'R'}
            </NavLink>
          </li>
          <li>
            <NavLink to="/Empresa-Dashboard/Recompensas" className={({isActive}) => isActive ? 'menu-item menu-active' : 'menu-item'}>
              {open ? ' Recompensas' : 'Re'}
            </NavLink>
          </li>
          <li>
            <NavLink to="/Empresa-Dashboard/Eventos" className={({isActive}) => isActive ? 'menu-item menu-active' : 'menu-item'}>
              {open ? ' Eventos' : 'E'}
            </NavLink>
          </li>
        </ul>
      </aside>
    </div>
  );
}