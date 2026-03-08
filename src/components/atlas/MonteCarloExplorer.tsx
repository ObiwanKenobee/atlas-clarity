import { useState, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { Prediction } from "@/data/mockData";
import { Dices, RotateCcw } from "lucide-react";

interface Props {
  prediction: Prediction;
}

interface Bin {
  range: string;
  count: number;
  center: number;
}

function runSimulation(prediction: Prediction, numRuns: number): number[] {
  const base = prediction.probability;
  const ep = prediction.epistemicUncertainty;
  const al = prediction.aleatoricUncertainty;
  const totalSpread = (ep + al) * 50;

  const results: number[] = [];
  for (let i = 0; i < numRuns; i++) {
    // Box-Muller for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const value = base + z * totalSpread;
    results.push(Math.max(0, Math.min(100, value)));
  }
  return results;
}

function binResults(results: number[], numBins: number = 20): Bin[] {
  const bins: Bin[] = [];
  const binWidth = 100 / numBins;
  for (let i = 0; i < numBins; i++) {
    const lo = i * binWidth;
    const hi = lo + binWidth;
    bins.push({
      range: `${Math.round(lo)}–${Math.round(hi)}`,
      count: results.filter((r) => r >= lo && r < hi).length,
      center: lo + binWidth / 2,
    });
  }
  return bins;
}

function computeStats(results: number[]) {
  const sorted = [...results].sort((a, b) => a - b);
  const mean = results.reduce((s, v) => s + v, 0) / results.length;
  const p5 = sorted[Math.floor(results.length * 0.05)];
  const p25 = sorted[Math.floor(results.length * 0.25)];
  const p50 = sorted[Math.floor(results.length * 0.5)];
  const p75 = sorted[Math.floor(results.length * 0.75)];
  const p95 = sorted[Math.floor(results.length * 0.95)];
  return { mean, p5, p25, p50, p75, p95 };
}

export function MonteCarloExplorer({ prediction }: Props) {
  const [numRuns, setNumRuns] = useState(1000);
  const [results, setResults] = useState<number[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const run = useCallback(() => {
    setIsRunning(true);
    // Use requestAnimationFrame to let UI update before heavy computation
    requestAnimationFrame(() => {
      const r = runSimulation(prediction, numRuns);
      setResults(r);
      setIsRunning(false);
    });
  }, [prediction, numRuns]);

  const bins = useMemo(() => (results.length > 0 ? binResults(results) : []), [results]);
  const stats = useMemo(() => (results.length > 0 ? computeStats(results) : null), [results]);

  const maxCount = Math.max(...bins.map((b) => b.count), 1);

  return (
    <div className="atlas-panel">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">Monte Carlo Simulation</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Probabilistic outcome distribution for {prediction.title}
          </p>
        </div>
        <div className="flex gap-2">
          {results.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setResults([])}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={run}
            disabled={isRunning}
          >
            <Dices className="h-3 w-3 mr-1" />
            {isRunning ? "Running…" : results.length > 0 ? "Re-run" : "Run Simulation"}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 flex items-center gap-4">
        <span className="text-xs text-muted-foreground shrink-0">Iterations:</span>
        <Slider
          value={[numRuns]}
          onValueChange={([v]) => setNumRuns(v)}
          min={100}
          max={10000}
          step={100}
          className="flex-1"
        />
        <span className="text-xs font-mono text-card-foreground w-14 text-right">{numRuns.toLocaleString()}</span>
      </div>

      {/* Histogram */}
      {bins.length > 0 ? (
        <>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bins} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <XAxis
                  dataKey="center"
                  tick={{ fontSize: 9, fill: "hsl(215, 12%, 50%)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${Math.round(v)}%`}
                  interval={3}
                />
                <YAxis hide />
                <ReferenceLine
                  x={prediction.probability}
                  stroke="hsl(var(--primary))"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {bins.map((bin, i) => {
                    const intensity = bin.count / maxCount;
                    return (
                      <Cell
                        key={i}
                        fill="hsl(var(--primary))"
                        fillOpacity={0.2 + intensity * 0.6}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Stats summary */}
          {stats && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="rounded-md bg-secondary/50 p-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">5th–95th</p>
                <p className="text-xs font-mono font-semibold text-card-foreground">
                  {stats.p5.toFixed(1)}%–{stats.p95.toFixed(1)}%
                </p>
              </div>
              <div className="rounded-md bg-secondary/50 p-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Median</p>
                <p className="text-xs font-mono font-semibold text-card-foreground">{stats.p50.toFixed(1)}%</p>
              </div>
              <div className="rounded-md bg-secondary/50 p-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">IQR</p>
                <p className="text-xs font-mono font-semibold text-card-foreground">
                  {stats.p25.toFixed(1)}%–{stats.p75.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="h-44 flex items-center justify-center rounded-lg border border-dashed border-border/50 bg-secondary/20">
          <div className="text-center">
            <Dices className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">Click "Run Simulation" to generate</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{numRuns.toLocaleString()} iterations using Box-Muller sampling</p>
          </div>
        </div>
      )}
    </div>
  );
}
