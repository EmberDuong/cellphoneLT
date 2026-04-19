import Link from "next/link";
import Image from "next/image";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl?: string;
  brand?: string;
  category?: string;
  isNew?: boolean;
}

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function ProductCard({
  name,
  slug,
  price,
  imageUrl,
  brand,
  isNew,
}: ProductCardProps) {
  return (
    <Link href={`/products/${slug}`} className="product-card">
      {/* Badge */}
      {isNew && <span className="product-badge">Mới</span>}

      {/* Image */}
      <div className="product-image-wrap">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="product-image"
          />
        ) : (
          <div className="product-image-placeholder">📱</div>
        )}
      </div>

      {/* Info */}
      <div className="product-info">
        {brand && <span className="product-brand">{brand}</span>}
        <h3 className="product-name">{name}</h3>
        <p className="product-price">{formatVND(price)}</p>
      </div>

      {/* Hover CTA */}
      <div className="product-hover-cta">Xem chi tiết →</div>
    </Link>
  );
}
