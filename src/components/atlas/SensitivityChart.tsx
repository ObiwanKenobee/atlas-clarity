import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { sensitivityVars } from "@/data/mockData";

export function SensitivityChart() {
  const data = sensitivityVars
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .map((v) => ({ name: v.name, impact: Number((v.impact * 100).toFixed(0)) }));

  return (
    <div className="atlas-panel">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">Assumption Sensitivity</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Variables with highest forecast impact</p>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215, 12%, 50%)" }} axisLine={false} tickLine={false} domain={[-50, 100]} />
            <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11, fill: "hsl(210, 20%, 80%)" }} axisLine={false} tickLine={false} />
            <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={16}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.impact >= 0 ? "hsl(199, 89%, 48%)" : "hsl(152, 69%, 45%)"} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted-foreground italic">
        "If you want to reduce uncertainty, improve these variables first."
      </p>
    </div>
  );
}
