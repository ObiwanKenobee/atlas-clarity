import { generateUncertaintySummary, type Prediction } from "@/data/mockData";
import { MessageSquare } from "lucide-react";

interface Props {
  prediction: Prediction;
}

export function UncertaintySummary({ prediction }: Props) {
  const summary = generateUncertaintySummary(prediction);

  return (
    <div className="atlas-panel">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-card-foreground">Plain Language Summary</h3>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
    </div>
  );
}
