import "./statcard.css";

function StatCard({ title, value, icon, loading = false }) {
  const formatValue = (v) => {
    if (v === null || v === undefined) return '-';
    if (typeof v === 'number') return new Intl.NumberFormat('pt-BR').format(v);
    return v;
  };

  return (
    <div className="stat-card">
      <div className="stat-card__icon">
        {icon}
      </div>

      <div className="stat-card__content">
        <span className="stat-card__title">{title}</span>
        <strong className="stat-card__value">{loading ? '…' : formatValue(value)}</strong>
      </div>
    </div>
  );
}

export default StatCard;


