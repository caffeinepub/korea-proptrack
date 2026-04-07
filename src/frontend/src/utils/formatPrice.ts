/**
 * Formats a Korean Won price in 억원 units.
 * Input is in 만원 (e.g., 120000 만원 = 12억원).
 * Output: "12.0억원", "3.5억원", "500만원"
 */
export function formatPrice(value: bigint | number): string {
  const n = typeof value === "bigint" ? Number(value) : value;
  if (n === 0) return "0원";
  const eok = n / 10000;
  if (eok >= 1) {
    // Show 1 decimal place for 억원
    return `${eok.toFixed(1)}억원`;
  }
  return `${n.toLocaleString("ko-KR")}만원`;
}

/**
 * Formats a price change value with +/- prefix.
 * Input in 만원.
 */
export function formatChange(value: bigint | number): string {
  const n = typeof value === "bigint" ? Number(value) : value;
  const abs = Math.abs(n);
  const formatted = formatPrice(abs);
  return n >= 0 ? `+${formatted}` : `-${formatted}`;
}

/**
 * Formats a percent change (stored as integer × 100, e.g. 350 = 3.50%)
 */
export function formatPercent(value: bigint | number): string {
  const n = typeof value === "bigint" ? Number(value) : value;
  const pct = (n / 100).toFixed(1);
  return n >= 0 ? `+${pct}%` : `${pct}%`;
}

/**
 * Alias for formatPercent — formats a percent change with sign.
 */
export function formatChangePercent(value: bigint | number): string {
  return formatPercent(value);
}

/**
 * Formats a YearMonth string (YYYY-MM) to Korean date format.
 */
export function formatMonth(ym: string): string {
  if (!ym) return "";
  const [year, month] = ym.split("-");
  return `${year}년 ${Number.parseInt(month, 10)}월`;
}

/**
 * Compact format for prices in 억원.
 * Input in 만원 (e.g., 120000 만원 → "12.0억").
 */
export function formatPriceCompact(value: bigint | number): string {
  const n = typeof value === "bigint" ? Number(value) : value;
  if (n === 0) return "0";
  const eok = n / 10000;
  if (eok >= 1) {
    return `${eok.toFixed(1)}억`;
  }
  return `${n.toLocaleString("ko-KR")}만`;
}
