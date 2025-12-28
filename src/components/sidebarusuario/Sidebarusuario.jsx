import { useState } from "react";
import "./sidebarusuario.css";



export function Sidebarusuario() {
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
          <li>{open && " Meus Dados"}</li>
          <li>{open && " Meu Álbum"}</li>
          <li>{open && " Redefinir senha"}</li>
          <li>{open && " Sair"}</li>
        </ul>
      </aside>

      
    </div>
  );
}