import { useState, useEffect } from "react";
import { dashboardService } from '../../services/api';
import { NavLink, useNavigate } from "react-router-dom";
import "./sidebar.css";
import { LuMenu } from "react-icons/lu";

export function Sidebar() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;
      const u = JSON.parse(raw);
      const name = u.nome_empresa || u.nome || u.name || u.razao_social || u.empresa?.nome || u.empresa_nome || '';
      if (name) {
        setCompanyName(name || '');
        return;
      }

      // se não houver nome no user salvo, tentar buscar pela empresa vinculada ao usuário via backend
      const token = localStorage.getItem('token');
      const userId = u.id || u._id || u.usuario || u.usuario_id || u.userId;
      if (token && userId) {
        dashboardService.getEmpresas()
          .then(list => {
            const arr = Array.isArray(list) ? list : (list?.data || list?.empresas || []);
            const found = arr.find(e => {
              // checar campo id_usuario direto e variantes
              if (e.id_usuario && String(e.id_usuario) === String(userId)) return true;
              if (e.usuario && (e.usuario === userId || String(e.usuario) === String(userId))) return true;
              if (e.usuario && typeof e.usuario === 'object' && (String(e.usuario.id) === String(userId) || String(e.usuario._id) === String(userId))) return true;
              // possíveis arrays
              if (Array.isArray(e.usuarios)) {
                if (e.usuarios.some(x => String(x.id || x._id || x.usuario_id || x) === String(userId))) return true;
              }
              return false;
            });
            if (found) setCompanyName(found.nome_empresa || found.nome || found.razao_social || found.name || '');
          })
          .catch(() => {});
      }
    } catch (err) {
      // ignore
    }
  }, []);

  return (
    <div className="layout">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="sidebar-header">
          <h2>{open ? (companyName || "Olá!") : ""}</h2>
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
          {/* botão Sair removido conforme solicitado */}
        </ul>
      </aside>
    </div>
  );
}

