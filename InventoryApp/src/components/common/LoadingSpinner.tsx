import React from "react";

interface Props {
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<Props> = ({ fullPage = false }) => {
  return (
    <div className={`spinner-container ${fullPage ? "full-page" : ""}`}>
      <div className="custom-spinner"></div>

      <style>{`
        .spinner-container { display: flex; justify-content: center; align-items: center; padding: 2rem; }
        .spinner-container.full-page { position: fixed; inset: 0; background: var(--bg-header); backdrop-filter: blur(4px); z-index: 9999; }
        .custom-spinner {
          width: 40px; height: 40px; border: 3px solid var(--accent-subtle);
          border-top-color: var(--accent); border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
