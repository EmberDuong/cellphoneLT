import { NextResponse } from "next/server";
import { db, orders, repairTickets, inventoryItems, eq, desc, gte } from "@cellphonelt/db";

export async function GET() {
  try {
    // 1. Revenue over time (Last 7 days mock for simplicity, ideally group by day)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentOrders = await db
      .select({
        createdAt: orders.createdAt,
        totalAmount: orders.totalAmount,
      })
      .from(orders)
      .where(gte(orders.createdAt, sevenDaysAgo));

    // Aggregate revenue by date
    const revenueMap = new Map<string, { total: number, orders: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      revenueMap.set(d.toLocaleDateString("vi-VN"), { total: 0, orders: 0 });
    }
    
    let overallOrdersCount = 0;
    
    recentOrders.forEach(o => {
      overallOrdersCount++;
      const dateStr = o.createdAt.toLocaleDateString("vi-VN");
      if (revenueMap.has(dateStr)) {
        const current = revenueMap.get(dateStr)!;
        revenueMap.set(dateStr, { 
          total: current.total + Number(o.totalAmount),
          orders: current.orders + 1
        });
      }
    });

    const revenueData = Array.from(revenueMap.entries()).map(([name, data]) => ({
      name,
      total: data.total,
      orders: data.orders
    }));

    // Calculate total products sold and top selling products
    const { orderItems } = await import("@cellphonelt/db");
    const soldItems = await db.select({ quantity: orderItems.quantity, productName: orderItems.productName }).from(orderItems);
    const totalProductsSold = soldItems.reduce((acc, curr) => acc + curr.quantity, 0);

    const productSalesMap = new Map<string, number>();
    soldItems.forEach(item => {
      productSalesMap.set(item.productName, (productSalesMap.get(item.productName) || 0) + item.quantity);
    });

    const topSellingData = Array.from(productSalesMap.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 2. Repair ticket statuses
    const allRepairs = await db.select({ status: repairTickets.status }).from(repairTickets);
    const statusCounts = allRepairs.reduce((acc: any, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});
    
    const repairData = Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));

    // 3. Low stock alerts
    const lowStock = await db
      .select({
        id: inventoryItems.id,
        productId: inventoryItems.productId,
        quantity: inventoryItems.quantity,
      })
      .from(inventoryItems)
      .orderBy(inventoryItems.quantity)
      .limit(5);

    return NextResponse.json({
      revenueData,
      repairData,
      lowStock,
      totalProductsSold,
      overallOrdersCount,
      topSellingData
    });

  } catch (error) {
    console.error("Metrics Error:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
