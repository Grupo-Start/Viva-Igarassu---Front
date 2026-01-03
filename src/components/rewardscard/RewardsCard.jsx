import "./RewardsCard.css";
import { Button } from "../button/Button";

export function RewardsCard({ image, title, description, value }) {
  return (
    <div className="reward-card">
      <img src={image} alt={title} className="reward-image" />
      <div className="reward-info">
        <p className="reward-value">{value} ESTELITAS</p>
        <h4>{title}</h4>
        <p>{description}</p>
        <Button text="Resgatar" />
      </div>
    </div>
  );
}
