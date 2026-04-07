import { cn } from "@/lib/utils";
import { formatPercent } from "@/utils/formatPrice";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface PriceChangeIndicatorProps {
  changePercent: bigint | number;
  change?: bigint | number;
  className?: string;
  showIcon?: boolean;
  showAmount?: boolean;
  size?: "sm" | "md" | "lg";
}

export function PriceChangeIndicator({
  changePercent,
  change,
  className,
  showIcon = true,
  showAmount = false,
  size = "md",
}: PriceChangeIndicatorProps) {
  const n =
    typeof changePercent === "bigint" ? Number(changePercent) : changePercent;
  const isUp = n > 0;
  const isDown = n < 0;
  const isFlat = n === 0;

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 gap-0.5",
    md: "text-sm px-2 py-1 gap-1",
    lg: "text-base px-2.5 py-1 gap-1",
  };

  const iconSize = { sm: 10, md: 12, lg: 14 }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded font-medium font-mono",
        sizeClasses[size],
        isUp && "text-chart-1 bg-chart-1/10 border border-chart-1/25",
        isDown && "text-chart-2 bg-chart-2/10 border border-chart-2/25",
        isFlat && "text-muted-foreground bg-muted border border-border",
        className,
      )}
      data-ocid="price-change-indicator"
    >
      {showIcon && isUp && <TrendingUp size={iconSize} />}
      {showIcon && isDown && <TrendingDown size={iconSize} />}
      {showIcon && isFlat && <Minus size={iconSize} />}
      <span>{isFlat ? "변동없음" : formatPercent(n)}</span>
      {showAmount && change !== undefined && !isFlat && (
        <span className="opacity-70 text-[0.85em] ml-0.5">
          (
          {typeof change === "bigint"
            ? Number(change) > 0
            : change > 0
              ? "+"
              : ""}
          {formatPercent(change)})
        </span>
      )}
    </span>
  );
}

interface PriceBadgeProps {
  change: bigint | number;
  changePercent: bigint | number;
  className?: string;
}

export function PriceBadge({
  change,
  changePercent,
  className,
}: PriceBadgeProps) {
  const numChange = typeof change === "bigint" ? Number(change) : change;
  const isUp = numChange > 0;
  const isDown = numChange < 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium font-mono",
        isUp && "text-chart-1 bg-chart-1/10 border border-chart-1/25",
        isDown && "text-chart-2 bg-chart-2/10 border border-chart-2/25",
        !isUp &&
          !isDown &&
          "text-muted-foreground bg-muted border border-border",
        className,
      )}
      data-ocid="price-badge"
    >
      {isUp && <TrendingUp className="h-3 w-3" />}
      {isDown && <TrendingDown className="h-3 w-3" />}
      {!isUp && !isDown && <Minus className="h-3 w-3" />}
      {isUp || isDown ? formatPercent(changePercent) : "변동없음"}
    </span>
  );
}
