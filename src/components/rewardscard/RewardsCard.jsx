import "./RewardsCard.css";
import { Button } from "../button/Button";
import { API_BASE_URL } from "../../services/api";

function resolveImageSrc(image) {
  if (!image) return null;
  if (typeof image !== 'string') return null;
  if (image.startsWith('http') || image.startsWith('/')) return image;
  const base = String(API_BASE_URL).replace(/\/$/, '');
  const path = String(image).replace(/^\/+/, '');
  return `${base}/${path}`;
}

export function RewardsCard({ image, title, description, value }) {
  const src = resolveImageSrc(image);
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
        <Button text="Resgatar" />
      </div>
    </div>
  );
}
