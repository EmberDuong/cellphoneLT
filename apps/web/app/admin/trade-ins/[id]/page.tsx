import Link from "next/link";
import { notFound } from "next/navigation";
import { db, tradeInAppraisals, customers, eq } from "@cellphonelt/db";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import TradeInDetails from "./TradeInDetails";

export const dynamic = "force-dynamic";

export default async function AdminTradeInDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch Trade-In
  const tradeInArray = await db.select().from(tradeInAppraisals).where(eq(tradeInAppraisals.id, id));
  if (tradeInArray.length === 0) return notFound();
  const tradeIn = tradeInArray[0];

  // 2. Fetch Customer
  const customerArray = await db.select().from(customers).where(eq(customers.id, tradeIn.customerId));
  const customer = customerArray.length > 0 ? customerArray[0] : null;

  return (
    <>
      <header className="admin-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/admin/trade-ins" style={{ color: "var(--text-muted)" }}>← Trở về</Link>
          <h1 className="admin-topbar-title">Định giá #{tradeIn.id.substring(0, 8)}</h1>
          <StatusBadge status={tradeIn.status} variant={tradeIn.status === 'accepted' ? 'active' : 'draft'} />
        </div>
      </header>

      <main className="admin-content" style={{ maxWidth: 1000, margin: "0 auto" }}>
        <TradeInDetails tradeIn={tradeIn} customer={customer} />
      </main>
    </>
  );
}
