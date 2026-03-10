import { useState, useEffect, useCallback } from "react";
import type { Prediction } from "@/data/mockData";
import { predictions as basePredictions } from "@/data/mockData";

interface SimulationEvent {
  id: string;
  timestamp: Date;
  predictionId: string;
  type: "probability_shift" | "confidence_change" | "data_update" | "model_retrain" | "sensor_alert";
  message: string;
  delta: number;
}

const eventTemplates = [
  { type: "probability_shift" as const, messages: ["Probability adjusted based on new sensor data", "Forecast model recalibrated", "Bayesian update from incoming telemetry"] },
  { type: "data_update" as const, messages: ["New data source integrated", "Coverage gap partially filled", "Data freshness improved"] },
  { type: "model_retrain" as const, messages: ["Model retrained with latest batch", "Ensemble weights updated", "Cross-validation scores refreshed"] },
  { type: "sensor_alert" as const, messages: ["Sensor anomaly detected in monitoring network", "Data latency spike observed", "Intermittent sensor connectivity"] },
];

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export function useRealtimeSimulation(enabled: boolean, intervalMs: number = 5000) {
  const [livePredictions, setLivePredictions] = useState<Prediction[]>(() =>
    basePredictions.map((p) => ({ ...p }))
  );
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [tickCount, setTickCount] = useState(0);

  const simulateTick = useCallback(() => {
    setLivePredictions((prev) =>
      prev.map((p) => {
        const drift = (Math.random() - 0.5) * 4;
        const completeDrift = (Math.random() - 0.5) * 2;
        const freshDrift = (Math.random() - 0.5) * 0.04;
        const epDrift = (Math.random() - 0.5) * 0.03;

        return {
          ...p,
          probability: clamp(Math.round(p.probability + drift), 1, 99),
          dataCompleteness: clamp(Math.round(p.dataCompleteness + completeDrift), 5, 100),
          freshnessScore: clamp(Number((p.freshnessScore + freshDrift).toFixed(2)), 0.1, 1),
          epistemicUncertainty: clamp(Number((p.epistemicUncertainty + epDrift).toFixed(3)), 0.05, 0.8),
          modelAgreement: clamp(
            Number((p.modelAgreement + (Math.random() - 0.5) * 0.03).toFixed(2)),
            0.2,
            0.99
          ),
        };
      })
    );

    // Generate random event
    if (Math.random() > 0.4) {
      const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
      const pred = basePredictions[Math.floor(Math.random() * basePredictions.length)];
      const delta = Number(((Math.random() - 0.5) * 6).toFixed(1));
      const newEvent: SimulationEvent = {
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date(),
        predictionId: pred.id,
        type: template.type,
        message: `${pred.region}: ${template.messages[Math.floor(Math.random() * template.messages.length)]}`,
        delta,
      };
      setEvents((prev) => [newEvent, ...prev].slice(0, 20));
    }

    setTickCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(simulateTick, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, simulateTick]);

  const reset = useCallback(() => {
    setLivePredictions(basePredictions.map((p) => ({ ...p })));
    setEvents([]);
    setTickCount(0);
  }, []);

  return { livePredictions, events, tickCount, reset };
}
