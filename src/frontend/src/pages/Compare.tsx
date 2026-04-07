import { PropertyType, type Region } from "@/backend.d";
import { PriceChangeIndicator } from "@/components/PriceChangeIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { useCompareRegions, useSearchRegions } from "@/hooks/useRegions";
import {
  formatMonth,
  formatPrice,
  formatPriceCompact,
} from "@/utils/formatPrice";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowUpDown,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = [
  "oklch(var(--chart-1))",
  "oklch(var(--chart-4))",
  "oklch(var(--chart-3))",
  "oklch(var(--chart-2))",
  "oklch(var(--chart-5))",
];

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: PropertyType.apartment, label: "아파트" },
  { value: PropertyType.villa, label: "빌라" },
  { value: PropertyType.land, label: "대지" },
];

const MAX_REGIONS = 5;

type SortKey = "name" | "currentPrice" | "change3m" | "change12m";
type SortDir = "asc" | "desc";

// ── Region Search Dropdown ─────────────────────────────────────────────────

function RegionSearch({
  onAdd,
  selectedIds,
  disabled,
}: {
  onAdd: (r: Region) => void;
  selectedIds: Set<string>;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 300);
  const { data: results = [] } = useSearchRegions(debouncedQuery);

  // close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={
            disabled
              ? `최대 ${MAX_REGIONS}개까지 선택 가능합니다`
              : "지역 검색 후 추가..."
          }
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pl-9 bg-secondary"
          data-ocid="compare-search-input"
        />
      </div>
      {open && results.length > 0 && !disabled && (
        <div className="absolute top-full mt-1 w-full z-50 bg-popover border border-border rounded-md shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          {results.slice(0, 8).map((r) => {
            const isSelected = selectedIds.has(r.id.toString());
            return (
              <button
                type="button"
                key={r.id.toString()}
                disabled={isSelected}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-secondary transition-colors flex items-center gap-2 disabled:opacity-40"
                onClick={() => {
                  if (!isSelected) {
                    onAdd(r);
                    setQuery("");
                    setOpen(false);
                  }
                }}
                data-ocid="compare-search-result"
              >
                <span className="font-medium text-foreground">{r.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {r.level === "province"
                    ? "시/도"
                    : r.level === "city"
                      ? "시/군/구"
                      : "동"}
                </span>
                {isSelected && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    추가됨
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Sortable column header ────────────────────────────────────────────────

function SortHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
  align = "right",
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = currentSort === sortKey;
  return (
    <th
      className={`px-4 py-3 font-medium text-xs uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors ${active ? "text-primary" : "text-muted-foreground"} text-${align}`}
      onClick={() => onSort(sortKey)}
      onKeyDown={(e: KeyboardEvent<HTMLTableCellElement>) => {
        if (e.key === "Enter" || e.key === " ") onSort(sortKey);
      }}
      data-ocid={`sort-${sortKey}`}
    >
      <span
        className={`inline-flex items-center gap-1 ${align === "right" ? "justify-end w-full" : ""}`}
      >
        {label}
        {active ? (
          currentDir === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </span>
    </th>
  );
}

// ── Change cell ───────────────────────────────────────────────────────────

function ChangeCell({ percent }: { percent: number | null }) {
  if (percent === null)
    return <span className="text-muted-foreground text-xs">—</span>;
  const isPos = percent >= 0;
  const formatted = `${isPos ? "+" : ""}${(percent / 100).toFixed(1)}%`;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${
        isPos ? "text-price-up bg-price-up" : "text-price-down bg-price-down"
      }`}
    >
      {formatted}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function Compare() {
  const navigate = useNavigate();
  // Parse initial region IDs from URL (just IDs; names loaded separately)
  const [selectedRegions, setSelectedRegions] = useState<Region[]>([]);
  const [propertyType, setPropertyType] = useState<PropertyType>(
    PropertyType.apartment,
  );
  const [sortKey, setSortKey] = useState<SortKey>("currentPrice");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Sync region IDs to URL params
  const regionIds = selectedRegions.map((r) => r.id);

  const syncToUrl = useCallback(
    (regions: Region[]) => {
      const ids = regions.map((r) => r.id.toString()).join(",");
      const params = new URLSearchParams(window.location.search);
      if (ids) {
        params.set("regions", ids);
      } else {
        params.delete("regions");
      }
      navigate({
        to: "/compare",
        search: Object.fromEntries(params.entries()),
        replace: true,
      });
    },
    [navigate],
  );

  const addRegion = useCallback(
    (r: Region) => {
      setSelectedRegions((prev) => {
        const next = [...prev, r];
        syncToUrl(next);
        return next;
      });
    },
    [syncToUrl],
  );

  const removeRegion = useCallback(
    (id: bigint) => {
      setSelectedRegions((prev) => {
        const next = prev.filter((x) => x.id !== id);
        syncToUrl(next);
        return next;
      });
    },
    [syncToUrl],
  );

  const selectedIdSet = new Set(selectedRegions.map((r) => r.id.toString()));

  const { data: prices = [], isLoading } = useCompareRegions(
    regionIds,
    propertyType,
  );

  // Sort handler
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  // Build price lookup maps per region
  const pricesByRegion = new Map<
    string,
    Array<{ month: string; price: number }>
  >();
  for (const p of prices) {
    const key = p.regionId.toString();
    if (!pricesByRegion.has(key)) pricesByRegion.set(key, []);
    pricesByRegion.get(key)!.push({
      month: p.month,
      price: Number(p.averagePrice),
    });
  }
  // Sort each array by month ascending
  for (const [, arr] of pricesByRegion) {
    arr.sort((a, b) => a.month.localeCompare(b.month));
  }

  // Build chart data grouped by month
  const monthMap = new Map<string, Record<string, number>>();
  for (const p of prices) {
    const monthKey = p.month;
    if (!monthMap.has(monthKey)) monthMap.set(monthKey, {});
    const monthData = monthMap.get(monthKey)!;
    const region = selectedRegions.find((r) => r.id === p.regionId);
    if (region) {
      monthData[region.name] = Number(p.averagePrice) / 1_0000_0000;
    }
  }
  const chartData = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, values]) => ({ month: formatMonth(month), ...values }));

  // Calculate per-region stats for comparison table
  interface RegionStats {
    region: Region;
    currentPrice: number | null;
    change3m: number | null; // percent × 100
    change12m: number | null; // percent × 100
  }

  const regionStats: RegionStats[] = selectedRegions.map((r) => {
    const arr = pricesByRegion.get(r.id.toString()) ?? [];
    if (arr.length === 0)
      return { region: r, currentPrice: null, change3m: null, change12m: null };
    const latest = arr[arr.length - 1];
    const price3ago = arr.length > 3 ? arr[arr.length - 4] : arr[0];
    const price12ago = arr.length > 12 ? arr[arr.length - 13] : arr[0];
    const change3m =
      price3ago.price > 0
        ? Math.round(
            ((latest.price - price3ago.price) / price3ago.price) * 10000,
          )
        : null;
    const change12m =
      price12ago.price > 0
        ? Math.round(
            ((latest.price - price12ago.price) / price12ago.price) * 10000,
          )
        : null;
    return {
      region: r,
      currentPrice: latest.price,
      change3m,
      change12m,
    };
  });

  const sortedStats = [...regionStats].sort((a, b) => {
    let aVal: number;
    let bVal: number;
    switch (sortKey) {
      case "name":
        return sortDir === "asc"
          ? a.region.name.localeCompare(b.region.name)
          : b.region.name.localeCompare(a.region.name);
      case "currentPrice":
        aVal = a.currentPrice ?? Number.NEGATIVE_INFINITY;
        bVal = b.currentPrice ?? Number.NEGATIVE_INFINITY;
        break;
      case "change3m":
        aVal = a.change3m ?? Number.NEGATIVE_INFINITY;
        bVal = b.change3m ?? Number.NEGATIVE_INFINITY;
        break;
      case "change12m":
        aVal = a.change12m ?? Number.NEGATIVE_INFINITY;
        bVal = b.change12m ?? Number.NEGATIVE_INFINITY;
        break;
    }
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          지역 비교
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          최대 {MAX_REGIONS}개 지역을 비교하세요
        </p>
      </div>

      {/* Controls */}
      <Card className="border-border">
        <CardContent className="pt-5 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Search + chips */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                지역 추가
              </p>
              <RegionSearch
                onAdd={addRegion}
                selectedIds={selectedIdSet}
                disabled={selectedRegions.length >= MAX_REGIONS}
              />
              {selectedRegions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {selectedRegions.map((r, i) => (
                    <span
                      key={r.id.toString()}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
                      style={{
                        borderColor: CHART_COLORS[i % CHART_COLORS.length],
                        color: CHART_COLORS[i % CHART_COLORS.length],
                        background: `${CHART_COLORS[i % CHART_COLORS.length]}18`,
                      }}
                      data-ocid="selected-region-chip"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      {r.name}
                      <button
                        type="button"
                        aria-label={`${r.name} 제거`}
                        onClick={() => removeRegion(r.id)}
                        className="hover:opacity-70 transition-opacity ml-0.5"
                        data-ocid="remove-region-chip"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Property type tabs */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                부동산 유형
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {PROPERTY_TYPES.map(({ value, label }) => (
                  <Button
                    key={value}
                    variant={propertyType === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPropertyType(value)}
                    data-ocid={`compare-type-${value}`}
                    className="text-sm"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty state */}
      {selectedRegions.length === 0 && (
        <div
          className="py-24 text-center border border-dashed border-border rounded-xl"
          data-ocid="compare-empty"
        >
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">
            지역을 선택하세요 (최대 {MAX_REGIONS}개)
          </p>
          <p className="text-sm text-muted-foreground">
            위 검색창에서 지역을 검색하여 추가하면 가격 추이를 비교할 수
            있습니다
          </p>
        </div>
      )}

      {/* Price trend chart */}
      {selectedRegions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              가격 추이 비교
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 16, left: 8, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 11,
                      fill: "oklch(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickFormatter={(v: number) =>
                      `${formatPriceCompact(v * 1_0000_0000)}`
                    }
                    tick={{
                      fontSize: 11,
                      fill: "oklch(var(--muted-foreground))",
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(var(--popover))",
                      border: "1px solid oklch(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "oklch(var(--popover-foreground))",
                      boxShadow: "0 8px 32px rgb(0 0 0 / 0.4)",
                    }}
                    formatter={(value: number, name: string) => [
                      `${formatPriceCompact(value * 1_0000_0000)}원`,
                      name,
                    ]}
                    labelStyle={{
                      color: "oklch(var(--muted-foreground))",
                      marginBottom: "4px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                  />
                  {selectedRegions.map((r, i) => (
                    <Line
                      key={r.id.toString()}
                      type="monotone"
                      dataKey={r.name}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{
                        r: 5,
                        strokeWidth: 2,
                        fill: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="h-72 flex items-center justify-center text-muted-foreground text-sm"
                data-ocid="compare-chart-empty"
              >
                데이터를 불러오는 중...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparison table */}
      {selectedRegions.length > 0 && (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">시세 비교</CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-2">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {["c1", "c2", "c3"].map((k) => (
                  <Skeleton key={k} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <SortHeader
                        label="지역"
                        sortKey="name"
                        currentSort={sortKey}
                        currentDir={sortDir}
                        onSort={handleSort}
                        align="left"
                      />
                      <SortHeader
                        label="현재가격"
                        sortKey="currentPrice"
                        currentSort={sortKey}
                        currentDir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="3개월 변화"
                        sortKey="change3m"
                        currentSort={sortKey}
                        currentDir={sortDir}
                        onSort={handleSort}
                      />
                      <SortHeader
                        label="12개월 변화"
                        sortKey="change12m"
                        currentSort={sortKey}
                        currentDir={sortDir}
                        onSort={handleSort}
                      />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStats.map((s) => {
                      // find original index for color
                      const colorIdx = selectedRegions.findIndex(
                        (r) => r.id === s.region.id,
                      );
                      return (
                        <tr
                          key={s.region.id.toString()}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                          data-ocid="compare-row"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{
                                  background:
                                    CHART_COLORS[
                                      colorIdx % CHART_COLORS.length
                                    ],
                                }}
                              />
                              <span className="font-medium text-foreground">
                                {s.region.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono tabular-nums">
                            {s.currentPrice !== null ? (
                              <span className="text-foreground">
                                {formatPrice(
                                  BigInt(Math.round(s.currentPrice)),
                                )}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <ChangeCell percent={s.change3m} />
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <ChangeCell percent={s.change12m} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
