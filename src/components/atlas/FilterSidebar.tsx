import { predictions } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Globe, ShieldCheck, Database, AlertTriangle, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface Filters {
  regions: string[];
  confidenceLevels: ("high" | "medium" | "low")[];
  minCompleteness: number;
  minSeverity: number;
}

export const defaultFilters: Filters = {
  regions: [],
  confidenceLevels: [],
  minCompleteness: 0,
  minSeverity: 0,
};

const allRegions = [...new Set(predictions.map((p) => p.region))];
const allConfidence: { value: "high" | "medium" | "low"; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  collapsed?: boolean;
}

export function FilterSidebar({ filters, onChange, collapsed }: Props) {
  if (collapsed) return null;

  const toggleRegion = (r: string) => {
    const next = filters.regions.includes(r)
      ? filters.regions.filter((x) => x !== r)
      : [...filters.regions, r];
    onChange({ ...filters, regions: next });
  };

  const toggleConfidence = (c: "high" | "medium" | "low") => {
    const next = filters.confidenceLevels.includes(c)
      ? filters.confidenceLevels.filter((x) => x !== c)
      : [...filters.confidenceLevels, c];
    onChange({ ...filters, confidenceLevels: next });
  };

  const hasActiveFilters =
    filters.regions.length > 0 ||
    filters.confidenceLevels.length > 0 ||
    filters.minCompleteness > 0 ||
    filters.minSeverity > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(defaultFilters)}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Geography */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Globe className="h-3.5 w-3.5 text-primary" />
          <Label className="text-xs font-semibold text-card-foreground">Geography</Label>
        </div>
        <div className="space-y-2">
          {allRegions.map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                checked={filters.regions.includes(r)}
                onCheckedChange={() => toggleRegion(r)}
                className="h-3.5 w-3.5"
              />
              <span className="text-xs text-muted-foreground group-hover:text-card-foreground transition-colors">{r}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Confidence Level */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <Label className="text-xs font-semibold text-card-foreground">Confidence</Label>
        </div>
        <div className="space-y-2">
          {allConfidence.map((c) => (
            <label key={c.value} className="flex items-center gap-2 cursor-pointer group">
              <Checkbox
                checked={filters.confidenceLevels.includes(c.value)}
                onCheckedChange={() => toggleConfidence(c.value)}
                className="h-3.5 w-3.5"
              />
              <span className={cn(
                "text-xs transition-colors",
                c.value === "high" ? "text-confidence-high" :
                c.value === "medium" ? "text-confidence-medium" : "text-confidence-low"
              )}>{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Data Completeness */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Database className="h-3.5 w-3.5 text-primary" />
          <Label className="text-xs font-semibold text-card-foreground">Min Data Completeness</Label>
        </div>
        <Slider
          value={[filters.minCompleteness]}
          onValueChange={([v]) => onChange({ ...filters, minCompleteness: v })}
          max={100}
          step={5}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground mt-1 font-mono">{filters.minCompleteness}%+</p>
      </div>

      {/* Severity / Probability */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <AlertTriangle className="h-3.5 w-3.5 text-primary" />
          <Label className="text-xs font-semibold text-card-foreground">Min Risk Probability</Label>
        </div>
        <Slider
          value={[filters.minSeverity]}
          onValueChange={([v]) => onChange({ ...filters, minSeverity: v })}
          max={100}
          step={5}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground mt-1 font-mono">{filters.minSeverity}%+</p>
      </div>

      {/* Active filter count */}
      {hasActiveFilters && (
        <div className="rounded-md bg-primary/10 px-3 py-2">
          <p className="text-xs text-primary font-medium">
            {filters.regions.length + filters.confidenceLevels.length + (filters.minCompleteness > 0 ? 1 : 0) + (filters.minSeverity > 0 ? 1 : 0)} filter(s) active
          </p>
        </div>
      )}
    </div>
  );
}
