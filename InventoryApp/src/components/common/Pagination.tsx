import React from "react";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<Props> = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Simple logic for max 5 pages display
  const getPages = () => {
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="d-flex justify-content-center mt-4 gap-2 custom-pagination">
      <button
        className="page-btn"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        &larr;
      </button>

      {getPages().map((p) => (
        <button
          key={p}
          className={`page-btn ${p === page ? "active" : ""}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        className="page-btn"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        &rarr;
      </button>

      <style>{`
        .page-btn {
          min-width: 36px; height: 36px; border-radius: var(--radius-sm); border: none;
          background: transparent; color: var(--text-secondary); font-weight: 500;
          display: inline-flex; align-items: center; justify-content: center;
          transition: var(--transition); cursor: pointer;
        }
        .page-btn:hover:not(:disabled) { background: var(--bg-secondary); color: var(--text-primary); }
        .page-btn.active { background: var(--accent); color: white; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default Pagination;
