import { useMemo } from "react";
import type { Prediction } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, AlertOctagon, TrendingDown, TrendingUp, Database } from "lucide-react";

interface Props {
  prediction: Prediction;
}

interface Anomaly {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  explanation: string;
  metric?: string;
}

const severityStyles = {
  critical: {
    border: "border-destructive/40",
    bg: "bg-destructive/10",
    icon: AlertOctagon,
    iconClass: "text-destructive",
    label: "Critical",
    labelClass: "bg-destructive/15 text-destructive",
  },
  warning: {
    border: "border-confidence-medium/40",
    bg: "bg-confidence-medium/10",
    icon: AlertTriangle,
    iconClass: "text-confidence-medium",
    label: "Warning",
    labelClass: "bg-confidence-medium/15 text-confidence-medium",
  },
  info: {
    border: "border-primary/40",
    bg: "bg-primary/10",
    icon: Info,
    iconClass: "text-primary",
    label: "Info",
    labelClass: "bg-primary/15 text-primary",
  },
};

function detectAnomalies(p: Prediction): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // Model divergence
  if (p.modelAgreement < 0.5) {
    anomalies.push({
      id: "model-divergence",
      severity: "critical",
      title: "Significant Model Divergence",
      explanation: `Forecasting models show only ${(p.modelAgreement * 100).toFixed(0)}% agreement — well below the 70% reliability threshold. This means different modeling approaches are producing substantially different predictions, suggesting the underlying system dynamics may be poorly understood or that input data is inconsistent across models.`,
      metric: `${(p.modelAgreement * 100).toFixed(0)}% agreement`,
    });
  } else if (p.modelAgreement < 0.7) {
    anomalies.push({
      id: "model-divergence",
      severity: "warning",
      title: "Moderate Model Disagreement",
      explanation: `Models agree at ${(p.modelAgreement * 100).toFixed(0)}%, indicating some divergence in predictions. This may resolve as more data becomes available, but current estimates should be treated with caution.`,
      metric: `${(p.modelAgreement * 100).toFixed(0)}% agreement`,
    });
  }

  // Data staleness
  if (p.freshnessScore < 0.65) {
    anomalies.push({
      id: "stale-data",
      severity: "warning",
      title: "Data Freshness Degraded",
      explanation: `The freshness score of ${(p.freshnessScore * 100).toFixed(0)}% indicates some input data sources are stale. Predictions based on outdated information may not reflect recent ground-truth changes. Last update was ${p.lastUpdate}.`,
      metric: `${(p.freshnessScore * 100).toFixed(0)}% fresh`,
    });
  }

  // High epistemic uncertainty
  if (p.epistemicUncertainty > 0.4) {
    anomalies.push({
      id: "epistemic-gap",
      severity: "critical",
      title: "Large Knowledge Gaps Detected",
      explanation: `Epistemic uncertainty is ${(p.epistemicUncertainty * 100).toFixed(0)}% — indicating substantial gaps in the available data or model knowledge. Unlike natural variability, this uncertainty can be reduced by acquiring more or better data. Key source: ${p.uncertaintySource}.`,
      metric: `${(p.epistemicUncertainty * 100).toFixed(0)}% epistemic`,
    });
  } else if (p.epistemicUncertainty > 0.25) {
    anomalies.push({
      id: "epistemic-gap",
      severity: "info",
      title: "Moderate Knowledge Uncertainty",
      explanation: `Epistemic uncertainty at ${(p.epistemicUncertainty * 100).toFixed(0)}% suggests some room for improvement through additional data collection.`,
      metric: `${(p.epistemicUncertainty * 100).toFixed(0)}% epistemic`,
    });
  }

  // Accuracy trend
  const recent = p.historicalAccuracy.slice(-3);
  const earlier = p.historicalAccuracy.slice(0, 3);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  const trend = recentAvg - earlierAvg;

  if (trend < -5) {
    anomalies.push({
      id: "accuracy-decline",
      severity: "warning",
      title: "Declining Prediction Accuracy",
      explanation: `Recent accuracy (${recentAvg.toFixed(0)}%) has dropped ${Math.abs(trend).toFixed(0)} points compared to earlier periods (${earlierAvg.toFixed(0)}%). This may indicate changing system dynamics that the model hasn't adapted to.`,
      metric: `${trend.toFixed(0)}pp trend`,
    });
  } else if (trend > 5) {
    anomalies.push({
      id: "accuracy-improve",
      severity: "info",
      title: "Improving Prediction Accuracy",
      explanation: `Accuracy has improved by ${trend.toFixed(0)} points recently, suggesting model calibration or data quality improvements are having a positive effect.`,
      metric: `+${trend.toFixed(0)}pp trend`,
    });
  }

  // High risk + low confidence
  if (p.probability > 50 && p.confidence === "low") {
    anomalies.push({
      id: "high-risk-low-conf",
      severity: "critical",
      title: "High Risk with Low Confidence",
      explanation: `This prediction shows ${p.probability}% probability but with low confidence. The combination means we're fairly uncertain about a potentially serious outcome — this requires immediate attention to reduce uncertainty through data acquisition.`,
      metric: `${p.probability}% @ low conf`,
    });
  }

  // Data completeness
  if (p.dataCompleteness < 50) {
    anomalies.push({
      id: "data-gap",
      severity: "warning",
      title: "Significant Data Gaps",
      explanation: `Only ${p.dataCompleteness}% of expected data inputs are available. Predictions are operating with less than half the intended information, which substantially increases forecast uncertainty.`,
      metric: `${p.dataCompleteness}% complete`,
    });
  }

  // Weak variables
  const weakVars = p.contributingVariables.filter((v) => v.status === "weak");
  if (weakVars.length >= 2) {
    anomalies.push({
      id: "weak-vars",
      severity: "info",
      title: `${weakVars.length} Weak Contributing Variables`,
      explanation: `${weakVars.map((v) => v.name).join(", ")} are all reporting weak signal quality. This cluster of weak inputs compounds uncertainty in the final prediction.`,
      metric: `${weakVars.length} weak inputs`,
    });
  }

  return anomalies.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });
}

export function AnomalyExplainer({ prediction }: Props) {
  const anomalies = useMemo(() => detectAnomalies(prediction), [prediction]);

  if (anomalies.length === 0) {
    return (
      <div className="atlas-panel">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Anomaly Analysis
          </h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">No anomalies detected for this prediction.</p>
      </div>
    );
  }

  const criticalCount = anomalies.filter((a) => a.severity === "critical").length;
  const warningCount = anomalies.filter((a) => a.severity === "warning").length;

  return (
    <div className="atlas-panel">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-confidence-medium" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Anomaly Analysis
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {criticalCount > 0 && (
            <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-medium text-destructive">
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="rounded-full bg-confidence-medium/15 px-2 py-0.5 text-[10px] font-medium text-confidence-medium">
              {warningCount} warning
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        {anomalies.map((a) => {
          const style = severityStyles[a.severity];
          const Icon = style.icon;
          return (
            <div key={a.id} className={cn("rounded-lg border p-3", style.border, style.bg)}>
              <div className="flex items-start gap-2">
                <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", style.iconClass)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-card-foreground">{a.title}</span>
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-medium", style.labelClass)}>
                      {style.label}
                    </span>
                    {a.metric && (
                      <span className="font-mono text-[10px] text-muted-foreground ml-auto shrink-0">{a.metric}</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{a.explanation}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
