/**
 * Vietnam Delivery Estimation Heuristics
 * Based on logistics routing from major hubs (HCMC & Hanoi).
 * Estimates include road quality, provincial distance, and carrier norms.
 */

interface DeliveryEstimate {
  minDays: number;
  maxDays: number;
  region: string;
  note: string;
}

// Normalized city name → delivery profile
const DELIVERY_MAP: Record<string, DeliveryEstimate> = {
  // ── Tier 1: Major city same-day / next-day ──────────────────────────────
  "hồ chí minh": { minDays: 1, maxDays: 1, region: "Miền Nam", note: "Nội thành HCM, giao trong ngày hoặc ngày hôm sau." },
  "hcm":         { minDays: 1, maxDays: 1, region: "Miền Nam", note: "Nội thành HCM, giao trong ngày hoặc ngày hôm sau." },
  "tp hcm":      { minDays: 1, maxDays: 1, region: "Miền Nam", note: "Nội thành HCM, giao trong ngày hoặc ngày hôm sau." },
  "sài gòn":     { minDays: 1, maxDays: 1, region: "Miền Nam", note: "Nội thành HCM, giao trong ngày hoặc ngày hôm sau." },
  "hà nội":      { minDays: 1, maxDays: 1, region: "Miền Bắc", note: "Nội thành Hà Nội, giao trong ngày hoặc ngày hôm sau." },
  "hanoi":       { minDays: 1, maxDays: 1, region: "Miền Bắc", note: "Nội thành Hà Nội, giao trong ngày hoặc ngày hôm sau." },
  "đà nẵng":     { minDays: 1, maxDays: 2, region: "Miền Trung", note: "Trung tâm miền Trung, vận chuyển nhanh." },
  "da nang":     { minDays: 1, maxDays: 2, region: "Miền Trung", note: "Trung tâm miền Trung, vận chuyển nhanh." },

  // ── Tier 2: Regional capitals (2-3 days) ──────────────────────────────
  "bình dương":  { minDays: 1, maxDays: 2, region: "Miền Nam", note: "Giáp HCM, vận chuyển nhanh." },
  "đồng nai":    { minDays: 1, maxDays: 2, region: "Miền Nam", note: "Giáp HCM, vận chuyển nhanh." },
  "long an":     { minDays: 2, maxDays: 3, region: "Miền Nam", note: "Đồng bằng Sông Cửu Long, 2-3 ngày." },
  "tiền giang":  { minDays: 2, maxDays: 3, region: "Miền Nam", note: "Đồng bằng Sông Cửu Long." },
  "cần thơ":     { minDays: 2, maxDays: 3, region: "Miền Nam", note: "Thủ phủ miền Tây, 2-3 ngày." },
  "an giang":    { minDays: 2, maxDays: 3, region: "Miền Nam", note: "Đồng bằng Sông Cửu Long." },
  "kiên giang":  { minDays: 2, maxDays: 4, region: "Miền Nam", note: "Xa trung tâm, 3-4 ngày." },
  "cà mau":      { minDays: 3, maxDays: 4, region: "Miền Nam", note: "Cực Nam, 3-4 ngày làm việc." },
  "hải phòng":   { minDays: 1, maxDays: 2, region: "Miền Bắc", note: "Cảng lớn, gần Hà Nội." },
  "quảng ninh":  { minDays: 2, maxDays: 3, region: "Miền Bắc", note: "2-3 ngày từ Hà Nội." },
  "nam định":    { minDays: 2, maxDays: 3, region: "Miền Bắc", note: "Đồng bằng Sông Hồng." },
  "thái nguyên": { minDays: 2, maxDays: 3, region: "Miền Bắc", note: "Trung du phía Bắc." },
  "bắc ninh":    { minDays: 1, maxDays: 2, region: "Miền Bắc", note: "Rất gần Hà Nội." },
  "hải dương":   { minDays: 2, maxDays: 2, region: "Miền Bắc", note: "Đồng bằng Sông Hồng." },
  "thanh hóa":   { minDays: 2, maxDays: 3, region: "Miền Bắc", note: "Bắc Trung Bộ." },
  "nghệ an":     { minDays: 2, maxDays: 3, region: "Miền Trung", note: "Bắc Trung Bộ." },
  "huế":         { minDays: 2, maxDays: 3, region: "Miền Trung", note: "Cố đô, vận chuyển ổn định." },
  "thừa thiên huế": { minDays: 2, maxDays: 3, region: "Miền Trung", note: "Bắc Trung Bộ." },
  "quảng nam":   { minDays: 2, maxDays: 3, region: "Miền Trung", note: "Nam Trung Bộ, gần Đà Nẵng." },
  "quảng ngãi":  { minDays: 2, maxDays: 3, region: "Miền Trung", note: "Nam Trung Bộ." },
  "bình định":   { minDays: 2, maxDays: 3, region: "Miền Trung", note: "Duyên hải Nam Trung Bộ." },
  "phú yên":     { minDays: 2, maxDays: 3, region: "Miền Trung", note: "Duyên hải Nam Trung Bộ." },
  "khánh hòa":   { minDays: 2, maxDays: 3, region: "Miền Trung", note: "Nha Trang — cảng lớn." },
  "nha trang":   { minDays: 2, maxDays: 3, region: "Miền Trung", note: "Thành phố biển lớn." },
  "ninh thuận":  { minDays: 3, maxDays: 4, region: "Miền Trung", note: "Duyên hải cực Nam Trung Bộ." },
  "bình thuận":  { minDays: 3, maxDays: 4, region: "Miền Trung", note: "Giao thoa Nam-Trung." },
  "gia lai":     { minDays: 3, maxDays: 4, region: "Tây Nguyên", note: "Cao nguyên, vận chuyển chậm hơn." },
  "đắk lắk":    { minDays: 3, maxDays: 4, region: "Tây Nguyên", note: "Cao nguyên trung tâm." },
  "buôn ma thuột": { minDays: 3, maxDays: 4, region: "Tây Nguyên", note: "Thủ phủ Tây Nguyên." },
  "lâm đồng":    { minDays: 2, maxDays: 3, region: "Tây Nguyên", note: "Đà Lạt — có đường cao tốc." },
  "đà lạt":      { minDays: 2, maxDays: 3, region: "Tây Nguyên", note: "Có đường cao tốc Liên Khương." },
  "kon tum":     { minDays: 3, maxDays: 5, region: "Tây Nguyên", note: "Vùng sâu Tây Nguyên, 3-5 ngày." },
  "sơn la":      { minDays: 3, maxDays: 5, region: "Miền Bắc", note: "Miền núi phía Bắc, đường khó." },
  "điện biên":   { minDays: 4, maxDays: 6, region: "Miền Bắc", note: "Vùng biên giới, cần 4-6 ngày." },
  "hà giang":    { minDays: 4, maxDays: 6, region: "Miền Bắc", note: "Cực Bắc, đường núi." },
  "lào cai":     { minDays: 3, maxDays: 4, region: "Miền Bắc", note: "Cửa khẩu, có đường cao tốc." },
  "phú quốc":   { minDays: 3, maxDays: 5, region: "Hải đảo", note: "Đảo Phú Quốc — cần vận chuyển đặc biệt." },
};

