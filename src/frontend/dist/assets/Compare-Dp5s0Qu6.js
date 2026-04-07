import { c as createLucideIcon, r as reactExports, h as useNavigate, i as useCompareRegions, j as jsxRuntimeExports, C as ChartColumn, d as Skeleton, b as useSearchRegions, S as Search, I as Input } from "./index-BD9zk2uI.js";
import { P as PropertyType, e as formatMonth, C as Card, a as CardContent, B as Button, c as CardHeader, d as CardTitle, g as formatPriceCompact, b as formatPrice } from "./card-B2PrueAY.js";
import { X, B as Badge } from "./badge-CjXU7w7C.js";
import { R as ResponsiveContainer, L as LineChart, C as CartesianGrid, X as XAxis, Y as YAxis, T as Tooltip, c as Legend, b as Line } from "./LineChart-ChNa4q-f.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "m21 16-4 4-4-4", key: "f6ql7i" }],
  ["path", { d: "M17 20V4", key: "1ejh1v" }],
  ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
  ["path", { d: "M7 4v16", key: "1glfcx" }]
];
const ArrowUpDown = createLucideIcon("arrow-up-down", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]];
const ChevronDown = createLucideIcon("chevron-down", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]];
const ChevronUp = createLucideIcon("chevron-up", __iconNode);
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = reactExports.useState(value);
  reactExports.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
