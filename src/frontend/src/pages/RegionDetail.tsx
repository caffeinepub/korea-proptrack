import { PropertyType } from "@/backend.d";
import { PriceChangeIndicator } from "@/components/PriceChangeIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRegionPrices, useRegions } from "@/hooks/useRegions";
import { PROPERTY_TYPE_LABELS } from "@/types";
import {
  formatMonth,
  formatPrice,
  formatPriceCompact,
} from "@/utils/formatPrice";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart3,
  ChevronRight,
  Home,
  MapPin,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PROPERTY_TYPES = [
  PropertyType.apartment,
  PropertyType.villa,
  PropertyType.land,
];
const MONTH_OPTIONS = [6, 12, 24, 36];

type TooltipPayload = {
  name: string;
  value: number;
  payload: { rawAvg: bigint; rawChange: bigint };
};

type CustomTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: TooltipPayload[];
};

function CustomTooltip({ active, label, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const rawChange = item.payload.rawChange;
  const changeNum = Number(rawChange);
  return (
    <div
      style={{
        background: "oklch(var(--card))",
        border: "1px solid oklch(var(--border))",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "12px",
        color: "oklch(var(--foreground))",
        boxShadow: "0 4px 16px oklch(0 0 0 / 0.25)",
      }}
    >
      <p
        style={{
          fontWeight: 600,
          marginBottom: 4,
          color: "oklch(var(--muted-foreground))",
        }}
      >
        {label}
      </p>
      <p style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
        {formatPrice(item.payload.rawAvg)}
      </p>
      <p
        style={{
          color:
            changeNum > 0
              ? "oklch(var(--chart-1))"
              : changeNum < 0
                ? "oklch(var(--chart-2))"
                : "oklch(var(--muted-foreground))",
          marginTop: 2,
        }}
      >
        {changeNum > 0 ? "▲" : changeNum < 0 ? "▼" : "─"}{" "}
        {changeNum !== 0
          ? `${((Math.abs(changeNum) / 100) * 1).toFixed(2)}%`
          : "변동없음"}
      </p>
    </div>
  );
}

export default function RegionDetail() {
  const { id } = useParams({ from: "/region/$id" });
  const regionId = BigInt(id);
  const [propertyType, setPropertyType] = useState<PropertyType>(
    PropertyType.apartment,
  );
  const [months, setMonths] = useState(12);

  const { data: allRegions = [], isLoading: isRegionLoading } = useRegions();
  const { data: childRegions = [], isLoading: isChildLoading } =
    useRegions(regionId);
  const { data: prices = [], isLoading: isPricesLoading } = useRegionPrices(
    regionId,
    propertyType,
    months,
  );

  const region = allRegions.find((r) => r.id === regionId);
  const parentRegion = region?.parentId
    ? allRegions.find((r) => r.id === region.parentId)
    : null;

  const sorted = [...prices].sort((a, b) => a.month.localeCompare(b.month));
  const latest = sorted[sorted.length - 1];
  const isLoading = isRegionLoading || isPricesLoading;

  // Stats calculations
  const priceValues = sorted.map((p) => Number(p.averagePrice));
  const maxPrice = priceValues.length > 0 ? Math.max(...priceValues) : 0;
  const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
  const avgChangePercent =
    sorted.length > 0
      ? sorted.reduce((acc, p) => acc + Number(p.changePercent), 0) /
        sorted.length
      : 0;

  const maxEntry = sorted.find((p) => Number(p.averagePrice) === maxPrice);
  const minEntry = sorted.find((p) => Number(p.averagePrice) === minPrice);

  // Chart data
  const chartData = sorted.map((p) => ({
    month: formatMonth(p.month),
    평균가격: Number(p.averagePrice) / 1_0000_0000,
    rawAvg: p.averagePrice,
    rawChange: p.changePercent,
  }));

  const chartMin =
    priceValues.length > 0
      ? Math.floor((minPrice / 1_0000_0000) * 0.97 * 10) / 10
      : 0;
  const chartMax =
    priceValues.length > 0
      ? Math.ceil((maxPrice / 1_0000_0000) * 1.03 * 10) / 10
      : 10;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground px-2 h-7"
            data-ocid="breadcrumb-home"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            대시보드
          </Button>
        </Link>
        {parentRegion && (
          <>
            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
            <span className="text-muted-foreground">{parentRegion.name}</span>
          </>
        )}
        <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
        <span className="text-foreground font-medium">
          {isRegionLoading ? (
            <Skeleton className="h-4 w-16 inline-block" />
          ) : (
            (region?.name ?? `지역 #${id}`)
          )}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          {isRegionLoading ? (
            <>
              <Skeleton className="h-8 w-44 mb-2" />
              <Skeleton className="h-4 w-28" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
                {region?.name ?? `지역 #${id}`}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {region?.level === "province"
                  ? "시/도"
                  : region?.level === "city"
                    ? "시/군/구"
                    : "동/읍/면"}{" "}
                · 부동산 가격 추이
              </p>
            </>
          )}
        </div>
        {latest && !isLoading && (
          <div
            className="text-right bg-card border border-border rounded-xl px-5 py-3"
            data-ocid="region-latest-price"
          >
            <p className="text-xs text-muted-foreground mb-1">
              {formatMonth(latest.month)} 평균가
            </p>
            <p className="text-2xl font-display font-bold text-foreground">
              {formatPrice(latest.averagePrice)}
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <PriceChangeIndicator
                changePercent={latest.changePercent}
                size="sm"
              />
              <span className="text-xs text-muted-foreground">전월 대비</span>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            유형
          </span>
          <div className="flex gap-1 bg-muted/30 p-0.5 rounded-lg border border-border">
            {PROPERTY_TYPES.map((pt) => (
              <button
                type="button"
                key={pt}
                onClick={() => setPropertyType(pt)}
                data-ocid={`type-filter-${pt}`}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-smooth ${
                  propertyType === pt
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {PROPERTY_TYPE_LABELS[pt]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            기간
          </span>
          <div className="flex gap-1 bg-muted/30 p-0.5 rounded-lg border border-border">
            {MONTH_OPTIONS.map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMonths(m)}
                data-ocid={`month-filter-${m}`}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-smooth ${
                  months === m
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}개월
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            평균 가격 추이
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="priceGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop
                      offset="0%"
                      stopColor="oklch(var(--primary))"
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="100%"
                      stopColor="oklch(var(--primary))"
                      stopOpacity={1}
                    />
                  </linearGradient>
                </defs>
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
                  domain={[chartMin, chartMax]}
                  tickFormatter={(v: number) =>
                    `${formatPriceCompact(v * 1_0000_0000)}`
                  }
                  tick={{
                    fontSize: 11,
                    fill: "oklch(var(--muted-foreground))",
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                />
                <ReferenceLine
                  y={
                    chartData.reduce((a, b) => a + b.평균가격, 0) /
                    chartData.length
                  }
                  stroke="oklch(var(--muted-foreground))"
                  strokeDasharray="4 3"
                  strokeOpacity={0.4}
                  label={{
                    value: "평균",
                    fill: "oklch(var(--muted-foreground))",
                    fontSize: 10,
                    position: "right",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="평균가격"
                  stroke="oklch(var(--primary))"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "oklch(var(--primary))",
                    stroke: "oklch(var(--background))",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="h-64 flex items-center justify-center text-muted-foreground text-sm"
              data-ocid="chart-empty"
            >
              선택한 조건의 데이터가 없습니다
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Row */}
      {!isLoading && sorted.length > 0 && (
        <div className="grid grid-cols-3 gap-4" data-ocid="stats-row">
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-chart-1" />
                <span className="text-xs font-medium text-muted-foreground">
                  최고가
                </span>
              </div>
              <p className="text-lg font-display font-bold text-foreground font-mono">
                {formatPrice(BigInt(maxPrice))}
              </p>
              {maxEntry && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatMonth(maxEntry.month)}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-chart-2" />
                <span className="text-xs font-medium text-muted-foreground">
                  최저가
                </span>
              </div>
              <p className="text-lg font-display font-bold text-foreground font-mono">
                {formatPrice(BigInt(minPrice))}
              </p>
              {minEntry && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatMonth(minEntry.month)}
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  월평균 변화율
                </span>
              </div>
              <p
                className={`text-lg font-display font-bold font-mono ${
                  avgChangePercent > 0
                    ? "text-chart-1"
                    : avgChangePercent < 0
                      ? "text-chart-2"
                      : "text-foreground"
                }`}
              >
                {avgChangePercent > 0 ? "+" : ""}
                {(avgChangePercent / 100).toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {months}개월 기준
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sub-regions List */}
      {(childRegions.length > 0 || isChildLoading) && (
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              하위 지역
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isChildLoading ? (
              <div className="p-4 space-y-2">
                {["s1", "s2", "s3"].map((k) => (
                  <Skeleton key={k} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {childRegions.map((child) => {
                  const childSummaryPrice = undefined; // no hook for per-child latest
                  return (
                    <Link
                      key={child.id.toString()}
                      to="/region/$id"
                      params={{ id: child.id.toString() }}
                      data-ocid="sub-region-row"
                    >
                      <div className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-smooth cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              background: "oklch(var(--primary) / 0.1)",
                            }}
                          >
                            <Home
                              className="h-4 w-4"
                              style={{ color: "oklch(var(--primary))" }}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-smooth">
                              {child.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {child.level === "province"
                                ? "시/도"
                                : child.level === "city"
                                  ? "시/군/구"
                                  : "동/읍/면"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {childSummaryPrice !== undefined && (
                            <span className="text-sm font-mono font-medium text-foreground">
                              {formatPrice(childSummaryPrice)}
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-smooth" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Monthly price table */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Home className="h-4 w-4 text-primary" />
            월별 시세
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {["t1", "t2", "t3", "t4", "t5"].map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : sorted.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    className="border-b border-border"
                    style={{ background: "oklch(var(--muted) / 0.3)" }}
                  >
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      기준월
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      평균가격
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      평당가격
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                      변동률
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...sorted].reverse().map((p) => (
                    <tr
                      key={`${p.month}-${p.propertyType}`}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      data-ocid="price-row"
                    >
                      <td className="px-4 py-3 text-foreground font-medium">
                        {formatMonth(p.month)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {formatPrice(p.averagePrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                        {formatPrice(p.pricePerSqm)}
                        <span className="text-xs ml-0.5">/㎡</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <PriceChangeIndicator
                          changePercent={p.changePercent}
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div
              className="py-12 text-center text-sm text-muted-foreground"
              data-ocid="table-empty"
            >
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
              데이터가 없습니다
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
