import { InventoryItem, Product } from "@cellphonelt/db";
import { notFound } from "next/navigation";
import EditInventoryForm from "./EditInventoryForm";

export default async function EditInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const item = await InventoryItem.findOne({ _id: id }).lean();

  if (!item) {
    return notFound();
  }

  // Lấy danh sách sản phẩm để chọn
  const productList = (await Product.find({}).select("name").sort({ name: 1 }).lean()).map((p) => ({
    id: p.id,
    name: p.name,
  }));

  return <EditInventoryForm item={item} products={productList} />;
}