export function estimateDelivery(city: string): DeliveryEstimate & { inputCity: string } {
  const normalizedInput = city.toLowerCase().trim();

  // Exact match first
  if (DELIVERY_MAP[normalizedInput]) {
    return { ...DELIVERY_MAP[normalizedInput], inputCity: city };
  }

  // Partial match
  for (const [key, value] of Object.entries(DELIVERY_MAP)) {
    if (normalizedInput.includes(key) || key.includes(normalizedInput)) {
      return { ...value, inputCity: city };
    }
  }

  // Default fallback by region keywords
  if (normalizedInput.includes("bắc") || normalizedInput.includes("bac")) {
    return { minDays: 3, maxDays: 5, region: "Miền Bắc", note: "Tỉnh miền Bắc không xác định, ước tính 3-5 ngày.", inputCity: city };
  }
  if (normalizedInput.includes("trung") || normalizedInput.includes("trung")) {
    return { minDays: 3, maxDays: 4, region: "Miền Trung", note: "Tỉnh miền Trung không xác định, ước tính 3-4 ngày.", inputCity: city };
  }
  if (normalizedInput.includes("tây nguyên") || normalizedInput.includes("cao nguyên")) {
    return { minDays: 3, maxDays: 5, region: "Tây Nguyên", note: "Vùng Tây Nguyên, 3-5 ngày.", inputCity: city };
  }

  return { minDays: 3, maxDays: 5, region: "Không xác định", note: "Không thể xác định vùng giao hàng, ước tính 3-5 ngày an toàn.", inputCity: city };
}
