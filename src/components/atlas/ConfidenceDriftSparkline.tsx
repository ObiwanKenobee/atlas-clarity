import { generateConfidenceDrift, type Prediction } from "@/data/mockData";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Props {
  prediction: Prediction;
}

export function ConfidenceDriftSparkline({ prediction }: Props) {
  const data = useMemo(() => generateConfidenceDrift(prediction), [prediction]);
  
  const trend = data[data.length - 1] - data[0];
  const trendLabel = trend > 1 ? "Growing" : trend < -1 ? "Shrinking" : "Stable";
  const trendColor = trend > 1 ? "text-confidence-low" : trend < -1 ? "text-confidence-high" : "text-muted-foreground";
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 20;
  const width = 56;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(" ");

  return (
    <div className="flex items-center gap-2">
      <svg width={width} height={height} className="shrink-0">
        <polyline
          points={points}
          fill="none"
          stroke={trend > 1 ? "hsl(var(--confidence-low))" : trend < -1 ? "hsl(var(--confidence-high))" : "hsl(var(--muted-foreground))"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={cn("text-[9px] font-medium uppercase tracking-wider", trendColor)}>{trendLabel}</span>
    </div>
  );
}
