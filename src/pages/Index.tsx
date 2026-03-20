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
import { RegionRiskMap } from "@/components/atlas/RegionRiskMap";
import { MonteCarloExplorer } from "@/components/atlas/MonteCarloExplorer";
import { ConfidenceDriftTimeline } from "@/components/atlas/ConfidenceDriftTimeline";
import { ValueOfInformation } from "@/components/atlas/ValueOfInformation";
import { ExportReport } from "@/components/atlas/ExportReport";
import { BayesianNetworkGraph } from "@/components/atlas/BayesianNetworkGraph";
import { AnomalyExplainer } from "@/components/atlas/AnomalyExplainer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRealtimeSimulation } from "@/hooks/use-realtime-simulation";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useAnomalyNotifications } from "@/hooks/use-anomaly-notifications";
import { Shield, Activity, Eye, SlidersHorizontal, X, ChevronDown, ChevronRight, Play, Pause, Radio, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

function CollapsibleSection({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-1.5 w-full py-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

const Index = () => {
  const [selectedId, setSelectedId] = useState(predictions[0].id);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [simEnabled, setSimEnabled] = useState(false);
  const isMobile = useIsMobile();

  const { livePredictions, events, tickCount, reset } = useRealtimeSimulation(simEnabled, 4000);
  const activePredictions = simEnabled ? livePredictions : predictions;

  const filteredPredictions = useMemo(() => {
    return activePredictions.filter((p) => {
      if (filters.regions.length > 0 && !filters.regions.includes(p.region)) return false;
      if (filters.confidenceLevels.length > 0 && !filters.confidenceLevels.includes(p.confidence)) return false;
      if (p.dataCompleteness < filters.minCompleteness) return false;
      if (p.probability < filters.minSeverity) return false;
      return true;
    });
  }, [filters, activePredictions]);

  const selected = activePredictions.find((p) => p.id === selectedId) ?? activePredictions[0];

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
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside
          className={cn(
            "shrink-0 border-r bg-sidebar overflow-y-auto transition-all duration-300 sticky top-0 h-screen",
            sidebarOpen ? "w-60 p-5" : "w-0 p-0 border-r-0"
          )}
        >
          {sidebarOpen && <FilterSidebar filters={filters} onChange={setFilters} />}
        </aside>
      )}

      {/* Mobile Filter Sheet */}
      {isMobile && (
        <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
          <SheetContent side="left" className="w-72 p-5">
            <FilterSidebar filters={filters} onChange={setFilters} />
          </SheetContent>
        </Sheet>
      )}

      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => isMobile ? setMobileFilterOpen(true) : setSidebarOpen(!sidebarOpen)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                {!isMobile && sidebarOpen ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-foreground">ATLAS</h1>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:block">Uncertainty Modeling</p>
              </div>
              {activeFilterCount > 0 && (
                <span className="ml-1 md:ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                  {activeFilterCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {/* Simulation toggle */}
              <Button
                variant={simEnabled ? "default" : "ghost"}
                size="sm"
                onClick={() => { simEnabled ? (setSimEnabled(false), reset()) : setSimEnabled(true); }}
                className={cn("h-8 gap-1.5 text-xs", simEnabled && "animate-pulse")}
              >
                {simEnabled ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                <span className="hidden sm:inline">{simEnabled ? "Stop Sim" : "Simulate"}</span>
              </Button>

              {simEnabled && (
                <div className="flex items-center gap-1.5 text-[10px] text-confidence-medium font-mono">
                  <Radio className="h-3 w-3 animate-pulse" />
                  <span className="hidden sm:inline">Tick {tickCount}</span>
                </div>
              )}

              <ThemeToggle />

              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-3 w-3 text-confidence-high" />
                <span>Nominal</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 rounded-full bg-secondary px-2 md:px-3 py-1.5">
                <Eye className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] md:text-xs text-secondary-foreground">Live</span>
              </div>
            </div>
          </div>
        </header>

        {/* Live Events Ticker */}
        {simEnabled && events.length > 0 && (
          <div className="border-b bg-confidence-medium/5 overflow-hidden">
            <div className="mx-auto max-w-[1600px] px-4 md:px-6 py-1.5 flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-wider text-confidence-medium font-semibold shrink-0">Live</span>
              <div className="overflow-x-auto flex gap-4 text-xs text-muted-foreground">
                {events.slice(0, 5).map((e) => (
                  <span key={e.id} className="shrink-0 flex items-center gap-1.5">
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      e.delta > 0 ? "bg-confidence-low" : "bg-confidence-high"
                    )} />
                    {e.message}
                    <span className="font-mono text-[10px]">
                      ({e.delta > 0 ? "+" : ""}{e.delta}%)
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Status Banner */}
        <div className="border-b bg-muted/30">
          <div className="mx-auto flex max-w-[1600px] items-center gap-3 md:gap-6 px-4 md:px-6 py-2 overflow-x-auto">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">Selected:</span>
              <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">{selected.title} — {selected.region}</span>
            </div>
            <div className="h-3 w-px bg-border shrink-0" />
            <ConfidenceBadge level={selected.confidence} size="sm" />
            <div className="h-3 w-px bg-border shrink-0 hidden sm:block" />
            <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:inline">Forecast: {selected.forecastWindow}</span>
          </div>
        </div>

        {/* Main Content */}
        <main className="mx-auto max-w-[1600px] p-4 md:p-6">
          {/* Mobile: horizontal swipeable cards */}
          {isMobile && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Active Predictions</p>
                <span className="text-xs text-muted-foreground font-mono">{filteredPredictions.length}/{activePredictions.length}</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4">
                {filteredPredictions.map((p) => (
                  <div key={p.id} className="snap-center shrink-0 w-[280px]">
                    <PredictionCard prediction={p} selected={p.id === selectedId} onClick={() => handleCardClick(p.id)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-12">
            {/* Left column — Prediction cards (desktop only) */}
            {!isMobile && (
              <div className="lg:col-span-3 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Active Predictions</p>
                  <span className="text-xs text-muted-foreground font-mono">{filteredPredictions.length}/{activePredictions.length}</span>
                </div>
                {filteredPredictions.length === 0 ? (
                  <div className="atlas-panel text-center py-8">
                    <p className="text-sm text-muted-foreground">No predictions match current filters</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-xs text-primary" onClick={() => setFilters(defaultFilters)}>
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  filteredPredictions.map((p) => (
                    <PredictionCard key={p.id} prediction={p} selected={p.id === selectedId} onClick={() => handleCardClick(p.id)} />
                  ))
                )}
              </div>
            )}

            {/* Center column — Charts */}
            <div className={cn("space-y-5", isMobile ? "col-span-full" : "lg:col-span-5")}>
              <UncertaintySummary prediction={selected} />

              <CollapsibleSection title="Uncertainty Distribution" defaultOpen={!isMobile}>
                <UncertaintyBandChart mean={selected.probability} />
              </CollapsibleSection>

              <CollapsibleSection title="Timeline & Drift" defaultOpen={!isMobile}>
                <UncertaintyTimeline prediction={selected} />
                <ConfidenceDriftTimeline prediction={selected} />
              </CollapsibleSection>

              <CollapsibleSection title="Monte Carlo Simulation">
                <MonteCarloExplorer prediction={selected} />
              </CollapsibleSection>

              <CollapsibleSection title="Anomaly Analysis" defaultOpen={!isMobile}>
                <AnomalyExplainer prediction={selected} />
              </CollapsibleSection>

              <CollapsibleSection title="Sensitivity Analysis" defaultOpen={false}>
                <SensitivityChart />
              </CollapsibleSection>
            </div>

            {/* Right column — Data & Scenarios */}
            <div className={cn("space-y-5", isMobile ? "col-span-full" : "lg:col-span-4")}>
              <CollapsibleSection title="Region Risk Map" defaultOpen={!isMobile}>
                <RegionRiskMap selectedId={selectedId} onSelect={(id) => handleCardClick(id)} />
              </CollapsibleSection>

              <CollapsibleSection title="Risk vs Confidence">
                <RiskConfidenceScatter selectedId={selectedId} onSelect={(id) => handleCardClick(id)} />
              </CollapsibleSection>

              <ModelAgreementMeter
                agreement={selected.modelAgreement}
                epistemicUncertainty={selected.epistemicUncertainty}
                aleatoricUncertainty={selected.aleatoricUncertainty}
                freshnessScore={selected.freshnessScore}
              />

              <CollapsibleSection title="Causal Network" defaultOpen={!isMobile}>
                <BayesianNetworkGraph prediction={selected} />
              </CollapsibleSection>

              <ValueOfInformation prediction={selected} />

              <CollapsibleSection title="Scenarios & Coverage" defaultOpen={false}>
                <ScenarioComparison />
                <DataCoveragePanel />
              </CollapsibleSection>

              <ExportReport prediction={selected} />
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
