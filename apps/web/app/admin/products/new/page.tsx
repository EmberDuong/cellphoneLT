import { db, brands, categories } from "@cellphonelt/db";
import NewProductForm from "./NewProductForm";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const allBrands = await db.select({ id: brands.id, name: brands.name }).from(brands);
  const allCategories = await db.select({ id: categories.id, name: categories.name }).from(categories);

  return <NewProductForm brands={allBrands} categories={allCategories} />;
}
