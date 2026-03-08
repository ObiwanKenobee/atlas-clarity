import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Dot } from "recharts";
import type { Prediction } from "@/data/mockData";

interface Props {
  prediction: Prediction;
}

interface DriftPoint {
  day: number;
  label: string;
  confidence: number;
  upper: number;
  lower: number;
  event?: { type: "outage" | "retrain" | "data" | "alert"; label: string };
}

const eventColors: Record<string, string> = {
  outage: "hsl(var(--confidence-low))",
  retrain: "hsl(var(--primary))",
  data: "hsl(var(--confidence-high))",
  alert: "hsl(var(--confidence-medium))",
};

const eventLabels: Record<string, string> = {
  outage: "Sensor Outage",
  retrain: "Model Retrain",
  data: "Data Update",
  alert: "Alert Raised",
};

function generateDriftData(prediction: Prediction): DriftPoint[] {
  const points: DriftPoint[] = [];
  const baseConf =
    prediction.confidence === "high" ? 85 : prediction.confidence === "medium" ? 60 : 35;
  const ep = prediction.epistemicUncertainty;

  // Seed events from audit trail mapped to approximate days
  const events: { day: number; type: "outage" | "retrain" | "data" | "alert"; label: string }[] = [];
  prediction.auditTrail.forEach((entry, i) => {
    const day = Math.max(1, 30 - i * 7 - Math.floor(Math.random() * 3));
    if (entry.action.toLowerCase().includes("retrain") || entry.action.toLowerCase().includes("model")) {
      events.push({ day, type: "retrain", label: entry.detail });
    } else if (entry.action.toLowerCase().includes("offline") || entry.action.toLowerCase().includes("downgrade")) {
      events.push({ day, type: "outage", label: entry.detail });
    } else if (entry.action.toLowerCase().includes("data") || entry.action.toLowerCase().includes("ingestion")) {
      events.push({ day, type: "data", label: entry.detail });
    } else if (entry.action.toLowerCase().includes("alert") || entry.action.toLowerCase().includes("escalation")) {
      events.push({ day, type: "alert", label: entry.detail });
    }
  });

  for (let d = 0; d <= 30; d++) {
    const drift = Math.sin(d * 0.25) * 8 + Math.cos(d * 0.12) * 5;
    const eventShock = events.find((e) => Math.abs(e.day - d) < 1);
    const shock = eventShock?.type === "outage" ? -12 : eventShock?.type === "retrain" ? 6 : 0;
    const conf = Math.max(10, Math.min(95, baseConf + drift + shock + d * (ep > 0.3 ? -0.3 : 0.2)));
    const spread = 5 + ep * 15 + d * 0.15;

    const matchedEvent = events.find((e) => e.day === d);
    points.push({
      day: d,
      label: d === 0 ? "30d ago" : d === 30 ? "Today" : `Day ${d}`,
      confidence: Number(conf.toFixed(1)),
      upper: Number(Math.min(100, conf + spread).toFixed(1)),
      lower: Number(Math.max(0, conf - spread).toFixed(1)),
      event: matchedEvent ? { type: matchedEvent.type, label: matchedEvent.label } : undefined,
    });
  }
  return points;
}

function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  if (!payload?.event) return null;
  const color = eventColors[payload.event.type] || "hsl(var(--primary))";
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={color} opacity={0.3} />
      <circle cx={cx} cy={cy} r={3} fill={color} stroke="hsl(var(--background))" strokeWidth={1.5} />
    </g>
  );
}

export function ConfidenceDriftTimeline({ prediction }: Props) {
  const data = useMemo(() => generateDriftData(prediction), [prediction]);
  const events = data.filter((d) => d.event);
  const currentConf = data[data.length - 1]?.confidence ?? 0;
  const startConf = data[0]?.confidence ?? 0;
  const trend = currentConf - startConf;

  return (
    <div className="atlas-panel">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">Confidence Drift</h3>
          <p className="text-xs text-muted-foreground mt-0.5">30-day certainty evolution with key events</p>
        </div>
        <div className="text-right">
          <span className="font-mono text-sm font-bold text-card-foreground">{currentConf.toFixed(0)}%</span>
          <p className={`text-xs font-mono ${trend >= 0 ? "text-confidence-high" : "text-confidence-low"}`}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}pp
          </p>
        </div>
      </div>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="confDriftGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 9, fill: "hsl(215, 12%, 50%)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => (v === 0 ? "30d" : v === 15 ? "15d" : v === 30 ? "Now" : "")}
            />
            <YAxis hide domain={[0, 100]} />
            <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confDriftGrad)" />
            <Area type="monotone" dataKey="lower" stroke="none" fill="hsl(var(--background))" />
            <Area
              type="monotone"
              dataKey="confidence"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="none"
              dot={<CustomDot />}
              activeDot={false}
            />
            {/* Annotated event reference lines */}
            {events.map((e) => (
              <ReferenceLine
                key={e.day}
                x={e.day}
                stroke={eventColors[e.event!.type]}
                strokeDasharray="2 3"
                strokeOpacity={0.5}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Event annotations */}
      {events.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Key Events</p>
          {events.map((e, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className="mt-1 h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: eventColors[e.event!.type] }}
              />
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-card-foreground">
                  {eventLabels[e.event!.type]}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono ml-1.5">
                  Day {e.day}
                </span>
                <p className="text-[10px] text-muted-foreground leading-tight truncate">{e.event!.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground justify-center">
        {Object.entries(eventLabels).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: eventColors[key] }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
