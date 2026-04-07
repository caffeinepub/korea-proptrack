import { PropertyType } from "@/backend.d";
import { PriceChangeIndicator } from "@/components/PriceChangeIndicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRegionSummaries, useSearchRegions } from "@/hooks/useRegions";
import { PROPERTY_TYPE_LABELS } from "@/types";
import type { RegionSummary } from "@/types";
import { formatMonth, formatPercent, formatPrice } from "@/utils/formatPrice";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowDownUp,
  Building2,
  LayoutGrid,
  List,
  MapPin,
  RefreshCw,
  Search,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const SKELETON_KEYS = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
] as const;

const PROPERTY_TYPES = [
  PropertyType.apartment,
  PropertyType.villa,
  PropertyType.land,
];

type SortKey = "price_desc" | "change_desc" | "alpha";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "price_desc", label: "가격 높은순" },
  { key: "change_desc", label: "변동률 높은순" },
  { key: "alpha", label: "가나다순" },
];

function sortSummaries(
  summaries: RegionSummary[],
  sortKey: SortKey,
): RegionSummary[] {
  return [...summaries].sort((a, b) => {
    if (sortKey === "price_desc") {
      const aP = Number(a.latestPrice?.averagePrice ?? 0n);
      const bP = Number(b.latestPrice?.averagePrice ?? 0n);
      return bP - aP;
    }
    if (sortKey === "change_desc") {
      const aC = Number(a.latestPrice?.changePercent ?? 0n);
      const bC = Number(b.latestPrice?.changePercent ?? 0n);
      return bC - aC;
    }
    return a.region.name.localeCompare(b.region.name, "ko");
  });
}

