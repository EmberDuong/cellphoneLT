"use client";

import { useCart } from "@/components/storefront/CartProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AddToCartButtonsProps {
  productId: string;
  productSlug: string;
  productName: string;
  productPrice: number;
  productBrand?: string;
}

export function AddToCartButtons({ productId, productSlug, productName, productPrice, productBrand }: AddToCartButtonsProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addItem({ id: productId, slug: productSlug, name: productName, price: productPrice, brand: productBrand });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addItem({ id: productId, slug: productSlug, name: productName, price: productPrice, brand: productBrand });
    router.push("/checkout");
  }

  return (
    <div style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem" }}>
      <button
        id="add-to-cart-detail-btn"
        className="btn-primary"
        style={{ flex: 1, padding: "1rem" }}
        onClick={handleAddToCart}
      >
        {added ? "✓ Đã thêm!" : "🛒 Thêm vào giỏ hàng"}
      </button>
      <button
        id="buy-now-btn"
        className="btn-outline"
        style={{ flex: 1, padding: "1rem" }}
        onClick={handleBuyNow}
      >
        Mua ngay
      </button>
    </div>
  );
}
