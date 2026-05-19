import Link from "next/link";
import { notFound } from "next/navigation";
import { db, repairTickets, customers, eq } from "@cellphonelt/db";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import RepairDetails from "./RepairDetails";

export const dynamic = "force-dynamic";

export default async function AdminRepairDetailsPage({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;

  // 1. Fetch Ticket
  const ticketArray = await db.select().from(repairTickets).where(eq(repairTickets.id, ticketId));
  if (ticketArray.length === 0) return notFound();
  const ticket = ticketArray[0];

  // 2. Fetch Customer
  const customerArray = await db.select().from(customers).where(eq(customers.id, ticket.customerId));
  const customer = customerArray.length > 0 ? customerArray[0] : null;

  return (
    <>
      <header className="admin-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/admin/repairs" style={{ color: "var(--text-muted)" }}>← Trở về</Link>
          <h1 className="admin-topbar-title">Phiếu SC #{ticket.id.substring(0, 8)}</h1>
          <StatusBadge status={ticket.priority} variant={ticket.priority === 'urgent' ? 'danger' : 'draft'} />
          <StatusBadge status={ticket.status} />
        </div>
      </header>

      <main className="admin-content" style={{ maxWidth: 1000, margin: "0 auto" }}>
        <RepairDetails ticket={ticket} customer={customer} />
      </main>
    </>
  );
}
