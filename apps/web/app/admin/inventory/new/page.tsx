import { db, products } from "@cellphonelt/db";
import NewInventoryForm from "./NewInventoryForm";

export const dynamic = "force-dynamic";

export default async function AdminNewInventoryPage() {
  const allProducts = await db.select({ id: products.id, name: products.name }).from(products);

  return <NewInventoryForm products={allProducts} />;
}
