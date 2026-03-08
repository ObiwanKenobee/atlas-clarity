import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts";
import { generateDistribution } from "@/data/mockData";
import { useMemo } from "react";

interface Props {
  mean: number;
  spread?: number;
}

export function UncertaintyBandChart({ mean, spread = 12 }: Props) {
  const data = useMemo(() => generateDistribution(mean, spread), [mean, spread]);

  return (
    <div className="atlas-panel">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">Confidence Distribution</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Probability density with credible intervals</p>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-primary/60" /> Core range
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-primary/20" /> Tail risk
          </span>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="tailGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.1} />
                <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="coreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.7} />
                <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="x" tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} label={{ value: "Probability %", position: "insideBottom", offset: -2, fontSize: 10, fill: "hsl(215, 12%, 50%)" }} />
            <YAxis hide />
            <Area type="monotone" dataKey="tailUpper" stroke="none" fill="url(#tailGrad)" />
            <Area type="monotone" dataKey="upper" stroke="none" fill="url(#coreGrad)" />
            <Area type="monotone" dataKey="y" stroke="hsl(199, 89%, 48%)" strokeWidth={2} fill="url(#peakGrad)" />
            <ReferenceLine x={mean} stroke="hsl(199, 89%, 48%)" strokeDasharray="4 4" strokeOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex justify-between text-xs font-mono text-muted-foreground">
        <span>Low-end: {Math.max(0, mean - spread * 1.8).toFixed(0)}%</span>
        <span className="text-card-foreground font-semibold">Most likely: {(mean - spread * 0.3).toFixed(0)}%–{(mean + spread * 0.5).toFixed(0)}%</span>
        <span>Tail risk: {Math.min(100, mean + spread * 2.2).toFixed(0)}%</span>
      </div>
    </div>
  );
}
