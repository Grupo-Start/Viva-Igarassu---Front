import "./PaginationRewards.css";

export function PaginationRewards() {
  return (
    <div className="pagination-rewards">
      <button>Anterior</button>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button key={num}>{num}</button>
      ))}
      <button>Próximo</button>
    </div>
  );
}