const CHART_COLORS = [
  "oklch(var(--chart-1))",
  "oklch(var(--chart-4))",
  "oklch(var(--chart-3))",
  "oklch(var(--chart-2))",
  "oklch(var(--chart-5))"
];
const PROPERTY_TYPES = [
  { value: PropertyType.apartment, label: "아파트" },
  { value: PropertyType.villa, label: "빌라" },
  { value: PropertyType.land, label: "대지" }
];
const MAX_REGIONS = 5;
function RegionSearch({
  onAdd,
  selectedIds,
  disabled
}) {
  const [query, setQuery] = reactExports.useState("");
  const [open, setOpen] = reactExports.useState(false);
  const containerRef = reactExports.useRef(null);
  const debouncedQuery = useDebounce(query, 300);
  const { data: results = [] } = useSearchRegions(debouncedQuery);
  reactExports.useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: disabled ? `최대 ${MAX_REGIONS}개까지 선택 가능합니다` : "지역 검색 후 추가...",
          value: query,
          disabled,
          onChange: (e) => {
            setQuery(e.target.value);
            setOpen(true);
          },
          onFocus: () => setOpen(true),
          className: "pl-9 bg-secondary",
          "data-ocid": "compare-search-input"
        }
      )
    ] }),
    open && results.length > 0 && !disabled && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-full mt-1 w-full z-50 bg-popover border border-border rounded-md shadow-lg overflow-hidden max-h-64 overflow-y-auto", children: results.slice(0, 8).map((r) => {
      const isSelected = selectedIds.has(r.id.toString());
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          disabled: isSelected,
          className: "w-full text-left px-3 py-2.5 text-sm hover:bg-secondary transition-colors flex items-center gap-2 disabled:opacity-40",
          onClick: () => {
            if (!isSelected) {
              onAdd(r);
              setQuery("");
              setOpen(false);
            }
          },
          "data-ocid": "compare-search-result",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: r.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground ml-auto", children: r.level === "province" ? "시/도" : r.level === "city" ? "시/군/구" : "동" }),
            isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs shrink-0", children: "추가됨" })
          ]
        },
        r.id.toString()
      );
    }) })
  ] });
}
function SortHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
  align = "right"
}) {
  const active = currentSort === sortKey;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "th",
    {
      className: `px-4 py-3 font-medium text-xs uppercase tracking-wide cursor-pointer select-none hover:text-foreground transition-colors ${active ? "text-primary" : "text-muted-foreground"} text-${align}`,
      onClick: () => onSort(sortKey),
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") onSort(sortKey);
      },
      "data-ocid": `sort-${sortKey}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "span",
        {
          className: `inline-flex items-center gap-1 ${align === "right" ? "justify-end w-full" : ""}`,
          children: [
            label,
            active ? currentDir === "asc" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "h-3 w-3 opacity-40" })
          ]
        }
      )
    }
  );
}
function ChangeCell({ percent }) {
  if (percent === null)
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" });
  const isPos = percent >= 0;
  const formatted = `${isPos ? "+" : ""}${(percent / 100).toFixed(1)}%`;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: `inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${isPos ? "text-price-up bg-price-up" : "text-price-down bg-price-down"}`,
      children: formatted
    }
  );
}
function Compare() {
  const navigate = useNavigate();
  const [selectedRegions, setSelectedRegions] = reactExports.useState([]);
  const [propertyType, setPropertyType] = reactExports.useState(
    PropertyType.apartment
  );
  const [sortKey, setSortKey] = reactExports.useState("currentPrice");
  const [sortDir, setSortDir] = reactExports.useState("desc");
  const regionIds = selectedRegions.map((r) => r.id);
  const syncToUrl = reactExports.useCallback(
    (regions) => {
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
        replace: true
      });
    },
    [navigate]
  );
  const addRegion = reactExports.useCallback(
    (r) => {
      setSelectedRegions((prev) => {
        const next = [...prev, r];
        syncToUrl(next);
        return next;
      });
    },
    [syncToUrl]
  );
  const removeRegion = reactExports.useCallback(
    (id) => {
      setSelectedRegions((prev) => {
        const next = prev.filter((x) => x.id !== id);
        syncToUrl(next);
        return next;
      });
    },
    [syncToUrl]
  );
  const selectedIdSet = new Set(selectedRegions.map((r) => r.id.toString()));
  const { data: prices = [], isLoading } = useCompareRegions(
    regionIds,
    propertyType
  );
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };
  const pricesByRegion = /* @__PURE__ */ new Map();
  for (const p of prices) {
    const key = p.regionId.toString();
    if (!pricesByRegion.has(key)) pricesByRegion.set(key, []);
    pricesByRegion.get(key).push({
      month: p.month,
      price: Number(p.averagePrice)
    });
  }
  for (const [, arr] of pricesByRegion) {
    arr.sort((a, b) => a.month.localeCompare(b.month));
  }
  const monthMap = /* @__PURE__ */ new Map();
  for (const p of prices) {
    const monthKey = p.month;
    if (!monthMap.has(monthKey)) monthMap.set(monthKey, {});
    const monthData = monthMap.get(monthKey);
    const region = selectedRegions.find((r) => r.id === p.regionId);
    if (region) {
      monthData[region.name] = Number(p.averagePrice) / 1e8;
    }
  }
  const chartData = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([month, values]) => ({ month: formatMonth(month), ...values }));
  const regionStats = selectedRegions.map((r) => {
    const arr = pricesByRegion.get(r.id.toString()) ?? [];
    if (arr.length === 0)
      return { region: r, currentPrice: null, change3m: null, change12m: null };
    const latest = arr[arr.length - 1];
    const price3ago = arr.length > 3 ? arr[arr.length - 4] : arr[0];
    const price12ago = arr.length > 12 ? arr[arr.length - 13] : arr[0];
    const change3m = price3ago.price > 0 ? Math.round(
      (latest.price - price3ago.price) / price3ago.price * 1e4
    ) : null;
    const change12m = price12ago.price > 0 ? Math.round(
      (latest.price - price12ago.price) / price12ago.price * 1e4
    ) : null;
    return {
      region: r,
      currentPrice: latest.price,
      change3m,
      change12m
    };
  });
  const sortedStats = [...regionStats].sort((a, b) => {
    let aVal;
    let bVal;
    switch (sortKey) {
      case "name":
        return sortDir === "asc" ? a.region.name.localeCompare(b.region.name) : b.region.name.localeCompare(a.region.name);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-display font-bold text-foreground", children: "지역 비교" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground mt-0.5", children: [
        "최대 ",
        MAX_REGIONS,
        "개 지역을 비교하세요"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-5 pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2", children: "지역 추가" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          RegionSearch,
          {
            onAdd: addRegion,
            selectedIds: selectedIdSet,
            disabled: selectedRegions.length >= MAX_REGIONS
          }
        ),
        selectedRegions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mt-3", children: selectedRegions.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "span",
          {
            className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
            style: {
              borderColor: CHART_COLORS[i % CHART_COLORS.length],
              color: CHART_COLORS[i % CHART_COLORS.length],
              background: `${CHART_COLORS[i % CHART_COLORS.length]}18`
            },
            "data-ocid": "selected-region-chip",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: "w-1.5 h-1.5 rounded-full shrink-0",
                  style: {
                    background: CHART_COLORS[i % CHART_COLORS.length]
                  }
                }
              ),
              r.name,
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  "aria-label": `${r.name} 제거`,
                  onClick: () => removeRegion(r.id),
                  className: "hover:opacity-70 transition-opacity ml-0.5",
                  "data-ocid": "remove-region-chip",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
                }
              )
            ]
          },
          r.id.toString()
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2", children: "부동산 유형" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 flex-wrap", children: PROPERTY_TYPES.map(({ value, label }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: propertyType === value ? "default" : "outline",
            size: "sm",
            onClick: () => setPropertyType(value),
            "data-ocid": `compare-type-${value}`,
            className: "text-sm",
            children: label
          },
          value
        )) })
      ] })
    ] }) }) }),
    selectedRegions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "py-24 text-center border border-dashed border-border rounded-xl",
        "data-ocid": "compare-empty",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-7 w-7 text-muted-foreground/60" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-semibold text-foreground mb-1", children: [
            "지역을 선택하세요 (최대 ",
            MAX_REGIONS,
            "개)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "위 검색창에서 지역을 검색하여 추가하면 가격 추이를 비교할 수 있습니다" })
        ]
      }
    ),
    selectedRegions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-4 w-4 text-primary" }),
        "가격 추이 비교"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-72 w-full" }) : chartData.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        LineChart,
        {
          data: chartData,
          margin: { top: 5, right: 16, left: 8, bottom: 5 },
          children: [
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
                tickFormatter: (v) => `${formatPriceCompact(v * 1e8)}`,
                tick: {
                  fontSize: 11,
                  fill: "oklch(var(--muted-foreground))"
                },
                tickLine: false,
                axisLine: false,
                width: 60
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tooltip,
              {
                contentStyle: {
                  background: "oklch(var(--popover))",
                  border: "1px solid oklch(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "oklch(var(--popover-foreground))",
                  boxShadow: "0 8px 32px rgb(0 0 0 / 0.4)"
                },
                formatter: (value, name) => [
                  `${formatPriceCompact(value * 1e8)}원`,
                  name
                ],
                labelStyle: {
                  color: "oklch(var(--muted-foreground))",
                  marginBottom: "4px"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Legend,
              {
                wrapperStyle: { fontSize: "12px", paddingTop: "12px" }
              }
            ),
            selectedRegions.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Line,
              {
                type: "monotone",
                dataKey: r.name,
                stroke: CHART_COLORS[i % CHART_COLORS.length],
                strokeWidth: 2.5,
                dot: false,
                activeDot: {
                  r: 5,
                  strokeWidth: 2,
                  fill: CHART_COLORS[i % CHART_COLORS.length]
                }
              },
              r.id.toString()
            ))
          ]
        }
      ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-72 flex items-center justify-center text-muted-foreground text-sm",
          "data-ocid": "compare-chart-empty",
          children: "데이터를 불러오는 중..."
        }
      ) })
    ] }),
    selectedRegions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "시세 비교" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-0 mt-2", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 space-y-2", children: ["c1", "c2", "c3"].map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-12 w-full" }, k)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SortHeader,
            {
              label: "지역",
              sortKey: "name",
              currentSort: sortKey,
              currentDir: sortDir,
              onSort: handleSort,
              align: "left"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SortHeader,
            {
              label: "현재가격",
              sortKey: "currentPrice",
              currentSort: sortKey,
              currentDir: sortDir,
              onSort: handleSort
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SortHeader,
            {
              label: "3개월 변화",
              sortKey: "change3m",
              currentSort: sortKey,
              currentDir: sortDir,
              onSort: handleSort
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SortHeader,
            {
              label: "12개월 변화",
              sortKey: "change12m",
              currentSort: sortKey,
              currentDir: sortDir,
              onSort: handleSort
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sortedStats.map((s) => {
          const colorIdx = selectedRegions.findIndex(
            (r) => r.id === s.region.id
          );
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "tr",
            {
              className: "border-b border-border/50 hover:bg-muted/20 transition-colors",
              "data-ocid": "compare-row",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "w-2.5 h-2.5 rounded-full shrink-0",
                      style: {
                        background: CHART_COLORS[colorIdx % CHART_COLORS.length]
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: s.region.name })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3.5 text-right font-mono tabular-nums", children: s.currentPrice !== null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: formatPrice(
                  BigInt(Math.round(s.currentPrice))
                ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChangeCell, { percent: s.change3m }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChangeCell, { percent: s.change12m }) })
              ]
            },
            s.region.id.toString()
          );
        }) })
      ] }) }) })
    ] })
  ] });
}
export {
  Compare as default
};
