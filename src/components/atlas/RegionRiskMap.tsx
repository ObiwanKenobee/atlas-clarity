import { predictions } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

// Approximate coordinates for a stylized abstract map
const regionPositions: Record<string, { x: number; y: number }> = {
  "Nairobi Basin": { x: 55, y: 45 },
  "Lagos Mainland": { x: 25, y: 50 },
  "Dhaka Metro": { x: 75, y: 35 },
  "Punjab Agricultural Belt": { x: 65, y: 25 },
};

function getRiskColor(probability: number): string {
  if (probability >= 50) return "hsl(var(--confidence-low))";
  if (probability >= 30) return "hsl(var(--confidence-medium))";
  return "hsl(var(--confidence-high))";
}

function getUncertaintyBlur(epistemic: number): number {
  // Higher epistemic uncertainty = more blur (2–12px)
  return 2 + epistemic * 20;
}

function getHaloSize(epistemic: number): number {
  // Higher uncertainty = larger halo
  return 28 + epistemic * 40;
}

export function RegionRiskMap({ selectedId, onSelect }: Props) {
  return (
    <div className="atlas-panel">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-card-foreground">Region Risk Map</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Color = risk magnitude · Halo = uncertainty intensity</p>
      </div>

      <div className="relative w-full h-64 rounded-lg bg-secondary/30 border border-border/50 overflow-hidden">
        {/* Grid pattern background */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {predictions.map((p, i) => {
            const pos = regionPositions[p.region];
            if (!pos) return null;
            return predictions.slice(i + 1).map((p2) => {
              const pos2 = regionPositions[p2.region];
              if (!pos2) return null;
              return (
                <line
                  key={`${p.id}-${p2.id}`}
                  x1={`${pos.x}%`}
                  y1={`${pos.y}%`}
                  x2={`${pos2.x}%`}
                  y2={`${pos2.y}%`}
                  stroke="hsl(var(--border))"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                  opacity={0.4}
                />
              );
            });
          })}
        </svg>

        {/* Region nodes */}
        {predictions.map((p) => {
          const pos = regionPositions[p.region];
          if (!pos) return null;
          const blur = getUncertaintyBlur(p.epistemicUncertainty);
          const haloSize = getHaloSize(p.epistemicUncertainty);
          const riskColor = getRiskColor(p.probability);
          const isSelected = p.id === selectedId;

          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform duration-200 hover:scale-110"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {/* Uncertainty halo */}
              <div
                className="absolute rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{
                  width: haloSize,
                  height: haloSize,
                  backgroundColor: riskColor,
                  opacity: isSelected ? 0.25 : 0.12,
                  filter: `blur(${blur}px)`,
                }}
              />
              {/* Core dot */}
              <div
                className={cn(
                  "relative rounded-full transition-all duration-200 z-10",
                  isSelected && "ring-2 ring-foreground/50"
                )}
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: riskColor,
                  boxShadow: `0 0 ${blur}px ${riskColor}`,
                }}
              />
              {/* Label */}
              <div className={cn(
                "absolute left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap text-center transition-opacity",
                isSelected ? "opacity-100" : "opacity-60 group-hover:opacity-100"
              )}>
                <p className="text-[10px] font-semibold text-card-foreground">{p.region}</p>
                <p className="text-[9px] font-mono text-muted-foreground">{p.probability}% risk</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground justify-center">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-confidence-low" /> High risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-confidence-medium" /> Moderate risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-confidence-high" /> Lower risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-muted-foreground/20 blur-[2px]" /> Low uncertainty
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-4 w-4 rounded-full bg-muted-foreground/20 blur-[4px]" /> High uncertainty
        </span>
      </div>
    </div>
  );
}
