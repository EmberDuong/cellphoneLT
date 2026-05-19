import { db, inventoryItems, products, eq } from "@cellphonelt/db";
import { notFound } from "next/navigation";
import EditInventoryForm from "./EditInventoryForm";

export default async function EditInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const item = await db.query.inventoryItems.findFirst({
    where: eq(inventoryItems.id, id),
  });

  if (!item) {
    return notFound();
  }

  // Lấy danh sách sản phẩm để chọn
  const productList = await db.select({
    id: products.id,
    name: products.name,
  }).from(products).orderBy(products.name);

  return <EditInventoryForm item={item} products={productList} />;
}
