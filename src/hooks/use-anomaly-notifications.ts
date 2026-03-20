import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { Prediction } from "@/data/mockData";

interface Anomaly {
  id: string;
  severity: "critical" | "warning";
  title: string;
  region: string;
}

function detectCriticalAnomalies(predictions: Prediction[]): Anomaly[] {
  const anomalies: Anomaly[] = [];

  for (const p of predictions) {
    if (p.modelAgreement < 0.5) {
      anomalies.push({
        id: `${p.id}-model-div`,
        severity: "critical",
        title: `Model divergence: ${(p.modelAgreement * 100).toFixed(0)}% agreement`,
        region: p.region,
      });
    }
    if (p.probability > 70 && p.confidence === "low") {
      anomalies.push({
        id: `${p.id}-risk-conf`,
        severity: "critical",
        title: `High risk (${p.probability}%) with low confidence`,
        region: p.region,
      });
    }
    if (p.epistemicUncertainty > 0.5) {
      anomalies.push({
        id: `${p.id}-epistemic`,
        severity: "warning",
        title: `High epistemic uncertainty (${(p.epistemicUncertainty * 100).toFixed(0)}%)`,
        region: p.region,
      });
    }
    if (p.dataCompleteness < 40) {
      anomalies.push({
        id: `${p.id}-coverage`,
        severity: "warning",
        title: `Data coverage critically low (${p.dataCompleteness}%)`,
        region: p.region,
      });
    }
  }

  return anomalies;
}

export function useAnomalyNotifications(predictions: Prediction[], enabled: boolean) {
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) {
      notifiedRef.current.clear();
      return;
    }

    const anomalies = detectCriticalAnomalies(predictions);

    for (const a of anomalies) {
      if (notifiedRef.current.has(a.id)) continue;
      notifiedRef.current.add(a.id);

      if (a.severity === "critical") {
        toast.error(`🚨 ${a.region}`, {
          description: a.title,
          duration: 6000,
        });
      } else {
        toast.warning(`⚠️ ${a.region}`, {
          description: a.title,
          duration: 4000,
        });
      }
    }

    // Prune old notifications that no longer apply
    const currentIds = new Set(anomalies.map((a) => a.id));
    for (const id of notifiedRef.current) {
      if (!currentIds.has(id)) notifiedRef.current.delete(id);
    }
  }, [predictions, enabled]);
}
