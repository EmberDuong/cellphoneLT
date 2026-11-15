import Link from "next/link";
import { notFound } from "next/navigation";
import { TradeInAppraisal, Customer } from "@cellphonelt/db";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import TradeInDetails from "./TradeInDetails";

export const dynamic = "force-dynamic";

export default async function AdminTradeInDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch Trade-In
  const tradeIn = await TradeInAppraisal.findOne({ _id: id }).lean();
  if (!tradeIn) return notFound();

  // 2. Fetch Customer
  const customer = await Customer.findOne({ _id: tradeIn.customerId }).select("-passwordHash").lean();

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
