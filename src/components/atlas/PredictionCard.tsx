import { ConfidenceBadge } from "./ConfidenceBadge";
import type { Prediction } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Clock, Database, AlertTriangle } from "lucide-react";

interface PredictionCardProps {
  prediction: Prediction;
  selected?: boolean;
  onClick?: () => void;
}

export function PredictionCard({ prediction, selected, onClick }: PredictionCardProps) {
  const p = prediction;
  return (
    <button
      onClick={onClick}
      className={cn(
        "atlas-panel w-full text-left transition-all duration-200 hover:border-primary/40",
        selected && "border-primary/60 atlas-glow"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{p.region}</p>
          <h3 className="mt-1 text-base font-semibold text-card-foreground">{p.title}</h3>
        </div>
        <div className="text-right shrink-0">
          <span className="font-mono text-2xl font-bold text-card-foreground">{p.probability}%</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ConfidenceBadge level={p.confidence} size="sm" />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Database className="h-3 w-3" />
          <span>{p.dataCompleteness}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{p.lastUpdate}</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          <span>{p.forecastWindow}</span>
        </div>
      </div>

      {/* Data completeness bar */}
      <div className="mt-3">
        <div className="h-1 w-full rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              p.dataCompleteness >= 80 ? "bg-confidence-high" :
              p.dataCompleteness >= 50 ? "bg-confidence-medium" : "bg-confidence-low"
            )}
            style={{ width: `${p.dataCompleteness}%` }}
          />
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
        {p.uncertaintySource}
      </p>
    </button>
  );
}
