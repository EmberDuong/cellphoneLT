import { Product } from "@cellphonelt/db";
import NewInventoryForm from "./NewInventoryForm";

export const dynamic = "force-dynamic";

export default async function AdminNewInventoryPage() {
  const allProducts = (await Product.find({}).select("name").lean()).map((p) => ({ id: p.id, name: p.name }));

  return <NewInventoryForm products={allProducts} />;
}
