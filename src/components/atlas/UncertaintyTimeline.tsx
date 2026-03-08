import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts";
import { generateUncertaintyTimeline, type Prediction } from "@/data/mockData";
import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";

interface Props {
  prediction: Prediction;
}

export function UncertaintyTimeline({ prediction }: Props) {
  const data = useMemo(() => generateUncertaintyTimeline(prediction), [prediction]);
  const [dayIndex, setDayIndex] = useState([0]);

  const current = data[dayIndex[0]] ?? data[0];

  return (
    <div className="atlas-panel">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">Uncertainty Over Time</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Drag slider to explore forecast evolution</p>
        </div>
        <div className="text-right">
          <span className="font-mono text-sm font-bold text-card-foreground">{current.label}</span>
          <p className="text-xs text-muted-foreground">{current.probability}% ± {(current.upper - current.lower).toFixed(0)}pp</p>
        </div>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="timeUncertaintyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v === 0 ? "Now" : `D${v}`}
            />
            <YAxis hide domain={[0, 100]} />
            <Area type="monotone" dataKey="upper" stroke="none" fill="url(#timeUncertaintyGrad)" />
            <Area type="monotone" dataKey="lower" stroke="none" fill="hsl(var(--background))" />
            <Area type="monotone" dataKey="probability" stroke="hsl(199, 89%, 48%)" strokeWidth={2} fill="none" />
            <ReferenceLine x={dayIndex[0]} stroke="hsl(210, 20%, 90%)" strokeDasharray="3 3" strokeOpacity={0.4} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 px-1">
        <Slider
          value={dayIndex}
          onValueChange={setDayIndex}
          max={30}
          step={1}
          className="w-full"
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div className="rounded bg-secondary/50 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Epistemic</p>
          <p className="font-mono text-sm font-semibold text-confidence-medium">{(current.epistemic * 100).toFixed(0)}%</p>
        </div>
        <div className="rounded bg-secondary/50 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Aleatoric</p>
          <p className="font-mono text-sm font-semibold" style={{ color: "hsl(280, 60%, 55%)" }}>{(current.aleatoric * 100).toFixed(0)}%</p>
        </div>
        <div className="rounded bg-secondary/50 px-2 py-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Spread</p>
          <p className="font-mono text-sm font-semibold text-card-foreground">±{((current.upper - current.lower) / 2).toFixed(1)}pp</p>
        </div>
      </div>
    </div>
  );
}
