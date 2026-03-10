import { useMemo, useState } from "react";
import type { Prediction } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { GitBranch } from "lucide-react";

interface Props {
  prediction: Prediction;
}

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  weight: number;
  status: "strong" | "moderate" | "weak";
  uncertainty: number;
}

interface Edge {
  from: string;
  to: string;
  strength: number;
}

const statusColor = {
  strong: "hsl(var(--confidence-high))",
  moderate: "hsl(var(--confidence-medium))",
  weak: "hsl(var(--confidence-low))",
};

const statusBg = {
  strong: "bg-confidence-high/20 border-confidence-high/40",
  moderate: "bg-confidence-medium/20 border-confidence-medium/40",
  weak: "bg-confidence-low/20 border-confidence-low/40",
};

export function BayesianNetworkGraph({ prediction }: Props) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const vars = prediction.contributingVariables;
    const outputNode: Node = {
      id: "output",
      label: prediction.title,
      x: 400,
      y: 200,
      weight: 1,
      status: prediction.confidence === "high" ? "strong" : prediction.confidence === "medium" ? "moderate" : "weak",
      uncertainty: prediction.epistemicUncertainty,
    };

    // Position input nodes in a semicircle on the left
    const inputNodes: Node[] = vars.map((v, i) => {
      const angle = ((i / (vars.length - 1 || 1)) * Math.PI * 0.8) - Math.PI * 0.4;
      return {
        id: v.name,
        label: v.name,
        x: 120 + Math.cos(angle) * 60,
        y: 200 + Math.sin(angle) * 150,
        weight: v.weight,
        status: v.status,
        uncertainty: v.status === "weak" ? 0.7 : v.status === "moderate" ? 0.4 : 0.15,
      };
    });

    // Create intermediate aggregation nodes
    const midNodes: Node[] = [];
    if (vars.length >= 4) {
      midNodes.push({
        id: "agg-primary",
        label: "Primary Factors",
        x: 270,
        y: 130,
        weight: 0.8,
        status: vars[0].status,
        uncertainty: prediction.epistemicUncertainty * 0.7,
      });
      midNodes.push({
        id: "agg-secondary",
        label: "Secondary Factors",
        x: 270,
        y: 270,
        weight: 0.5,
        status: vars[vars.length - 1].status,
        uncertainty: prediction.epistemicUncertainty * 1.2,
      });
    }

    const allNodes = [...inputNodes, ...midNodes, outputNode];

    const allEdges: Edge[] = [];
    if (midNodes.length === 2) {
      const half = Math.ceil(vars.length / 2);
      vars.forEach((v, i) => {
        allEdges.push({
          from: v.name,
          to: i < half ? "agg-primary" : "agg-secondary",
          strength: v.weight,
        });
      });
      allEdges.push({ from: "agg-primary", to: "output", strength: 0.8 });
      allEdges.push({ from: "agg-secondary", to: "output", strength: 0.5 });
    } else {
      vars.forEach((v) => {
        allEdges.push({ from: v.name, to: "output", strength: v.weight });
      });
    }

    return { nodes: allNodes, edges: allEdges };
  }, [prediction]);

  const getNode = (id: string) => nodes.find((n) => n.id === id);
  const isConnected = (nodeId: string) => {
    if (!hoveredNode) return true;
    if (nodeId === hoveredNode) return true;
    return edges.some(
      (e) => (e.from === hoveredNode && e.to === nodeId) || (e.to === hoveredNode && e.from === nodeId)
    );
  };

  return (
    <div className="atlas-panel">
      <div className="flex items-center gap-2 mb-3">
        <GitBranch className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Causal Network
        </h3>
      </div>

      <svg viewBox="0 0 480 400" className="w-full h-auto" style={{ minHeight: 220 }}>
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--muted-foreground))" opacity="0.5" />
          </marker>
          {nodes.map((n) => (
            <filter key={`blur-${n.id}`} id={`glow-${n.id}`}>
              <feGaussianBlur stdDeviation={n.uncertainty * 6} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Edges */}
        {edges.map((e, i) => {
          const from = getNode(e.from);
          const to = getNode(e.to);
          if (!from || !to) return null;
          const active = hoveredNode ? (e.from === hoveredNode || e.to === hoveredNode) : true;
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={active ? "hsl(var(--primary))" : "hsl(var(--border))"}
              strokeWidth={Math.max(1, e.strength * 3)}
              strokeOpacity={active ? 0.6 : 0.15}
              markerEnd="url(#arrowhead)"
              className="transition-all duration-300"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((n) => {
          const connected = isConnected(n.id);
          const isOutput = n.id === "output";
          const r = isOutput ? 28 : n.id.startsWith("agg-") ? 22 : 16 + n.weight * 8;
          return (
            <g
              key={n.id}
              className="cursor-pointer transition-all duration-300"
              opacity={connected ? 1 : 0.25}
              onMouseEnter={() => setHoveredNode(n.id)}
              onMouseLeave={() => setHoveredNode(null)}
              filter={`url(#glow-${n.id})`}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={r}
                fill={statusColor[n.status]}
                fillOpacity={0.2}
                stroke={statusColor[n.status]}
                strokeWidth={hoveredNode === n.id ? 2.5 : 1.5}
              />
              <circle cx={n.x} cy={n.y} r={r * 0.5} fill={statusColor[n.status]} fillOpacity={0.6} />
              {isOutput && (
                <text
                  x={n.x}
                  y={n.y + r + 14}
                  textAnchor="middle"
                  className="text-[9px] fill-foreground font-semibold"
                >
                  {n.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-2 space-y-1.5">
        {prediction.contributingVariables
          .sort((a, b) => b.weight - a.weight)
          .map((v) => (
            <div
              key={v.name}
              className={cn(
                "flex items-center justify-between px-2 py-1 rounded text-xs transition-all",
                hoveredNode === v.name ? "bg-accent" : ""
              )}
              onMouseEnter={() => setHoveredNode(v.name)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={cn("h-2 w-2 rounded-full shrink-0", statusBg[v.status])} style={{ backgroundColor: statusColor[v.status] }} />
                <span className="truncate text-card-foreground">{v.name}</span>
              </div>
              <span className="font-mono text-muted-foreground shrink-0 ml-2">{(v.weight * 100).toFixed(0)}%</span>
            </div>
          ))}
      </div>
    </div>
  );
}
