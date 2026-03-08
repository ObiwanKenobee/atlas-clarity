import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  level: "high" | "medium" | "low" | "unknown" | "divergent";
  size?: "sm" | "md";
}

const config = {
  high: { label: "High Confidence", bg: "bg-confidence-high/15", text: "text-confidence-high", dot: "bg-confidence-high" },
  medium: { label: "Moderate Confidence", bg: "bg-confidence-medium/15", text: "text-confidence-medium", dot: "bg-confidence-medium" },
  low: { label: "Low Confidence", bg: "bg-confidence-low/15", text: "text-confidence-low", dot: "bg-confidence-low" },
  unknown: { label: "Data Sparse", bg: "bg-confidence-unknown/15", text: "text-confidence-unknown", dot: "bg-confidence-unknown" },
  divergent: { label: "Model Divergence", bg: "bg-confidence-low/15", text: "text-confidence-low", dot: "bg-confidence-low" },
};

export function ConfidenceBadge({ level, size = "md" }: ConfidenceBadgeProps) {
  const c = config[level];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium",
      c.bg, c.text,
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
    )}>
      <span className={cn("rounded-full", c.dot, size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2")} />
      {c.label}
    </span>
  );
}
