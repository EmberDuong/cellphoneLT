"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createProductAction } from "../actions";

export default function NewProductForm({ 
  brands, 
  categories 
}: { 
  brands: { id: string; name: string }[]; 
  categories: { id: string; name: string }[]; 
}) {
  const [state, formAction, isPending] = useActionState(createProductAction, { error: null, details: {} as any });

  return (
    <>
      <header className="admin-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/admin/products" style={{ color: "var(--text-muted)", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
            ← Trở về
          </Link>
          <h1 className="admin-topbar-title">Thêm sản phẩm mới</h1>
        </div>
      </header>

      <main className="admin-content" style={{ maxWidth: 860, margin: "0 auto" }}>
        <div className="form-card">
          <h2 className="form-card-title">
            <span style={{ fontSize: "1.1rem" }}>📦</span>
            Thông tin sản phẩm
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
                className="form-input"
                required
                placeholder="VD: iPhone 15 Pro Max 256GB"
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
                className="form-input"
                required
                pattern="^[a-z0-9-]+$"
                title="Chỉ chứa chữ thường, số và dấu gạch ngang"
                placeholder="iphone-15-pro-max-256gb"
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
                <select name="brandId" className="form-input">
                  <option value="">-- Chọn thương hiệu --</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Danh mục</label>
                <select name="categoryId" className="form-input">
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
                  className="form-input"
                  placeholder="VD: IP15PM-256-BLK"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Giá bán cơ bản (VNĐ) <span className="required-star">*</span>
                </label>
                <input
                  type="number"
                  name="basePrice"
                  className="form-input"
                  required
                  min="1"
                  placeholder="VD: 29990000"
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
              <select name="status" className="form-input">
                <option value="draft">Bản nháp (Draft)</option>
                <option value="active">Đang bán (Active)</option>
              </select>
            </div>

            {/* Submit */}
            <div style={{ paddingTop: "0.5rem", display: "flex", gap: "1rem" }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={isPending}
              >
                {isPending ? "⏳ Đang lưu..." : "✓ Lưu sản phẩm"}
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
