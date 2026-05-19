import { db, customers } from "@cellphonelt/db";
import NewRepairForm from "./NewRepairForm";

export const dynamic = "force-dynamic";

export default async function NewRepairPage() {
  const customerList = await db.select({
    id: customers.id,
    fullName: customers.fullName,
    phoneNumber: customers.phoneNumber,
  }).from(customers).orderBy(customers.fullName);

  return <NewRepairForm customers={customerList} />;
}
