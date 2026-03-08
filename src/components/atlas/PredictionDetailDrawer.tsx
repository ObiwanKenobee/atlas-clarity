import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { type Prediction, generateUncertaintySummary } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Clock, FileText, BarChart3, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  prediction: Prediction | null;
  open: boolean;
  onClose: () => void;
}

const statusColor = {
  strong: "text-confidence-high",
  moderate: "text-confidence-medium",
  weak: "text-confidence-low",
};

export function PredictionDetailDrawer({ prediction, open, onClose }: Props) {
  if (!prediction) return null;
  const p = prediction;
  const summary = generateUncertaintySummary(p);
  const avgAccuracy = Math.round(p.historicalAccuracy.reduce((a, b) => a + b, 0) / p.historicalAccuracy.length);

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left pb-2">
          <DrawerTitle className="text-base">{p.title} — {p.region}</DrawerTitle>
          <DrawerDescription className="text-xs">{p.forecastWindow} · Updated {p.lastUpdate}</DrawerDescription>
        </DrawerHeader>

        <Tabs defaultValue="summary" className="px-4 pb-6">
          <TabsList className="w-full grid grid-cols-4 h-9">
            <TabsTrigger value="summary" className="text-xs gap-1"><MessageSquare className="h-3 w-3" /> Summary</TabsTrigger>
            <TabsTrigger value="accuracy" className="text-xs gap-1"><BarChart3 className="h-3 w-3" /> Accuracy</TabsTrigger>
            <TabsTrigger value="variables" className="text-xs gap-1"><FileText className="h-3 w-3" /> Variables</TabsTrigger>
            <TabsTrigger value="audit" className="text-xs gap-1"><Clock className="h-3 w-3" /> Audit</TabsTrigger>
          </TabsList>

          {/* Plain Language Summary */}
          <TabsContent value="summary" className="mt-4">
            <div className="rounded-lg bg-secondary/50 p-4">
              <p className="text-sm leading-relaxed text-card-foreground">{summary}</p>
            </div>
          </TabsContent>

          {/* Historical Accuracy */}
          <TabsContent value="accuracy" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">12-month rolling accuracy</span>
              <span className="font-mono text-sm font-bold text-card-foreground">{avgAccuracy}% avg</span>
            </div>
            <div className="flex items-end gap-1.5 h-28">
              {p.historicalAccuracy.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-full rounded-t transition-all",
                      val >= 80 ? "bg-confidence-high" : val >= 60 ? "bg-confidence-medium" : "bg-confidence-low"
                    )}
                    style={{ height: `${val}%`, opacity: 0.7 }}
                  />
                  <span className="text-[9px] text-muted-foreground font-mono">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>12 mo ago</span>
              <span>Current</span>
            </div>
          </TabsContent>

          {/* Contributing Variables */}
          <TabsContent value="variables" className="mt-4">
            <div className="space-y-2.5">
              {p.contributingVariables
                .sort((a, b) => b.weight - a.weight)
                .map((v) => (
                <div key={v.name} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-card-foreground truncate">{v.name}</span>
                      <span className={cn("text-xs font-mono", statusColor[v.status])}>{v.status}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${v.weight * 100}%`, opacity: 0.7 }}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground shrink-0 w-10 text-right">
                    {(v.weight * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Audit Trail */}
          <TabsContent value="audit" className="mt-4">
            <div className="space-y-0">
              {p.auditTrail.map((entry, i) => (
                <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < p.auditTrail.length - 1 && (
                    <div className="absolute left-[7px] top-4 h-full w-px bg-border" />
                  )}
                  <div className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary bg-background" />
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-card-foreground">{entry.action}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{entry.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{entry.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}