/** Returns relative time string: '방금 전', 'X분 전', 'X시간 전' */
function relativeTime(date: Date | null): string {
  if (!date) return "-";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour}시간 전`;
}

function RegionCard({ summary }: { summary: RegionSummary }) {
  const { region, latestPrice } = summary;
  return (
    <Link
      to="/region/$id"
      params={{ id: region.id.toString() }}
      data-ocid="region-card"
    >
      <Card className="h-full hover:border-primary/40 transition-smooth cursor-pointer bg-card hover:bg-card/80 group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors">
              {region.name}
            </CardTitle>
            {latestPrice && (
              <PriceChangeIndicator
                changePercent={latestPrice.changePercent}
                size="sm"
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {latestPrice ? (
            <div className="space-y-1">
              <p className="text-lg font-display font-bold text-foreground">
                {formatPrice(latestPrice.averagePrice)}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span>㎡당 {formatPrice(latestPrice.pricePerSqm)}</span>
                <span>·</span>
                <span>{formatMonth(latestPrice.month)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">데이터 없음</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function RegionCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-3 w-36" />
      </CardContent>
    </Card>
  );
}

function TopFiveBanner({ summaries }: { summaries: RegionSummary[] }) {
  const top5 = useMemo(
    () =>
      [...summaries]
        .filter((s) => s.latestPrice)
        .sort(
          (a, b) =>
            Number(b.latestPrice!.averagePrice) -
            Number(a.latestPrice!.averagePrice),
        )
        .slice(0, 5),
    [summaries],
  );
  if (top5.length === 0) return null;
  return (
    <div
      className="rounded-xl border border-border bg-card p-4"
      data-ocid="top5-banner"
    >
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-4 w-4 text-chart-3" />
        <span className="text-sm font-semibold text-foreground">
          가장 비싼 지역 TOP 5
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {top5.map((s, i) => (
          <Link
            key={s.region.id.toString()}
            to="/region/$id"
            params={{ id: s.region.id.toString() }}
            data-ocid={`top5-item-${i + 1}`}
          >
            <div className="flex items-center gap-2 bg-muted/40 hover:bg-muted/70 border border-border rounded-lg px-3 py-2 transition-smooth cursor-pointer">
              <span
                className="text-xs font-bold font-mono w-4 text-center"
                style={{
                  color:
                    i === 0
                      ? "oklch(0.8 0.15 60)"
                      : i === 1
                        ? "oklch(0.72 0.05 240)"
                        : "oklch(0.65 0.15 40)",
                }}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">
                  {s.region.name}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {formatPrice(s.latestPrice!.averagePrice)}
                </p>
              </div>
              <PriceChangeIndicator
                changePercent={s.latestPrice!.changePercent}
                size="sm"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function RegionTableRow({
  summary,
  rank,
}: { summary: RegionSummary; rank: number }) {
  const { region, latestPrice } = summary;
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/30 transition-smooth"
      data-ocid="region-table-row"
    >
      <TableCell className="w-10 text-muted-foreground text-xs font-mono">
        {rank}
      </TableCell>
      <TableCell>
        <Link
          to="/region/$id"
          params={{ id: region.id.toString() }}
          className="font-semibold text-foreground hover:text-primary transition-colors"
        >
          {region.name}
        </Link>
      </TableCell>
      <TableCell className="text-right font-mono">
        {latestPrice ? formatPrice(latestPrice.averagePrice) : "-"}
      </TableCell>
      <TableCell className="text-right">
        {latestPrice ? (
          <PriceChangeIndicator
            changePercent={latestPrice.changePercent}
            size="sm"
          />
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )}
      </TableCell>
      <TableCell className="text-right font-mono text-muted-foreground text-xs">
        {latestPrice ? `${formatPrice(latestPrice.pricePerSqm)}/㎡` : "-"}
      </TableCell>
      <TableCell className="text-right text-xs text-muted-foreground">
        {latestPrice ? formatMonth(latestPrice.month) : "-"}
      </TableCell>
    </TableRow>
  );
}

export default function Dashboard() {
  const [propertyType, setPropertyType] = useState<PropertyType>(
    PropertyType.apartment,
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortKey, setSortKey] = useState<SortKey>("price_desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [, setTick] = useState(0);

  // Tick every 30s to refresh relative time display
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const {
    data: summaries = [],
    isLoading,
    isError,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useRegionSummaries(propertyType);

  // Track last successful fetch time
  const prevDataUpdatedAt = useRef(0);
  useEffect(() => {
    if (
      dataUpdatedAt &&
      dataUpdatedAt !== prevDataUpdatedAt.current &&
      summaries.length > 0
    ) {
      prevDataUpdatedAt.current = dataUpdatedAt;
      setLastUpdated(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt, summaries.length]);

  const { data: searchResults = [], isLoading: isSearching } =
    useSearchRegions(searchQuery);

  const topRegions = summaries.filter((s) => !s.region.parentId).slice(0, 18);

  const displayRegions = useMemo(() => {
    if (searchQuery.trim().length > 0) {
      const ids = new Set(searchResults.map((r) => r.id.toString()));
      const filtered = topRegions.filter((s) =>
        ids.has(s.region.id.toString()),
      );
      return sortSummaries(
        filtered.length > 0
          ? filtered
          : topRegions.filter((s) =>
              s.region.name.includes(searchQuery.trim()),
            ),
        sortKey,
      );
    }
    return sortSummaries(topRegions, sortKey);
  }, [topRegions, searchQuery, searchResults, sortKey]);

  const avgChange =
    topRegions.length > 0
      ? topRegions.reduce(
          (sum, s) => sum + Number(s.latestPrice?.changePercent ?? 0n),
          0,
        ) / topRegions.length
      : 0;
  const risingCount = topRegions.filter(
    (s) => Number(s.latestPrice?.changePercent ?? 0n) > 0,
  ).length;
  const fallingCount = topRegions.filter(
    (s) => Number(s.latestPrice?.changePercent ?? 0n) < 0,
  ).length;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-display font-bold text-foreground">
              지역별 부동산 시세
            </h1>
            <Badge
              variant="secondary"
              className="text-xs font-normal px-2 py-0.5 opacity-70"
              data-ocid="demo-badge"
            >
              데모 데이터
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            대한민국 17개 광역시·도 부동산 가격 현황
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Freshness indicator */}
          {lastUpdated && (
            <span
              className="text-xs text-muted-foreground flex items-center gap-1"
              data-ocid="freshness-indicator"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-chart-1 animate-pulse" />
              마지막 업데이트: {relativeTime(lastUpdated)}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            data-ocid="refresh-btn"
            className="gap-1.5"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
            새로고침
          </Button>
        </div>
      </div>

      {/* Error state */}
      {isError && !isLoading && (
        <div
          className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          data-ocid="error-state"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="ml-auto text-destructive hover:text-destructive h-7 px-2"
          >
            재시도
          </Button>
        </div>
      )}

      {/* Summary stats */}
      {!isLoading && topRegions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Building2 className="h-3.5 w-3.5" />
                <span>조회 지역</span>
              </div>
              <p className="text-xl font-display font-bold">
                {topRegions.length}개
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>평균 변동률</span>
              </div>
              <p
                className={`text-xl font-display font-bold ${avgChange >= 0 ? "text-chart-1" : "text-chart-2"}`}
              >
                {`${avgChange >= 0 ? "+" : ""}${formatPercent(Math.round(avgChange))}`}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>상승 지역</span>
              </div>
              <p className="text-xl font-display font-bold text-chart-1">
                {risingCount}개
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>하락 지역</span>
              </div>
              <p className="text-xl font-display font-bold text-chart-2">
                {fallingCount}개
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top 5 Banner */}
      {!isLoading && <TopFiveBanner summaries={topRegions} />}

      {/* Toolbar: property type filter + search + sort + view toggle */}
      <div className="space-y-3">
        {/* Property type tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">부동산 유형:</span>
          <div className="flex gap-1.5">
            {PROPERTY_TYPES.map((pt) => (
              <button
                type="button"
                key={pt}
                onClick={() => setPropertyType(pt)}
                data-ocid={`filter-${pt}`}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-smooth border ${
                  propertyType === pt
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {PROPERTY_TYPE_LABELS[pt]}
              </button>
            ))}
          </div>
          <Link to="/compare" className="ml-auto">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-secondary transition-colors gap-1"
            >
              <TrendingUp className="h-3 w-3" />
              지역 비교하기
            </Badge>
          </Link>
        </div>

        {/* Search + sort + view */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="지역 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9 text-sm bg-card"
              data-ocid="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="검색 지우기"
                data-ocid="search-clear"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="flex gap-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => setSortKey(opt.key)}
                  data-ocid={`sort-${opt.key}`}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-smooth border ${
                    sortKey === opt.key
                      ? "bg-secondary text-secondary-foreground border-border"
                      : "bg-transparent text-muted-foreground border-transparent hover:border-border hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-muted/40 rounded-lg p-1 border border-border ml-auto">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              data-ocid="view-grid"
              className={`p-1.5 rounded transition-smooth ${
                viewMode === "grid"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="카드 보기"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              data-ocid="view-list"
              className={`p-1.5 rounded transition-smooth ${
                viewMode === "list"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="목록 보기"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search result count */}
        {searchQuery.trim().length > 0 && !isSearching && (
          <p
            className="text-xs text-muted-foreground"
            data-ocid="search-result-count"
          >
            <span className="text-foreground font-medium">
              {displayRegions.length}개
            </span>{" "}
            지역 검색됨
          </p>
        )}
      </div>

      {/* Region grid or list */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {isLoading ? (
            SKELETON_KEYS.map((k) => <RegionCardSkeleton key={k} />)
          ) : displayRegions.length > 0 ? (
            displayRegions.map((summary) => (
              <RegionCard
                key={summary.region.id.toString()}
                summary={summary}
              />
            ))
          ) : (
            <div
              className="col-span-full py-16 text-center"
              data-ocid="empty-state"
            >
              <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                {searchQuery
                  ? `'${searchQuery}'에 대한 검색 결과가 없습니다`
                  : "데이터를 불러오는 중입니다..."}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div
          className="rounded-xl border border-border overflow-hidden bg-card"
          data-ocid="region-table"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-10 text-xs">#</TableHead>
                <TableHead className="text-xs">지역명</TableHead>
                <TableHead className="text-right text-xs">평균 가격</TableHead>
                <TableHead className="text-right text-xs">전월 대비</TableHead>
                <TableHead className="text-right text-xs">㎡당 가격</TableHead>
                <TableHead className="text-right text-xs">기준월</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_row, i) => (
                  <TableRow key={`skeleton-row-${i + 1}`}>
                    {["c1", "c2", "c3", "c4", "c5", "c6"].map((col) => (
                      <TableCell key={col}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : displayRegions.length > 0 ? (
                displayRegions.map((summary, i) => (
                  <RegionTableRow
                    key={summary.region.id.toString()}
                    summary={summary}
                    rank={i + 1}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-16 text-center"
                    data-ocid="empty-state"
                  >
                    <Building2 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">
                      {searchQuery
                        ? `'${searchQuery}'에 대한 검색 결과가 없습니다`
                        : "데이터가 없습니다"}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
