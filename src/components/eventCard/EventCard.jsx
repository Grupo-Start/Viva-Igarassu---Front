import "./EventCard.css";
import { Button } from "../button/Button";

export function EventCard({ image, category, title, date, location, onClick }) {
  return (
    <div className="event-card">
      <img src={image} alt={title} className="event-image" />

      <div className="event-card-content">
        <span className="event-category">{category}</span>
        <h3 className="event-title">{title}</h3>
        <p className="event-date">Data: {date}</p>
        <p className="event-location">Local: {location}</p>
        <Button onClick={onClick} text="saiba mais" />
      </div>
    </div>
  );
}

export default EventCard;
