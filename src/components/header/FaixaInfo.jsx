import React from 'react';
import './FaixaInfo.css';
import { useNavigate, useLocation } from 'react-router-dom';

export default function FaixaInfo() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location && location.pathname === '/';

  const handleTrilhaClick = () => {
    const target = document.getElementById('trilha-historico');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    else navigate('/');
  };
  const isActive = (paths) => {
    try {
      const p = location?.pathname || '';
      const h = location?.hash || '';
      for (const candidate of paths) {
        if (!candidate) continue;
        if (candidate === '/' && p === '/') return true;
        if ((candidate === '/trilha' || candidate === '/trilha/sitio-historico') && p === '/' && h.includes('trilha')) return true;
        if (p === candidate) return true;
        if (p.startsWith(candidate + '/')) return true;
        if (candidate.endsWith('/') && p.startsWith(candidate)) return true;
      }
    } catch (e) {}
    return false;
  };

  return (
    <div className={`faixa-info-component ${isHome ? 'faixa--home' : ''}`}>
      <span className="faixa-component__texto">
        <span
          className={`faixa-component__link ${isActive(['/eventspage', '/eventos']) ? 'active' : ''}`}
          onClick={() => navigate('/eventspage')}
        >
          Agenda
        </span>
        <span className="faixa-sep">|</span>
        <span
          className={`faixa-component__link ${isActive(['/pontos-turisticos', '/pontos']) ? 'active' : ''}`}
          onClick={() => navigate('/pontos-turisticos')}
        >
          Pontos Turísticos
        </span>
        <span className="faixa-sep">|</span>
        <span
          className={`faixa-component__link faixa-trilha ${isActive(['/trilha', '/trilha/sitio-historico']) ? 'active' : ''}`}
          onClick={handleTrilhaClick}
        >
          Trilha Sítio Histórico
        </span>
        <span className="faixa-sep">|</span>
        <span
          className={`faixa-component__link ${isActive(['/rewardspage', '/recompensas', '/rewards']) ? 'active' : ''}`}
          onClick={() => navigate('/rewardspage')}
        >
          Recompensas
        </span>
        
      </span>
    </div>
  );
}
