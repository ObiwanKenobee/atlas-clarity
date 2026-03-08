import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { predictions } from "@/data/mockData";
import { useMemo } from "react";

interface ScatterPoint {
  confidence: number;
  risk: number;
  population: number;
  label: string;
  id: string;
  confidenceLevel: "high" | "medium" | "low";
}

const colorMap = {
  high: "hsl(152, 69%, 45%)",
  medium: "hsl(45, 93%, 55%)",
  low: "hsl(0, 72%, 55%)",
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload as ScatterPoint;
  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg">
      <p className="text-xs font-semibold text-card-foreground">{d.label}</p>
      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
        <p>Risk: <span className="font-mono text-card-foreground">{d.risk}%</span></p>
        <p>Model Agreement: <span className="font-mono text-card-foreground">{d.confidence}%</span></p>
        <p>Population: <span className="font-mono text-card-foreground">{(d.population / 1000000).toFixed(1)}M</span></p>
      </div>
    </div>
  );
}

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function RiskConfidenceScatter({ selectedId, onSelect }: Props) {
  const data = useMemo<ScatterPoint[]>(() =>
    predictions.map((p) => ({
      confidence: Math.round(p.modelAgreement * 100),
      risk: p.probability,
      population: p.populationExposure,
      label: `${p.title} — ${p.region}`,
      id: p.id,
      confidenceLevel: p.confidence,
    })),
    []
  );

  return (
    <div className="atlas-panel">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">Risk vs Confidence</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Bubble size = population exposure</p>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <XAxis
              type="number"
              dataKey="confidence"
              name="Confidence"
              domain={[30, 100]}
              tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }}
              axisLine={false}
              tickLine={false}
              label={{ value: "Model Agreement %", position: "insideBottom", offset: -2, fontSize: 10, fill: "hsl(215, 12%, 50%)" }}
            />
            <YAxis
              type="number"
              dataKey="risk"
              name="Risk"
              domain={[0, 80]}
              tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }}
              axisLine={false}
              tickLine={false}
              label={{ value: "Risk %", angle: -90, position: "insideLeft", offset: 10, fontSize: 10, fill: "hsl(215, 12%, 50%)" }}
            />
            <ZAxis type="number" dataKey="population" range={[200, 800]} />
            <Tooltip content={CustomTooltip} cursor={false} />
            <Scatter data={data} onClick={(d: any) => onSelect(d.id)}>
              {data.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={colorMap[entry.confidenceLevel]}
                  fillOpacity={entry.id === selectedId ? 0.9 : 0.5}
                  stroke={entry.id === selectedId ? "hsl(210, 20%, 90%)" : "none"}
                  strokeWidth={entry.id === selectedId ? 2 : 0}
                  cursor="pointer"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground justify-center">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: colorMap.high }} /> High confidence</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: colorMap.medium }} /> Medium</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: colorMap.low }} /> Low</span>
      </div>
    </div>
  );
}
