import { c as createLucideIcon, j as jsxRuntimeExports, a as cn } from "./index-CA7MdyxF.js";
import { f as formatPercent } from "./card-BC1EZS11.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
];
const MapPin = createLucideIcon("map-pin", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [["path", { d: "M5 12h14", key: "1ays0h" }]];
const Minus = createLucideIcon("minus", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M16 17h6v-6", key: "t6n2it" }],
  ["path", { d: "m22 17-8.5-8.5-5 5L2 7", key: "x473p" }]
];
const TrendingDown = createLucideIcon("trending-down", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 7h6v6", key: "box55l" }],
  ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }]
];
const TrendingUp = createLucideIcon("trending-up", __iconNode);
function PriceChangeIndicator({
  changePercent,
  change,
  className,
  showIcon = true,
  showAmount = false,
  size = "md"
}) {
  const n = typeof changePercent === "bigint" ? Number(changePercent) : changePercent;
  const isUp = n > 0;
  const isDown = n < 0;
  const isFlat = n === 0;
  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-0.5",
    md: "text-sm px-2 py-1 gap-1",
    lg: "text-base px-2.5 py-1 gap-1"
  };
  const iconSize = { sm: 10, md: 12, lg: 14 }[size];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: cn(
        "inline-flex items-center rounded font-medium font-mono",
        sizeClasses[size],
        isUp && "text-chart-1 bg-chart-1/10 border border-chart-1/25",
        isDown && "text-chart-2 bg-chart-2/10 border border-chart-2/25",
        isFlat && "text-muted-foreground bg-muted border border-border",
        className
      ),
      "data-ocid": "price-change-indicator",
      children: [
        showIcon && isUp && /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: iconSize }),
        showIcon && isDown && /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { size: iconSize }),
        showIcon && isFlat && /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { size: iconSize }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isFlat ? "변동없음" : formatPercent(n) }),
        showAmount && change !== void 0 && !isFlat && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "opacity-70 text-[0.85em] ml-0.5", children: [
          "(",
          typeof change === "bigint" ? Number(change) > 0 : change > 0 ? "+" : "",
          formatPercent(change),
          ")"
        ] })
      ]
    }
  );
}
const PROPERTY_TYPE_LABELS = {
  apartment: "아파트",
  villa: "빌라",
  land: "대지"
};
export {
  MapPin as M,
  PROPERTY_TYPE_LABELS as P,
  TrendingUp as T,
  PriceChangeIndicator as a,
  TrendingDown as b
};
