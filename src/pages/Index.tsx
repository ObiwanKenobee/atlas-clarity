import { useState } from "react";
import { predictions } from "@/data/mockData";
import { PredictionCard } from "@/components/atlas/PredictionCard";
import { UncertaintyBandChart } from "@/components/atlas/UncertaintyBandChart";
import { SensitivityChart } from "@/components/atlas/SensitivityChart";
import { DataCoveragePanel } from "@/components/atlas/DataCoveragePanel";
import { ScenarioComparison } from "@/components/atlas/ScenarioComparison";
import { ModelAgreementMeter } from "@/components/atlas/ModelAgreementMeter";
import { ConfidenceBadge } from "@/components/atlas/ConfidenceBadge";
import { Shield, Activity, Eye } from "lucide-react";

const Index = () => {
  const [selectedId, setSelectedId] = useState(predictions[0].id);
  const selected = predictions.find((p) => p.id === selectedId) ?? predictions[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground">ATLAS</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Uncertainty Modeling</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-3 w-3 text-confidence-high" />
              <span>Systems nominal</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-secondary-foreground">Live monitoring</span>
            </div>
          </div>
        </div>
      </header>

      {/* Status Banner */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-[1600px] items-center gap-6 px-6 py-2 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Selected:</span>
            <span className="text-xs font-semibold text-foreground">{selected.title} — {selected.region}</span>
          </div>
          <div className="h-3 w-px bg-border shrink-0" />
          <ConfidenceBadge level={selected.confidence} size="sm" />
          <div className="h-3 w-px bg-border shrink-0" />
          <span className="text-[10px] text-muted-foreground shrink-0">Forecast: {selected.forecastWindow}</span>
          <div className="h-3 w-px bg-border shrink-0" />
          <span className="text-[10px] text-muted-foreground shrink-0">Updated {selected.lastUpdate}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] p-6">
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Left column — Prediction cards */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Active Predictions</p>
            {predictions.map((p) => (
              <PredictionCard
                key={p.id}
                prediction={p}
                selected={p.id === selectedId}
                onClick={() => setSelectedId(p.id)}
              />
            ))}
          </div>

          {/* Center column — Charts */}
          <div className="lg:col-span-5 space-y-5">
            <UncertaintyBandChart mean={selected.probability} />
            <SensitivityChart />
          </div>

          {/* Right column — Data & Scenarios */}
          <div className="lg:col-span-4 space-y-5">
            <ModelAgreementMeter
              agreement={selected.modelAgreement}
              epistemicUncertainty={selected.epistemicUncertainty}
              aleatoricUncertainty={selected.aleatoricUncertainty}
              freshnessScore={selected.freshnessScore}
            />
            <ScenarioComparison />
            <DataCoveragePanel />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
