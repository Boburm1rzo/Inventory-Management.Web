import React, { useEffect } from "react";

interface Props {
  message: string;
  onDismiss?: () => void;
  autoDismiss?: boolean;
}

const ErrorAlert: React.FC<Props> = ({
  message,
  onDismiss,
  autoDismiss = true,
}) => {
  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timer = setTimeout(() => onDismiss(), 5000);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss]);

  return (
    <div className="custom-alert animate-slide-in" role="alert">
      <div className="d-flex align-items-center gap-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span className="fw-medium">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="btn-close-custom"
          onClick={onDismiss}
          aria-label="Close"
        >
          &times;
        </button>
      )}

      <style>{`
        .custom-alert {
          background-color: rgba(239, 68, 68, 0.1); border-left: 4px solid var(--danger);
          color: var(--danger); padding: 12px 16px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
        }
        .btn-close-custom { background: transparent; border: none; color: var(--danger); font-size: 1.5rem; line-height: 1; cursor: pointer; opacity: 0.8; }
        .btn-close-custom:hover { opacity: 1; }
        .animate-slide-in { animation: slideInTop 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default ErrorAlert;
