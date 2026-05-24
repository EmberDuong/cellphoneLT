"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updateProductAction } from "../../actions";
import { Sparkles, Tag, ListChecks, Settings2, CheckCircle2 } from "lucide-react";

type AiSpec = {
  seoTitle?: string;
  metaDescription?: string;
  description?: string;
  features?: string[];
  specs?: { label: string; value: string }[];
  tags?: string[];
  compatibleModels?: string[];
  colors?: string[];
  material?: string;
};

export default function EditProductForm({ 
  product, 
  brands, 
  categories 
}: { 
  product: any;
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}) {
  const updateActionWithId = updateProductAction.bind(null, product.id);
  const [state, formAction, isPending] = useActionState(updateActionWithId, { error: null, details: {} as any });

  const aiSpecs: AiSpec | null = product.aiSpecs ?? null;
  const isDraft = product.status === "draft";

  return (
    <>
      <header className="admin-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/admin/products" style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            ← Trở về
          </Link>
          <h1 className="admin-topbar-title">Sửa sản phẩm</h1>
        </div>
        {isDraft && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.9rem", borderRadius: "99px", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b", fontSize: "0.8rem", fontWeight: 600 }}>
            <Sparkles size={13} />
            Bản nháp AI
          </div>
        )}
      </header>

      <main className="admin-content" style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* ── AI Specs Review Panel (only for AI-generated drafts) ─────────── */}
        {isDraft && aiSpecs && (
          <div className="ai-specs-panel">
            <div className="ai-specs-panel-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles size={16} style={{ color: "var(--primary)" }} />
                <span style={{ fontWeight: 700, fontSize: "1rem" }}>Nội dung AI đã tạo</span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                Kiểm tra và chỉnh sửa bên dưới, sau đó đổi trạng thái sang <strong>Đang bán</strong> để xuất bản.
              </p>
            </div>

            <div className="ai-specs-grid">
              {/* SEO */}
              <div className="ai-specs-block">
                <div className="ai-specs-block-title">
                  <CheckCircle2 size={13} /> SEO Title
                </div>
                <p className="ai-specs-value">{aiSpecs.seoTitle}</p>
              </div>

              <div className="ai-specs-block">
                <div className="ai-specs-block-title">
                  <CheckCircle2 size={13} /> Meta Description
                </div>
                <p className="ai-specs-value">{aiSpecs.metaDescription}</p>
              </div>

              {/* Description */}
              {aiSpecs.description && (
                <div className="ai-specs-block ai-specs-block--full">
                  <div className="ai-specs-block-title">
                    <ListChecks size={13} /> Mô tả sản phẩm
                  </div>
                  <p className="ai-specs-value" style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                    {aiSpecs.description}
                  </p>
                </div>
              )}

              {/* Features */}
              {aiSpecs.features && aiSpecs.features.length > 0 && (
                <div className="ai-specs-block">
                  <div className="ai-specs-block-title">
                    <CheckCircle2 size={13} /> Điểm nổi bật
                  </div>
                  <ul className="ai-specs-list">
                    {aiSpecs.features.map((f, i) => (
                      <li key={i}>✓ {f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specs table */}
              {aiSpecs.specs && aiSpecs.specs.length > 0 && (
                <div className="ai-specs-block">
                  <div className="ai-specs-block-title">
                    <Settings2 size={13} /> Thông số kỹ thuật
                  </div>
                  <div className="ai-specs-table">
                    {aiSpecs.specs.map((s, i) => (
                      <div key={i} className="ai-specs-table-row">
                        <span className="ai-specs-table-label">{s.label}</span>
                        <span className="ai-specs-table-value">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {aiSpecs.tags && aiSpecs.tags.length > 0 && (
                <div className="ai-specs-block ai-specs-block--full">
                  <div className="ai-specs-block-title">
                    <Tag size={13} /> Tags SEO
                  </div>
                  <div className="ai-specs-tags">
                    {aiSpecs.tags.map((tag, i) => (
                      <span key={i} className="ai-tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Compatible models */}
              {aiSpecs.compatibleModels && aiSpecs.compatibleModels.length > 0 && (
                <div className="ai-specs-block ai-specs-block--full">
                  <div className="ai-specs-block-title">
                    <CheckCircle2 size={13} /> Tương thích với
                  </div>
                  <div className="ai-specs-tags">
                    {aiSpecs.compatibleModels.map((m, i) => (
                      <span key={i} className="ai-tag ai-tag--compat">{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Edit Form ─────────────────────────────────────────────────────── */}
        <div className="form-card">
          <h2 className="form-card-title">
            <span style={{ fontSize: "1.1rem" }}>✏️</span>
            Chỉnh sửa thông tin sản phẩm
          </h2>

          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {state?.error && (
              <div className="form-error-block">
                ⚠️ {state.error}
              </div>
            )}

            {/* Product Name */}
            <div className="form-group">
              <label className="form-label">
                Tên sản phẩm <span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="name"
                defaultValue={product.name}
                className="form-input"
                required
              />
              {state?.details?.name && (
                <p className="form-field-error">⚠ {state.details.name[0]}</p>
              )}
            </div>

            {/* Slug */}
            <div className="form-group">
              <label className="form-label">
                Slug (Đường dẫn URL) <span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="slug"
                defaultValue={product.slug}
                className="form-input"
                required
                pattern="^[a-z0-9-]+$"
                title="Chỉ chứa chữ thường, số và dấu gạch ngang"
              />
              <p className="form-hint">Chỉ chữ thường, số và dấu gạch ngang (-).</p>
              {state?.details?.slug && (
                <p className="form-field-error">⚠ {state.details.slug[0]}</p>
              )}
            </div>

            {/* Brand + Category */}
            <div className="form-section-label">Phân loại</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Thương hiệu</label>
                <select name="brandId" defaultValue={product.brandId || ""} className="form-input">
                  <option value="">-- Chọn thương hiệu --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Danh mục</label>
                <select name="categoryId" defaultValue={product.categoryId || ""} className="form-input">
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SKU + Base Price */}
            <div className="form-section-label">Giá &amp; Mã hàng</div>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Mã SKU</label>
                <input
                  type="text"
                  name="sku"
                  defaultValue={product.sku || ""}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Giá bán cơ bản (VNĐ) <span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  name="basePrice"
                  defaultValue={Number(product.basePrice)}
                  className="form-input"
                  required
                  min="1"
                />
                {state?.details?.basePrice && (
                  <p className="form-field-error">⚠ {state.details.basePrice[0]}</p>
                )}
              </div>
            </div>

            {/* Min + Max Price */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Giá tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  name="minPrice"
                  defaultValue={product.minPrice ? Number(product.minPrice) : ""}
                  className="form-input"
                  min="1"
                  placeholder="Tuỳ chọn"
                />
                {state?.details?.minPrice && (
                  <p className="form-field-error">⚠ {state.details.minPrice[0]}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Giá tối đa (VNĐ)</label>
                <input
                  type="number"
                  name="maxPrice"
                  defaultValue={product.maxPrice ? Number(product.maxPrice) : ""}
                  className="form-input"
                  min="1"
                  placeholder="Tuỳ chọn"
                />
                {state?.details?.maxPrice && (
                  <p className="form-field-error">⚠ {state.details.maxPrice[0]}</p>
                )}
              </div>
            </div>

            {/* Images */}
            <div className="form-section-label">Hình ảnh &amp; Trạng thái</div>
            <div className="form-group">
              <label className="form-label">Ảnh sản phẩm (URL, cách nhau bằng dấu phẩy)</label>
              <input
                type="text"
                name="images"
                defaultValue={(product.images || []).join(", ")}
                className="form-input"
                placeholder="https://domain.com/img1.jpg, https://domain.com/img2.jpg"
              />
              {state?.details?.images && (
                <p className="form-field-error">⚠ {state.details.images[0]}</p>
              )}
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Trạng thái</label>
              <select name="status" defaultValue={product.status} className="form-input">
                <option value="draft">Bản nháp (Draft)</option>
                <option value="active">Đang bán (Active)</option>
                <option value="archived">Đã lưu trữ (Archived)</option>
              </select>
              {isDraft && (
                <p className="form-hint" style={{ color: "var(--warning)" }}>
                  💡 Chọn <strong>Đang bán</strong> để xuất bản sản phẩm AI này lên storefront.
                </p>
              )}
            </div>

            {/* Submit */}
            <div style={{ paddingTop: "0.5rem", display: "flex", gap: "1rem" }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={isPending}
              >
                {isPending ? "⏳ Đang lưu..." : isDraft ? "✓ Lưu & Xuất bản" : "✓ Lưu thay đổi"}
              </button>
              <Link
                href="/admin/products"
                className="btn-outline"
                style={{ padding: "0.85rem 1.5rem" }}
              >
                Huỷ
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
