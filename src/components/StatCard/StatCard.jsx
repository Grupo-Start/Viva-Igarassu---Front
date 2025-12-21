import { useState } from "react"
import "./statcard.css"

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card__icon">
        {icon}
      </div>

      <div className="stat-card__content">
        <span className="stat-card__title">{title}</span>
        <strong className="stat-card__value">{value}</strong>
      </div>
    </div>
  );
}

export default StatCard;


