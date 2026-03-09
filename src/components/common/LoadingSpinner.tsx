import React from "react";

interface Props {
  fullPage?: boolean;
}

import "../../styles/LoadingSpinner.css";

const LoadingSpinner: React.FC<Props> = ({ fullPage = false }) => {
  return (
    <div className={`spinner-container ${fullPage ? "full-page" : ""}`}>
      <div className="custom-spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
