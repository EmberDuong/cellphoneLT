import { Brand, Category } from "@cellphonelt/db";
import ImportProductsClient from "./ImportProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminImportProductsPage() {
  const allBrands = (await Brand.find({}).select("name").lean()).map((b) => ({ id: b.id, name: b.name }));
  const allCategories = (await Category.find({}).select("name").lean()).map((c) => ({ id: c.id, name: c.name }));

  return <ImportProductsClient brands={allBrands} categories={allCategories} />;
}
