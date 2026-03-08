import { cn } from "@/lib/utils";

interface Props {
  agreement: number; // 0 to 1
  epistemicUncertainty: number;
  aleatoricUncertainty: number;
  freshnessScore: number;
}

function MetricBar({ label, sublabel, value, color }: { label: string; sublabel: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <div>
          <span className="text-xs font-medium text-card-foreground">{label}</span>
          <span className="text-[10px] text-muted-foreground ml-1.5">({sublabel})</span>
        </div>
        <span className="font-mono text-xs text-card-foreground">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary">
        <div className={cn("h-full rounded-full transition-all")} style={{ width: `${value * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function ModelAgreementMeter({ agreement, epistemicUncertainty, aleatoricUncertainty, freshnessScore }: Props) {
  const level = agreement > 0.8 ? "Strong Convergence" : agreement > 0.6 ? "Mild Divergence" : "Strong Divergence";
  const levelColor = agreement > 0.8 ? "text-confidence-high" : agreement > 0.6 ? "text-confidence-medium" : "text-confidence-low";

  return (
    <div className="atlas-panel">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">Model & Uncertainty Metrics</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Agreement, uncertainty decomposition, freshness</p>
        </div>
        <span className={cn("text-xs font-semibold", levelColor)}>{level}</span>
      </div>

      <div className="space-y-3">
        <MetricBar label="Model Agreement" sublabel="convergence across models" value={agreement} color="hsl(199, 89%, 48%)" />
        <MetricBar label="Epistemic Uncertainty" sublabel="missing knowledge" value={epistemicUncertainty} color="hsl(45, 93%, 55%)" />
        <MetricBar label="Aleatoric Uncertainty" sublabel="natural variability" value={aleatoricUncertainty} color="hsl(280, 60%, 55%)" />
        <MetricBar label="Data Freshness" sublabel="input currency" value={freshnessScore} color="hsl(152, 69%, 45%)" />
      </div>
    </div>
  );
}
