"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingCart, Eye, Smartphone } from "lucide-react";
import { useCart } from "@/components/storefront/CartProvider";

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
  id,
  name,
  slug,
  price,
  imageUrl,
  brand,
  isNew,
}: ProductCardProps) {
  const { addItem } = useCart();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, slug, name, price, imageUrl, brand });
  }

  return (
    <motion.div
      whileHover={{ y: -7 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: "100%" }}
    >
      <Link href={`/products/${slug}`} className="product-card" style={{ height: "100%" }}>
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
            <div className="product-image-placeholder">
              <Smartphone
                size={52}
                style={{ color: "var(--text-faint)", opacity: 0.6 }}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-info">
          {brand && <span className="product-brand">{brand}</span>}
          <h3 className="product-name">{name}</h3>
          <p className="product-price">{formatVND(price)}</p>
        </div>

        {/* Hover CTA row */}
        <div className="product-hover-cta">
          <button
            id={`add-to-cart-${id}`}
            className="product-add-btn"
            onClick={handleAddToCart}
            aria-label={`Thêm ${name} vào giỏ hàng`}
          >
            <ShoppingCart size={14} style={{ marginRight: "0.3rem" }} />
            Thêm giỏ hàng
          </button>
          <span className="product-view-btn">
            <Eye size={14} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
