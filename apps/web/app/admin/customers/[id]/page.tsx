import { Customer } from "@cellphonelt/db";
import { notFound } from "next/navigation";
import EditCustomerForm from "./EditCustomerForm";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await Customer.findOne({ _id: id }).select("-passwordHash").lean();

  if (!customer) {
    return notFound();
  }

  return <EditCustomerForm customer={customer} />;
}
