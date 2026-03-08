import { useMemo } from "react";
import { dataSources, type Prediction, type DataSource } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { TrendingDown, Lightbulb } from "lucide-react";

interface Props {
  prediction: Prediction;
}

interface VoiItem {
  source: DataSource;
  uncertaintyReduction: number;
  currentGap: number;
  priority: "critical" | "high" | "moderate" | "low";
}

function calculateVoi(prediction: Prediction): VoiItem[] {
  const ep = prediction.epistemicUncertainty;

  return dataSources
    .map((source) => {
      // Higher gap = more potential reduction
      const gap = 100 - source.coverage;
      // Weight by how much epistemic uncertainty exists and how large the gap is
      const reduction = Number(
        (ep * (gap / 100) * (source.status === "missing" ? 1.0 : source.status === "partial" ? 0.6 : source.status === "unknown" ? 0.8 : 0.15) * 100).toFixed(1)
      );

      let priority: "critical" | "high" | "moderate" | "low" = "low";
      if (reduction >= 15) priority = "critical";
      else if (reduction >= 8) priority = "high";
      else if (reduction >= 3) priority = "moderate";

      return {
        source,
        uncertaintyReduction: reduction,
        currentGap: gap,
        priority,
      };
    })
    .filter((v) => v.uncertaintyReduction > 0.5)
    .sort((a, b) => b.uncertaintyReduction - a.uncertaintyReduction);
}

const priorityStyles = {
  critical: { text: "text-confidence-low", bg: "bg-confidence-low/15", label: "Critical" },
  high: { text: "text-confidence-medium", bg: "bg-confidence-medium/15", label: "High" },
  moderate: { text: "text-primary", bg: "bg-primary/15", label: "Moderate" },
  low: { text: "text-muted-foreground", bg: "bg-secondary", label: "Low" },
};

export function ValueOfInformation({ prediction }: Props) {
  const items = useMemo(() => calculateVoi(prediction), [prediction]);
  const totalPotentialReduction = items.reduce((s, v) => s + v.uncertaintyReduction, 0);
  const topItem = items[0];

  return (
    <div className="atlas-panel">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">Value of Information</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Which data would reduce uncertainty most</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-confidence-high">
            <TrendingDown className="h-3.5 w-3.5" />
            <span className="font-mono text-sm font-bold">{totalPotentialReduction.toFixed(0)}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground">total reducible</p>
        </div>
      </div>

      {/* Top recommendation callout */}
      {topItem && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-card-foreground">
                Priority: Acquire {topItem.source.name}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Improving {topItem.source.name} from {topItem.source.coverage}% to full coverage could reduce
                forecast uncertainty by up to <span className="font-mono font-semibold text-confidence-high">{topItem.uncertaintyReduction}%</span>.
                Current status: <span className="font-semibold">{topItem.source.status}</span>, latency: {topItem.source.latency}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ranked list */}
      <div className="space-y-2">
        {items.map((item, i) => {
          const ps = priorityStyles[item.priority];
          return (
            <div key={item.source.name} className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground w-4 text-right shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-card-foreground truncate">{item.source.name}</span>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", ps.bg, ps.text)}>
                    {ps.label}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-confidence-high transition-all"
                    style={{ width: `${Math.min(100, item.uncertaintyReduction * 3)}%`, opacity: 0.7 }}
                  />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[10px] text-muted-foreground">
                    Gap: {item.currentGap}% · Status: {item.source.status}
                  </span>
                  <span className="text-[10px] font-mono text-confidence-high">
                    −{item.uncertaintyReduction}% uncertainty
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-6">
          <p className="text-xs text-muted-foreground">All data sources have sufficient coverage.</p>
        </div>
      )}
    </div>
  );
}
