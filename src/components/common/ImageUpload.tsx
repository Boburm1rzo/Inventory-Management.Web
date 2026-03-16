import React, { useState, useRef } from "react";
import { Paperclip, Loader2, X } from "lucide-react";
import { uploadImage } from "../../api/images.api";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="image-upload-container">
      <style>{`
        .image-upload-container {
          margin-bottom: 1rem;
        }
        .preview-box {
          position: relative;
          width: 100%;
          height: 160px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-secondary);
          margin-bottom: 8px;
        }
        .preview-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .remove-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .upload-zone {
          border: 1.5px dashed var(--border);
          border-radius: var(--radius-md);
          padding: 12px;
          text-align: center;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 13px;
          transition: border-color 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: var(--bg-card);
        }
        .upload-zone:hover:not(.disabled) {
          border-color: var(--accent);
          color: var(--accent);
        }
        .upload-zone.disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .upload-zone.uploading {
          cursor: wait;
        }
        .error-text {
          color: var(--danger);
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>

      {value && (
        <div className="preview-box">
          <img src={value} alt="Preview" />
          {!disabled && (
            <button
              type="button"
              className="remove-btn"
              onClick={handleRemove}
              title="Remove image"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      <div
        className={`upload-zone ${disabled ? "disabled" : ""} ${
          uploading ? "uploading" : ""
        }`}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Paperclip size={20} />
            <span>Upload image</span>
            <span style={{ fontSize: "11px" }}>Max 5MB · JPEG, PNG, WebP</span>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />

      {error && <div className="error-text">{error}</div>}
    </div>
  );
};

export default ImageUpload;
