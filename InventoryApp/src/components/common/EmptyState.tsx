import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  title?: string;
  message?: string;
}

const EmptyState: React.FC<Props> = ({ title, message }) => {
  const { t } = useTranslation();

  return (
    <div className="empty-state animate-fade-up text-center py-5">
      <div className="empty-icon-wrapper mb-3 mx-auto">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
        </svg>
      </div>
      <h3 className="empty-title h5 fw-bold mb-2">
        {title || t("common.noData", "No data available")}
      </h3>
      {message && (
        <p className="empty-message text-secondary mb-0">{message}</p>
      )}

      <style>{`
        .empty-state { padding: 4rem 2rem; }
        .empty-icon-wrapper { width: 80px; height: 80px; background: var(--bg-secondary); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        .empty-title { color: var(--text-primary); }
      `}</style>
    </div>
  );
};

export default EmptyState;
