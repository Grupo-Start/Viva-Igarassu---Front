import "./Telafigurinha.css";
import React from "react";
import escudo from "../../../assets/figu_covento_franciscano.png";
import figuCosmeDamiao from "../../../assets/figu_cosme_e_damiao.png";
import figuSagradoCoracao from "../../../assets/figu_sagrado_coracao.png";
import figuArtesao from "../../../assets/figu_artesao.png";
import figuBiblioteca from "../../../assets/figu_biblioteca.png";
import figuConventoFranciscano from "../../../assets/figu_covento_franciscano.png";
import figuMuseu from "../../../assets/figu_museu.png";
import figuSobrado from "../../../assets/figu_sobrado.png";
import { useNavigate, useLocation } from "react-router-dom";

export function Telafigurinha() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialReward = location?.state?.reward ?? null;
  const initialLabel = location?.state?.moeda || location?.state?.currency || 'ESTELITAS';
  const [rewardRaw, setRewardRaw] = React.useState(initialReward);
  const [rewardLabel, setRewardLabel] = React.useState(initialLabel);

  React.useEffect(() => {
    if (rewardRaw == null) {
      try {
        const raw = sessionStorage.getItem('lastReward');
        if (raw) {
          const parsed = JSON.parse(raw || '{}');
          if (parsed && typeof parsed === 'object') {
            if (parsed.reward != null) setRewardRaw(parsed.reward);
            const findValorFigurinha = (obj, seen = new Set()) => {
              if (!obj || typeof obj === 'string' || typeof obj === 'number') return null;
              if (seen.has(obj)) return null;
              seen.add(obj);
              if (typeof obj === 'object') {
                if (obj.valor_figurinha != null) return obj.valor_figurinha;
                if (obj.valor != null) return obj.valor;
                if (obj.valor_estelitas != null) return obj.valor_estelitas;
                for (const v of Object.values(obj)) {
                  const r = findValorFigurinha(v, seen);
                  if (r != null) return r;
                }
              }
              if (Array.isArray(obj)) {
                for (const it of obj) {
                  const r = findValorFigurinha(it, seen);
                  if (r != null) return r;
                }
              }
              return null;
            };

            const fromPonto = parsed.ponto ? findValorFigurinha(parsed.ponto) : null;
            if (fromPonto != null) setRewardRaw(fromPonto);

            if (parsed.moeda) setRewardLabel(parsed.moeda);
          }
        }
      } catch (e) {}
    }
  }, []);

  const formatReward = (r) => {
    if (r == null) return null;
    const s = String(r).trim();
    if (/^[0-9.,]+$/.test(s)) return '$ ' + s;
    const m = s.match(/\d+[\.,]?\d*/);
    if (m) return '$ ' + m[0];
    return s;
  };

  const rewardDisplay = formatReward(rewardRaw);
  
  const getImagemPorNome = (nome) => {
    if (!nome) return null;
    const n = nome.toLowerCase();
    const mapa = [
      ["cosme", figuCosmeDamiao],
      ["damiao", figuCosmeDamiao],
      ["sagrado", figuSagradoCoracao],
      ["coracao", figuSagradoCoracao],
      ["artes", figuArtesao],
      ["artesão", figuArtesao],
      ["biblioteca", figuBiblioteca],
      ["convento", figuConventoFranciscano],
      ["franciscano", figuConventoFranciscano],
      ["museu", figuMuseu],
      ["sobrado", figuSobrado],
      ["imperador", figuSobrado],
    ];
    for (const [key, img] of mapa) if (n.includes(key)) return img;
    return null;
  };

  const resolveFiguraImagem = () => {
    const trySources = [];
    try {
      const raw = sessionStorage.getItem('lastReward');
      if (raw) {
        const parsed = JSON.parse(raw);
        trySources.push(parsed);
        if (parsed.ponto) trySources.push(parsed.ponto);
      }
    } catch (e) {}
    if (location?.state) trySources.push(location.state);
    if (location?.state?.ponto) trySources.push(location.state.ponto);

    const extractCandidateName = (obj) => {
      if (!obj) return null;
      const keys = ['nome','name','titulo','titulo_ponto','nome_ponto','figurinha','figurinha_nome','nome_figurinha','descricao','title','label'];
      for (const k of keys) {
        const v = obj[k];
        if (v && typeof v === 'string') return v;
      }
      if (obj.recompensa && (obj.recompensa.nome || obj.recompensa.title)) return obj.recompensa.nome || obj.recompensa.title;
      if (obj.figurinha && (obj.figurinha.nome || obj.figurinha.name)) return obj.figurinha.nome || obj.figurinha.name;
      if (obj.Figurinha && (obj.Figurinha.nome || obj.Figurinha.name)) return obj.Figurinha.nome || obj.Figurinha.name;
      return null;
    };

    const deepSearchForKeyword = (obj) => {
      if (!obj) return null;
      const seen = new Set();
      const walker = (x) => {
        if (!x || typeof x === 'number') return null;
        if (seen.has(x)) return null;
        seen.add(x);
        if (typeof x === 'string') {
          const found = getImagemPorNome(x);
          if (found) return x;
          return null;
        }
        if (Array.isArray(x)) {
          for (const it of x) {
            const r = walker(it);
            if (r) return r;
          }
          return null;
        }
        if (typeof x === 'object') {
          for (const v of Object.values(x)) {
            const r = walker(v);
            if (r) return r;
          }
        }
        return null;
      };
      const res = walker(obj);
      return res;
    };

    for (const src of trySources) {
      const name = extractCandidateName(src);
      if (name) {
        const img = getImagemPorNome(name);
        if (img) return img;
      }
    }

    for (const src of trySources) {
      const foundStr = deepSearchForKeyword(src);
      if (foundStr) {
        const img = getImagemPorNome(foundStr);
        if (img) return img;
      }
    }

    return escudo;
  };

  const figuraImg = resolveFiguraImagem();

  return (
    <div className="parabens-container">
      <h1 className="titulo">PARABÉNS!</h1>
      <p className="subtitulo">
        {rewardDisplay ? `Você ganhou ${rewardDisplay} ${rewardLabel}` : 'Você ganhou uma figurinha exclusiva!'}
      </p>

      <div className="card">
        <div className="card-left">
          <img src={figuraImg} alt="Figurinha" />
        </div>

        <div className="divisor"></div>

        <div className="card-right">
          <span className="ganhou">VOCÊ GANHOU</span>
          <span className="valor">{rewardDisplay}</span>
          <span className="moeda">{rewardLabel}</span>
        </div>
      </div>

      <button className="btn-album" onClick={() => navigate('/usuarioFigurinhas')}>Ver meu álbum</button>
    </div>
  );
}
