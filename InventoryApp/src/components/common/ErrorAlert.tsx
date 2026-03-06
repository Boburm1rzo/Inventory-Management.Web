import React, { useEffect } from "react";

interface Props {
  message: string;
  onDismiss?: () => void;
  autoDismiss?: boolean;
}

import "../../styles/ErrorAlert.css";

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
    </div>
  );
};

export default ErrorAlert;
