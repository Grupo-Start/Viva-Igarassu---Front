import "./Pagination.css";
import { Button } from "../button/Button";

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination">
      <Button onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} text="Anterior" />

      {pages.map((p) => (
        <Button
          key={p}
          onClick={() => onPageChange(p)}
          text={p}
        />
      ))}

      <Button onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} text="Próximo" />
    </div>
  );
}
