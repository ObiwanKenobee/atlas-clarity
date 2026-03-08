import { useState, useMemo } from "react";
import { predictions } from "@/data/mockData";
import { PredictionCard } from "@/components/atlas/PredictionCard";
import { UncertaintyBandChart } from "@/components/atlas/UncertaintyBandChart";
import { SensitivityChart } from "@/components/atlas/SensitivityChart";
import { DataCoveragePanel } from "@/components/atlas/DataCoveragePanel";
import { ScenarioComparison } from "@/components/atlas/ScenarioComparison";
import { ModelAgreementMeter } from "@/components/atlas/ModelAgreementMeter";
import { ConfidenceBadge } from "@/components/atlas/ConfidenceBadge";
import { RiskConfidenceScatter } from "@/components/atlas/RiskConfidenceScatter";
import { UncertaintyTimeline } from "@/components/atlas/UncertaintyTimeline";
import { UncertaintySummary } from "@/components/atlas/UncertaintySummary";
import { PredictionDetailDrawer } from "@/components/atlas/PredictionDetailDrawer";
import { FilterSidebar, defaultFilters, type Filters } from "@/components/atlas/FilterSidebar";
import { Shield, Activity, Eye, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Index = () => {
  const [selectedId, setSelectedId] = useState(predictions[0].id);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredPredictions = useMemo(() => {
    return predictions.filter((p) => {
      if (filters.regions.length > 0 && !filters.regions.includes(p.region)) return false;
      if (filters.confidenceLevels.length > 0 && !filters.confidenceLevels.includes(p.confidence)) return false;
      if (p.dataCompleteness < filters.minCompleteness) return false;
      if (p.probability < filters.minSeverity) return false;
      return true;
    });
  }, [filters]);

  const selected = predictions.find((p) => p.id === selectedId) ?? predictions[0];

  const handleCardClick = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

  const activeFilterCount =
    filters.regions.length +
    filters.confidenceLevels.length +
    (filters.minCompleteness > 0 ? 1 : 0) +
    (filters.minSeverity > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "shrink-0 border-r bg-sidebar overflow-y-auto transition-all duration-300 sticky top-0 h-screen",
          sidebarOpen ? "w-60 p-5" : "w-0 p-0 border-r-0"
        )}
      >
        {sidebarOpen && <FilterSidebar filters={filters} onChange={setFilters} />}
      </aside>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-foreground">ATLAS</h1>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Uncertainty Modeling</p>
              </div>
              {activeFilterCount > 0 && (
                <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                  {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
                </span>
              )}
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
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Active Predictions</p>
                <span className="text-xs text-muted-foreground font-mono">{filteredPredictions.length}/{predictions.length}</span>
              </div>
              {filteredPredictions.length === 0 ? (
                <div className="atlas-panel text-center py-8">
                  <p className="text-sm text-muted-foreground">No predictions match current filters</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs text-primary"
                    onClick={() => setFilters(defaultFilters)}
                  >
                    Clear filters
                  </Button>
                </div>
              ) : (
                filteredPredictions.map((p) => (
                  <PredictionCard
                    key={p.id}
                    prediction={p}
                    selected={p.id === selectedId}
                    onClick={() => handleCardClick(p.id)}
                  />
                ))
              )}
            </div>

            {/* Center column — Charts */}
            <div className="lg:col-span-5 space-y-5">
              <UncertaintySummary prediction={selected} />
              <UncertaintyBandChart mean={selected.probability} />
              <UncertaintyTimeline prediction={selected} />
              <SensitivityChart />
            </div>

            {/* Right column — Data & Scenarios */}
            <div className="lg:col-span-4 space-y-5">
              <RiskConfidenceScatter selectedId={selectedId} onSelect={(id) => handleCardClick(id)} />
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

        {/* Detail Drawer */}
        <PredictionDetailDrawer
          prediction={selected}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    </div>
  );
};

export default Index;
