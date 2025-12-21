// Sidebar.jsx
import { useState } from "react";
import "./sidebar.css";



export function Sidebar() {
  const [open, setOpen] = useState(true);

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
          <li>{open && " Dashboard"}</li>
          <li>{open && " Meus dados"}</li>
          <li>{open && " Redefinir senha"}</li>
          <li>{open && " Recompensas"}</li>
          <li>{open && " Eventos"}</li>
          <li>{open && " Sair"}</li>
        </ul>
      </aside>

      
    </div>
  );
}

