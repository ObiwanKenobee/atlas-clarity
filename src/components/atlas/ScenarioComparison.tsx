import { scenarios } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function ScenarioComparison() {
  const max = Math.max(...scenarios.map(s => s.probability));

  return (
    <div className="atlas-panel">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">Scenario Comparison</h3>
        <p className="text-xs text-muted-foreground mt-0.5">How the forecast shifts under different assumptions</p>
      </div>

      <div className="space-y-3">
        {scenarios.map((s) => (
          <div key={s.name} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-card-foreground">{s.name}</span>
              <span className="font-mono text-sm font-bold text-card-foreground">{s.probability}%</span>
            </div>
            <div className="relative h-6 w-full rounded bg-secondary/60 overflow-hidden">
              <div
                className="h-full rounded transition-all duration-500 ease-out"
                style={{
                  width: `${(s.probability / max) * 100}%`,
                  backgroundColor: s.color,
                  opacity: 0.75,
                }}
              />
              <div
                className="absolute inset-0 h-full rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  width: `${(s.probability / max) * 100}%`,
                  backgroundColor: s.color,
                  opacity: 0.15,
                }}
              />
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{s.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
