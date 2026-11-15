import { notFound } from "next/navigation";
import { Product, Brand, Category } from "@cellphonelt/db";
import EditProductForm from "./EditProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const product = await Product.findOne({ _id: resolvedParams.id }).lean();

  if (!product) {
    notFound();
  }

  const allBrands = (await Brand.find({}).select("name").lean()).map((b) => ({ id: b.id, name: b.name }));
  const allCategories = (await Category.find({}).select("name").lean()).map((c) => ({ id: c.id, name: c.name }));

  return <EditProductForm product={product} brands={allBrands} categories={allCategories} />;
}
