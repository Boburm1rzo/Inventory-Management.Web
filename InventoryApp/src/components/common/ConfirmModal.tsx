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

import "../../styles/ConfirmModal.css";

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
    </div>
  );
};

export default ConfirmModal;
