import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

const ConfirmModal: React.FC<Props> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isProcessing,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="custom-modal-backdrop animate-fade-in">
      <div className="custom-modal-content animate-scale-up p-4 text-center">
        <div className="modal-icon-danger mx-auto mb-3">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <h3 className="h5 fw-bold mb-2">{title}</h3>
        <p className="text-secondary mb-4">{message}</p>
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn-modal-cancel"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {t("form.cancel", "Cancel")}
          </button>
          <button
            className="btn-modal-confirm danger"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "..." : t("common.confirm", "Confirm")}
          </button>
        </div>
      </div>

      <style>{`
        .custom-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 1050; display: flex; align-items: center; justify-content: center; }
        .custom-modal-content { background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); width: 100%; max-width: 400px; border: 1px solid var(--border); }
        .modal-icon-danger { width: 48px; height: 48px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: var(--danger); display: flex; align-items: center; justify-content: center; }
        .btn-modal-cancel { background: var(--bg-secondary); color: var(--text-primary); border: none; padding: 10px 20px; border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; }
        .btn-modal-cancel:hover { background: var(--border); }
        .btn-modal-confirm { border: none; padding: 10px 20px; border-radius: var(--radius-sm); font-weight: 600; color: white; cursor: pointer; }
        .btn-modal-confirm.danger { background: var(--danger); }
        .btn-modal-confirm.danger:hover { background: #dc2626; }
        .animate-fade-in { animation: fadeIn 0.2s ease-out; }
        .animate-scale-up { animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { opacity: 0.9; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
