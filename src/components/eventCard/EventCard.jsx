import "./EventCard.css";
import { Button } from "../button/Button";
import { Icon } from '@iconify/react';

export function EventCard({ image, category, title, date, time, location, onClick }) {
  const formatDate = (d) => {
    if (!d) return '';
    try {
      if (/\d{4}-\d{2}-\d{2}T/.test(d)) {
        const [datePart] = d.split('T');
        const [y, m, day] = datePart.split('-');
        return `${day}/${m}/${y}`;
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        const [y, m, day] = d.split('-');
        return `${day}/${m}/${y}`;
      }
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) return d;
      const parsed = Date.parse(d);
      if (!isNaN(parsed)) {
        const dt = new Date(parsed);
        return dt.toLocaleDateString();
      }
      return d;
    } catch (e) { return d; }
  };

  const formatTime = (t) => {
    if (!t) return '';
    try {
      if (/^\d{2}:\d{2}(:\d{2})?$/.test(t)) return t.split(':').slice(0,2).join(':');
      if (/T.*\d{2}:\d{2}/.test(t)) {
        const timePart = t.split('T')[1];
        return timePart ? timePart.split(':').slice(0,2).join(':') : '';
      }
      const parsed = Date.parse(t);
      if (!isNaN(parsed)) {
        const dt = new Date(parsed);
        return dt.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
      }
      return t;
    } catch (e) { return t; }
  };

  const formattedDate = formatDate(date);
  const formattedTime = time ? formatTime(time) : (date && /T/.test(date) ? formatTime(date) : '');

  const monthNames = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const getMonthLabel = (d) => {
    if (!d) return '';
    try {
      let parsed = null;
      if (/^\d{4}-\d{2}-\d{2}/.test(d)) {
        parsed = new Date(d.split('T')[0] + 'T00:00:00');
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
        const [day, month, year] = d.split('/');
        parsed = new Date(`${year}-${month}-${day}T00:00:00`);
      } else {
        const t = Date.parse(d);
        if (!isNaN(t)) parsed = new Date(t);
      }
      if (parsed) return monthNames[parsed.getMonth()].charAt(0).toUpperCase() + monthNames[parsed.getMonth()].slice(1);
      return '';
    } catch (e) { return ''; }
  };
  const monthLabel = getMonthLabel(date);

  return (
    <div className="event-card">
      <div className="event-image-wrap">
        <img src={image} alt={title} className="event-image" />
        {category && <span className="event-badge">{category}</span>}
      </div>

      <div className="event-card-content">
        <h3 className="event-title">{title}</h3>
        {monthLabel && <div className="event-month">{monthLabel}</div>}
        {formattedDate && <p className="event-date">{formattedDate}</p>}
        {formattedTime && <p className="event-time">{formattedTime}</p>}
        <p className="event-location"><Icon icon="mdi:map-marker" className="loc-icon" /> {location}</p>
        <div className="event-cta"><Button onClick={onClick} text="Saiba mais" /></div>
      </div>
    </div>
  );
}

export default EventCard;
