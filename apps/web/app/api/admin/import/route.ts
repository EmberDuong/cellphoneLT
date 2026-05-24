import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const config = { api: { bodyParser: false } };

/**
 * POST /api/admin/import
 * Accepts multipart/form-data with field "file" (.xlsx or .csv)
 * Returns parsed rows matching CellphoneLT's import format:
 *   Product ID, Product Name, Category, Description, Price, Cost, Stock Level, Reorder Point, Image Link
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/csv",
    ];
    const isAllowed =
      allowedTypes.includes(file.type) ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls") ||
      file.name.endsWith(".csv");

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Only .xlsx, .xls, or .csv files are supported" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    // Use the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON (header row = column names)
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
      defval: "",
      raw: false,
    });

    // Normalize column names: handle case-insensitive and whitespace variations
    const normalizeKey = (k: string) =>
      k.trim().toLowerCase().replace(/\s+/g, "_");

    const rows = rawRows.map((row) => {
      const normalized: Record<string, any> = {};
      for (const [k, v] of Object.entries(row)) {
        normalized[normalizeKey(k)] = v;
      }

      return {
        productId:    normalized["product_id"]    ?? normalized["id"]           ?? "",
        productName:  normalized["product_name"]  ?? normalized["name"]         ?? "",
        category:     normalized["category"]                                     ?? "",
        description:  normalized["description"]                                  ?? "",
        price:        Number(String(normalized["price"]  ?? "0").replace(/[^0-9.]/g, "")) || 0,
        cost:         Number(String(normalized["cost"]   ?? "0").replace(/[^0-9.]/g, "")) || 0,
        stockLevel:   Number(String(normalized["stock_level"] ?? normalized["stock"] ?? "0").replace(/[^0-9.]/g, "")) || 0,
        reorderPoint: Number(String(normalized["reorder_point"] ?? "0").replace(/[^0-9.]/g, "")) || 0,
        imageLink:    normalized["image_link"]    ?? normalized["image"]         ?? "",
      };
    });

    return NextResponse.json({
      success: true,
      fileName: file.name,
      sheetName,
      totalRows: rows.length,
      rows,
    });
  } catch (err: any) {
    console.error("[import] Error parsing file:", err);
    return NextResponse.json(
      { error: "Failed to parse file: " + (err?.message ?? "Unknown error") },
      { status: 500 }
    );
  }
}
