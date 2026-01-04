import "./RewardsCard.css";
import { Button } from "../button/Button";
import { API_BASE_URL, dashboardService } from "../../services/api";
import { useState } from "react";

function resolveImageSrc(image) {
  if (!image) return null;
  if (typeof image !== 'string') return null;
  if (image.startsWith('http')) return image;
  const base = String(API_BASE_URL).replace(/\/$/, '');
  if (image.startsWith('/')) return `${base}${image}`;
  const path = String(image).replace(/^\/+/, '');
  return `${base}/${path}`;
}

export function RewardsCard({ id, raw, image, title, description, value, onRedeemed }) {
  const src = resolveImageSrc(image);
  const [loading, setLoading] = useState(false);

  const resolveIdFromRaw = (r) => {
    if (!r) return null;
    const candidates = [
      r.id, r._id, r.id_recompensas, r.id_recompresa, r.id_recompresa, r.id_recompensa, r.idRecompensa, r.recompensaId, r.codigo, r.cod, r.code, r.uuid
    ];
    for (const c of candidates) if (c) return c;
    if (r.recompensa && typeof r.recompensa === 'object') {
      const rr = r.recompensa;
      for (const c of [rr.id, rr._id, rr.id_recompensas, rr.id_recompresa, rr.id_recompensa, rr.codigo, rr.cod]) if (c) return c;
    }
    return null;
  };

  const handleResgatar = async () => {
    let targetId = id || resolveIdFromRaw(raw);
    const fallbackPayload = {};
      if (!targetId && raw) {
        // prefer explicit id_recompensas if present (backend uses this key in some APIs)
        fallbackPayload.codigo = raw.id_recompensas || raw.id_recompresa || raw.id_recompresa || raw.codigo || raw.cod || raw.codigo_recompensa || raw.cod_recompensa || raw.slug || raw.uuid || raw._id || raw.id || undefined;
        // include nested recompensa.codigo or nested id
        if (!fallbackPayload.codigo && raw.recompensa && typeof raw.recompensa === 'object') fallbackPayload.codigo = raw.recompensa.id || raw.recompensa._id || raw.recompensa.codigo || raw.recompensa.cod;
      }

    if (!targetId && (!fallbackPayload.codigo)) {
      try {
        const pretty = JSON.stringify(raw, Object.keys(raw || {}).length ? Object.keys(raw) : ['raw'], 2);
        alert('ID da recompensa indisponível. Aqui está o objeto da recompensa (copie e cole aqui):\n\n' + pretty);
      } catch (e) {
        alert('ID da recompensa indisponível. Não foi possível serializar o objeto.');
      }
      return;
    }

    if (!window.confirm(`Deseja resgatar "${title}" por ${value} estelitas?`)) return;
    try {
      setLoading(true);
      if (targetId) {
        await dashboardService.resgatarRecompensa(targetId);
      } else {
        await dashboardService.resgatarRecompensa(undefined, fallbackPayload);
      }
      alert('Recompensa resgatada com sucesso!');
      try { if (typeof onRedeemed === 'function') onRedeemed(); } catch (e) {}
    } catch (err) {
      console.error('Falha ao resgatar recompensa', err);
      const msg = err?.response?.data?.message || err?.message || 'Erro desconhecido';
      alert('Falha ao resgatar: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reward-card">
      {src ? (
        <img src={src} alt={title} className="reward-image" />
      ) : (
        <div className="reward-no-image">Sem imagem</div>
      )}
      <div className="reward-info">
        <p className="reward-value">{value} ESTELITAS</p>
        <h4>{title}</h4>
        <p>{description}</p>
        <Button text={loading ? 'Processando...' : 'Resgatar'} onClick={handleResgatar} disabled={loading} />
      </div>
    </div>
  );
}
