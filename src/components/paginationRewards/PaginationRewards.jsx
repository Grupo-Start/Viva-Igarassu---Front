import "./PaginationRewards.css";

export function PaginationRewards({ currentPage = 1, totalPages = 1, onPageChange = () => {} }) {
  if (totalPages <= 1) return null;

  const handlePrev = () => { if (currentPage > 1) onPageChange(currentPage - 1); };
  const handleNext = () => { if (currentPage < totalPages) onPageChange(currentPage + 1); };

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="pagination-rewards">
      <button onClick={handlePrev} disabled={currentPage === 1}>Anterior</button>
      {pages.map((num) => (
        <button
          key={num}
          className={num === currentPage ? 'active' : ''}
          onClick={() => onPageChange(num)}
        >
          {num}
        </button>
      ))}
      <button onClick={handleNext} disabled={currentPage === totalPages}>Próximo</button>
    </div>
  );
}

export default PaginationRewards;
