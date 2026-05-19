import { db, brands, categories } from "@cellphonelt/db";
import ImportProductsClient from "./ImportProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminImportProductsPage() {
  const allBrands = await db.select({ id: brands.id, name: brands.name }).from(brands);
  const allCategories = await db.select({ id: categories.id, name: categories.name }).from(categories);

  return <ImportProductsClient brands={allBrands} categories={allCategories} />;
}
