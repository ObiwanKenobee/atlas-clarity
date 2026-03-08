import { dataSources } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, Clock, AlertCircle } from "lucide-react";

const statusConfig = {
  good: { bg: "bg-data-good", label: "Good", icon: Wifi },
  partial: { bg: "bg-data-partial", label: "Partial", icon: Clock },
  missing: { bg: "bg-data-missing", label: "Missing", icon: WifiOff },
  unknown: { bg: "bg-data-unknown", label: "Unknown", icon: AlertCircle },
};

export function DataCoveragePanel() {
  const goodCount = dataSources.filter(d => d.status === "good").length;
  const totalCount = dataSources.length;
  const overallCoverage = Math.round(dataSources.reduce((s, d) => s + d.coverage, 0) / totalCount);

  return (
    <div className="atlas-panel">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">Data Gaps & Coverage</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Source reliability and observation health</p>
        </div>
        <div className="text-right">
          <span className="font-mono text-lg font-bold text-card-foreground">{overallCoverage}%</span>
          <p className="text-xs text-muted-foreground">{goodCount}/{totalCount} sources healthy</p>
        </div>
      </div>

      <div className="space-y-2">
        {dataSources.map((source) => {
          const cfg = statusConfig[source.status];
          const Icon = cfg.icon;
          return (
            <div key={source.name} className="flex items-center gap-3 rounded-md bg-secondary/50 px-3 py-2">
              <div className={cn("flex h-7 w-7 items-center justify-center rounded", cfg.bg + "/15")}>
                <Icon className={cn("h-3.5 w-3.5", {
                  "text-confidence-high": source.status === "good",
                  "text-confidence-medium": source.status === "partial",
                  "text-confidence-low": source.status === "missing",
                  "text-confidence-unknown": source.status === "unknown",
                })} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-card-foreground">{source.name}</span>
                  <span className={cn("text-xs font-mono", {
                    "text-confidence-high": source.status === "good",
                    "text-confidence-medium": source.status === "partial",
                    "text-confidence-low": source.status === "missing",
                    "text-confidence-unknown": source.status === "unknown",
                  })}>{source.coverage > 0 ? `${source.coverage}%` : "—"}</span>
                </div>
                <div className="mt-1 h-1 w-full rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full transition-all", cfg.bg)}
                    style={{ width: `${source.coverage}%`, opacity: 0.7 }}
                  />
                </div>
              </div>
              <span className="shrink-0 text-[10px] text-muted-foreground w-12 text-right">{source.latency}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
