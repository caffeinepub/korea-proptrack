import { c as createLucideIcon, e as useParams, r as reactExports, f as useRegions, g as useRegionPrices, j as jsxRuntimeExports, L as Link, d as Skeleton, C as ChartColumn, H as House } from "./index-BD9zk2uI.js";
import { P as PropertyType, e as formatMonth, B as Button, b as formatPrice, C as Card, c as CardHeader, d as CardTitle, a as CardContent, g as formatPriceCompact } from "./card-B2PrueAY.js";
import { M as MapPin, a as PriceChangeIndicator, P as PROPERTY_TYPE_LABELS, T as TrendingUp, b as TrendingDown } from "./types-BvVQkRH0.js";
import { R as ResponsiveContainer, L as LineChart, C as CartesianGrid, X as XAxis, Y as YAxis, a as ReferenceLine, T as Tooltip, b as Line } from "./LineChart-ChNa4q-f.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "m12 19-7-7 7-7", key: "1l729n" }],
  ["path", { d: "M19 12H5", key: "x3x0zl" }]
];
const ArrowLeft = createLucideIcon("arrow-left", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode);
const PROPERTY_TYPES = [
  PropertyType.apartment,
  PropertyType.villa,
  PropertyType.land
];
const MONTH_OPTIONS = [6, 12, 24, 36];
function CustomTooltip({ active, label, payload }) {
  if (!active || !(payload == null ? void 0 : payload.length)) return null;
  const item = payload[0];
  const rawChange = item.payload.rawChange;
  const changeNum = Number(rawChange);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      style: {
        background: "oklch(var(--card))",
        border: "1px solid oklch(var(--border))",
        borderRadius: "8px",
        padding: "10px 14px",
        fontSize: "12px",
        color: "oklch(var(--foreground))",
        boxShadow: "0 4px 16px oklch(0 0 0 / 0.25)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            style: {
              fontWeight: 600,
              marginBottom: 4,
              color: "oklch(var(--muted-foreground))"
            },
            children: label
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontFamily: "var(--font-mono)", fontWeight: 600 }, children: formatPrice(item.payload.rawAvg) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "p",
          {
            style: {
              color: changeNum > 0 ? "oklch(var(--chart-1))" : changeNum < 0 ? "oklch(var(--chart-2))" : "oklch(var(--muted-foreground))",
              marginTop: 2
            },
            children: [
              changeNum > 0 ? "▲" : changeNum < 0 ? "▼" : "─",
              " ",
              changeNum !== 0 ? `${(Math.abs(changeNum) / 100 * 1).toFixed(2)}%` : "변동없음"
            ]
          }
        )
      ]
    }
  );
}
function RegionDetail() {
  const { id } = useParams({ from: "/region/$id" });
  const regionId = BigInt(id);
  const [propertyType, setPropertyType] = reactExports.useState(
    PropertyType.apartment
  );
  const [months, setMonths] = reactExports.useState(12);
  const { data: allRegions = [], isLoading: isRegionLoading } = useRegions();
  const { data: childRegions = [], isLoading: isChildLoading } = useRegions(regionId);
  const { data: prices = [], isLoading: isPricesLoading } = useRegionPrices(
    regionId,
    propertyType,
    months
  );
  const region = allRegions.find((r) => r.id === regionId);
  const parentRegion = (region == null ? void 0 : region.parentId) ? allRegions.find((r) => r.id === region.parentId) : null;
  const sorted = [...prices].sort((a, b) => a.month.localeCompare(b.month));
  const latest = sorted[sorted.length - 1];
  const isLoading = isRegionLoading || isPricesLoading;
  const priceValues = sorted.map((p) => Number(p.averagePrice));
  const maxPrice = priceValues.length > 0 ? Math.max(...priceValues) : 0;
  const minPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
  const avgChangePercent = sorted.length > 0 ? sorted.reduce((acc, p) => acc + Number(p.changePercent), 0) / sorted.length : 0;
  const maxEntry = sorted.find((p) => Number(p.averagePrice) === maxPrice);
  const minEntry = sorted.find((p) => Number(p.averagePrice) === minPrice);
  const chartData = sorted.map((p) => ({
    month: formatMonth(p.month),
    평균가격: Number(p.averagePrice) / 1e8,
    rawAvg: p.averagePrice,
    rawChange: p.changePercent
  }));
  const chartMin = priceValues.length > 0 ? Math.floor(minPrice / 1e8 * 0.97 * 10) / 10 : 0;
  const chartMax = priceValues.length > 0 ? Math.ceil(maxPrice / 1e8 * 1.03 * 10) / 10 : 10;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "ghost",
          size: "sm",
          className: "gap-1.5 text-muted-foreground hover:text-foreground px-2 h-7",
          "data-ocid": "breadcrumb-home",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3.5 w-3.5" }),
            "대시보드"
          ]
        }
      ) }),
      parentRegion && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 text-muted-foreground/50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: parentRegion.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 text-muted-foreground/50" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: isRegionLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-16 inline-block" }) : (region == null ? void 0 : region.name) ?? `지역 #${id}` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: isRegionLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-44 mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-28" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-display font-bold text-foreground tracking-tight", children: (region == null ? void 0 : region.name) ?? `지역 #${id}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground flex items-center gap-1.5 mt-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5" }),
          (region == null ? void 0 : region.level) === "province" ? "시/도" : (region == null ? void 0 : region.level) === "city" ? "시/군/구" : "동/읍/면",
          " ",
          "· 부동산 가격 추이"
        ] })
      ] }) }),
      latest && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "text-right bg-card border border-border rounded-xl px-5 py-3",
          "data-ocid": "region-latest-price",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-1", children: [
              formatMonth(latest.month),
              " 평균가"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-display font-bold text-foreground", children: formatPrice(latest.averagePrice) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-1.5 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                PriceChangeIndicator,
                {
                  changePercent: latest.changePercent,
                  size: "sm"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "전월 대비" })
            ] })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: "유형" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 bg-muted/30 p-0.5 rounded-lg border border-border", children: PROPERTY_TYPES.map((pt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setPropertyType(pt),
            "data-ocid": `type-filter-${pt}`,
            className: `px-3 py-1 rounded-md text-xs font-medium transition-smooth ${propertyType === pt ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
            children: PROPERTY_TYPE_LABELS[pt]
          },
          pt
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: "기간" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 bg-muted/30 p-0.5 rounded-lg border border-border", children: MONTH_OPTIONS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setMonths(m),
            "data-ocid": `month-filter-${m}`,
            className: `px-3 py-1 rounded-md text-xs font-medium transition-smooth ${months === m ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
            children: [
              m,
              "개월"
            ]
          },
          m
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4 text-primary" }),
        "평균 가격 추이"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-2", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64 w-full rounded-lg" }) : chartData.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 280, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        LineChart,
        {
          data: chartData,
          margin: { top: 10, right: 20, left: 10, bottom: 5 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "linearGradient",
              {
                id: "priceGradient",
                x1: "0",
                y1: "0",
                x2: "1",
                y2: "0",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "stop",
                    {
                      offset: "0%",
                      stopColor: "oklch(var(--primary))",
                      stopOpacity: 0.6
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "stop",
                    {
                      offset: "100%",
                      stopColor: "oklch(var(--primary))",
                      stopOpacity: 1
                    }
                  )
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CartesianGrid,
              {
                strokeDasharray: "3 3",
                stroke: "oklch(var(--border))",
                vertical: false
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              XAxis,
              {
                dataKey: "month",
                tick: {
                  fontSize: 11,
                  fill: "oklch(var(--muted-foreground))"
                },
                tickLine: false,
                axisLine: false,
                interval: "preserveStartEnd"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              YAxis,
              {
                domain: [chartMin, chartMax],
                tickFormatter: (v) => `${formatPriceCompact(v * 1e8)}`,
                tick: {
                  fontSize: 11,
                  fill: "oklch(var(--muted-foreground))"
                },
                tickLine: false,
                axisLine: false,
                width: 56
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ReferenceLine,
              {
                y: chartData.reduce((a, b) => a + b.평균가격, 0) / chartData.length,
                stroke: "oklch(var(--muted-foreground))",
                strokeDasharray: "4 3",
                strokeOpacity: 0.4,
                label: {
                  value: "평균",
                  fill: "oklch(var(--muted-foreground))",
                  fontSize: 10,
                  position: "right"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Line,
              {
                type: "monotone",
                dataKey: "평균가격",
                stroke: "oklch(var(--primary))",
                strokeWidth: 2.5,
                dot: false,
                activeDot: {
                  r: 5,
                  fill: "oklch(var(--primary))",
                  stroke: "oklch(var(--background))",
                  strokeWidth: 2
                }
              }
            )
          ]
        }
      ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-64 flex items-center justify-center text-muted-foreground text-sm",
          "data-ocid": "chart-empty",
          children: "선택한 조건의 데이터가 없습니다"
        }
      ) })
    ] }),
    !isLoading && sorted.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", "data-ocid": "stats-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-4 w-4 text-chart-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "최고가" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-display font-bold text-foreground font-mono", children: formatPrice(BigInt(maxPrice)) }),
        maxEntry && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: formatMonth(maxEntry.month) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-4 w-4 text-chart-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "최저가" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-display font-bold text-foreground font-mono", children: formatPrice(BigInt(minPrice)) }),
        minEntry && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: formatMonth(minEntry.month) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-muted-foreground", children: "월평균 변화율" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "p",
          {
            className: `text-lg font-display font-bold font-mono ${avgChangePercent > 0 ? "text-chart-1" : avgChangePercent < 0 ? "text-chart-2" : "text-foreground"}`,
            children: [
              avgChangePercent > 0 ? "+" : "",
              (avgChangePercent / 100).toFixed(2),
              "%"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          months,
          "개월 기준"
        ] })
      ] }) })
    ] }),
    (childRegions.length > 0 || isChildLoading) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 text-primary" }),
        "하위 지역"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isChildLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-2", children: ["s1", "s2", "s3"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, k)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border/50", children: childRegions.map((child) => {
        const childSummaryPrice = void 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/region/$id",
            params: { id: child.id.toString() },
            "data-ocid": "sub-region-row",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-smooth cursor-pointer group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-8 h-8 rounded-lg flex items-center justify-center",
                    style: {
                      background: "oklch(var(--primary) / 0.1)"
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      House,
                      {
                        className: "h-4 w-4",
                        style: { color: "oklch(var(--primary))" }
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground group-hover:text-primary transition-smooth", children: child.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: child.level === "province" ? "시/도" : child.level === "city" ? "시/군/구" : "동/읍/면" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                childSummaryPrice !== void 0,
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground group-hover:text-primary transition-smooth" })
              ] })
            ] })
          },
          child.id.toString()
        );
      }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-4 w-4 text-primary" }),
        "월별 시세"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-2", children: ["t1", "t2", "t3", "t4", "t5"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }, k)) }) : sorted.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            className: "border-b border-border",
            style: { background: "oklch(var(--muted) / 0.3)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider", children: "기준월" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider", children: "평균가격" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider", children: "평당가격" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider", children: "변동률" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [...sorted].reverse().map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            className: "border-b border-border/50 hover:bg-muted/20 transition-colors",
            "data-ocid": "price-row",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-foreground font-medium", children: formatMonth(p.month) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono text-foreground", children: formatPrice(p.averagePrice) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right font-mono text-muted-foreground", children: [
                formatPrice(p.pricePerSqm),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs ml-0.5", children: "/㎡" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                PriceChangeIndicator,
                {
                  changePercent: p.changePercent,
                  size: "sm"
                }
              ) })
            ]
          },
          `${p.month}-${p.propertyType}`
        )) })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "py-12 text-center text-sm text-muted-foreground",
          "data-ocid": "table-empty",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-8 w-8 mx-auto mb-2 opacity-30" }),
            "데이터가 없습니다"
          ]
        }
      ) })
    ] })
  ] });
}
export {
  RegionDetail as default
};
