import { notFound } from "next/navigation";
import { db, products, eq, brands, categories } from "@cellphonelt/db";
import EditProductForm from "./EditProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const product = await db.query.products.findFirst({
    where: eq(products.id, resolvedParams.id),
  });

  if (!product) {
    notFound();
  }

  const allBrands = await db.select({ id: brands.id, name: brands.name }).from(brands);
  const allCategories = await db.select({ id: categories.id, name: categories.name }).from(categories);

  return <EditProductForm product={product} brands={allBrands} categories={allCategories} />;
}
