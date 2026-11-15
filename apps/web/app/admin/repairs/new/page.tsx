import { Customer } from "@cellphonelt/db";
import NewRepairForm from "./NewRepairForm";

export const dynamic = "force-dynamic";

export default async function NewRepairPage() {
  const customerList = (await Customer.find({}).select("fullName phoneNumber").sort({ fullName: 1 }).lean()).map((c) => ({
    id: c.id,
    fullName: c.fullName,
    phoneNumber: c.phoneNumber ?? null,
  }));

  return <NewRepairForm customers={customerList} />;
}
