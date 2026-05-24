"use client";

import { useState, useRef, useCallback } from "react";
import { Sparkles, Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type Props = {
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  /** Called when the draft product is created. Navigates to the edit page. */
  onJobEnqueued: (jobId: string) => void;
};

type Status =
  | "idle"
  | "uploading"       // uploading image to a temp URL (data URI preview)
  | "pending"         // waiting for Redis / BullMQ
  | "enqueued"        // job confirmed in queue
  | "error";

export default function AiGenerateZone({ brands, categories, onJobEnqueued }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [brandId, setBrandId] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // ── File handlers ──────────────────────────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Chỉ chấp nhận file ảnh (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File quá lớn. Tối đa 10 MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setPreview(dataUri);
      setImageDataUri(dataUri);
    };
    reader.readAsDataURL(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!imageDataUri) {
      setError("Vui lòng chọn ảnh sản phẩm.");
      return;
    }
    const selectedBrand = brands.find((b) => b.id === brandId)?.name ?? "";
    if (!selectedBrand) {
      setError("Vui lòng chọn thương hiệu.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setError("Vui lòng nhập giá bán hợp lệ.");
      return;
    }
    setError(null);
    setStatus("pending");

    try {
      const res = await fetch("/api/ai/generate-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imageDataUri,
          brand: selectedBrand,
          price: Number(price),
          category: category || undefined,
          adminNotes: adminNotes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }

      setStatus("enqueued");
      onJobEnqueued(data.jobId);
    } catch (err: any) {
      setStatus("error");
      setError(err.message ?? "Đã xảy ra lỗi. Thử lại sau.");
    }
  };

  const resetForm = () => {
    setPreview(null);
    setImageDataUri(null);
    setBrandId("");
    setPrice("");
    setCategory("");
    setAdminNotes("");
    setStatus("idle");
    setError(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="ai-zone">
      {/* Header */}
      <div className="ai-zone-header">
        <div className="ai-zone-badge">
          <Sparkles size={13} />
          AI Auto-Generate
        </div>
        <p className="ai-zone-sub">
          Upload ảnh sản phẩm — Gemini sẽ tự động tạo tiêu đề, mô tả SEO và thông số kỹ thuật.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`ai-drop-zone ${dragging ? "ai-drop-zone--dragging" : ""} ${preview ? "ai-drop-zone--has-preview" : ""}`}
        onClick={() => !preview && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onFileChange}
        />

        {preview ? (
          <div className="ai-preview-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="ai-preview-img" />
            <button className="ai-preview-remove" onClick={(e) => { e.stopPropagation(); resetForm(); }}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="ai-drop-placeholder">
            <div className="ai-drop-icon">
              <Upload size={24} />
            </div>
            <p className="ai-drop-text">Kéo ảnh vào đây hoặc <span>click để chọn</span></p>
            <p className="ai-drop-hint">JPG, PNG, WEBP • Tối đa 10 MB</p>
          </div>
        )}
      </div>

      {/* Form inputs */}
      <div className="form-grid-2" style={{ marginTop: "1rem" }}>
        <div className="form-group">
          <label className="form-label">Thương hiệu <span className="required-star">*</span></label>
          <select
            className="form-input"
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
          >
            <option value="">-- Chọn thương hiệu --</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Giá bán (VNĐ) <span className="required-star">*</span></label>
          <input
            type="number"
            className="form-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="1"
            placeholder="VD: 299000"
          />
        </div>
      </div>

      <div className="form-grid-2" style={{ marginTop: "0.75rem" }}>
        <div className="form-group">
          <label className="form-label">Danh mục (tuỳ chọn)</label>
          <select
            className="form-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Ghi chú cho AI (tuỳ chọn)</label>
          <input
            type="text"
            className="form-input"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="VD: Ốp lưng silicon chống sốc..."
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="form-error-block" style={{ marginTop: "0.75rem" }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* CTA */}
      <button
        className="btn-primary ai-generate-btn"
        onClick={handleSubmit}
        disabled={status === "pending" || status === "enqueued"}
        style={{ marginTop: "1.25rem", width: "100%" }}
      >
        {status === "pending" && (
          <>
            <Loader2 size={16} className="ai-spin" />
            Đang gửi vào hàng đợi AI...
          </>
        )}
        {status === "enqueued" && (
          <>
            <CheckCircle2 size={16} />
            Đã gửi! Sản phẩm nháp sẽ sẵn sàng trong ít phút.
          </>
        )}
        {(status === "idle" || status === "error") && (
          <>
            <Sparkles size={16} />
            Tạo nội dung bằng AI
          </>
        )}
      </button>

      {status === "enqueued" && (
        <p className="ai-enqueued-hint">
          Truy cập <strong>Kho hàng → Bản nháp</strong> để xem và chỉnh sửa sản phẩm.
        </p>
      )}
    </div>
  );
}
