export interface Prediction {
  id: string;
  title: string;
  region: string;
  probability: number;
  confidence: "high" | "medium" | "low";
  dataCompleteness: number;
  uncertaintySource: string;
  forecastWindow: string;
  lastUpdate: string;
  epistemicUncertainty: number;
  aleatoricUncertainty: number;
  modelAgreement: number;
  freshnessScore: number;
  populationExposure: number;
  historicalAccuracy: number[];
  auditTrail: AuditEntry[];
  contributingVariables: ContributingVariable[];
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  detail: string;
}

export interface ContributingVariable {
  name: string;
  weight: number;
  status: "strong" | "moderate" | "weak";
}

export interface SensitivityVar {
  name: string;
  impact: number;
  direction: "positive" | "negative";
}

export interface Scenario {
  name: string;
  probability: number;
  color: string;
  description: string;
}

export interface DataSource {
  name: string;
  status: "good" | "partial" | "missing" | "unknown";
  coverage: number;
  latency: string;
  lastUpdate: string;
}

export interface DistributionPoint {
  x: number;
  y: number;
  lower: number;
  upper: number;
  tailLower: number;
  tailUpper: number;
}

export interface UncertaintyTimePoint {
  day: number;
  label: string;
  probability: number;
  upper: number;
  lower: number;
  epistemic: number;
  aleatoric: number;
}

export const predictions: Prediction[] = [
  {
    id: "flood-nairobi",
    title: "Urban Flood Risk",
    region: "Nairobi Basin",
    probability: 38,
    confidence: "medium",
    dataCompleteness: 67,
    uncertaintySource: "Missing rainfall sensor coverage in east corridor",
    forecastWindow: "Next 14 days",
    lastUpdate: "2 hours ago",
    epistemicUncertainty: 0.34,
    aleatoricUncertainty: 0.21,
    modelAgreement: 0.72,
    freshnessScore: 0.81,
    populationExposure: 2400000,
    historicalAccuracy: [72, 68, 74, 71, 69, 75, 78, 73, 70, 76, 74, 72],
    auditTrail: [
      { timestamp: "2026-03-08 10:30", action: "Model retrained", detail: "Incorporated March satellite imagery batch" },
      { timestamp: "2026-03-08 08:15", action: "Data ingestion", detail: "18/31 rainfall stations reporting" },
      { timestamp: "2026-03-07 22:00", action: "Confidence downgrade", detail: "East corridor sensors went offline" },
      { timestamp: "2026-03-07 14:00", action: "Scenario update", detail: "Extreme rainfall scenario probability raised to 61%" },
    ],
    contributingVariables: [
      { name: "72-hour rainfall estimate", weight: 0.82, status: "moderate" },
      { name: "Drainage blockage severity", weight: 0.71, status: "weak" },
      { name: "Upstream river discharge", weight: 0.63, status: "strong" },
      { name: "Soil saturation estimate", weight: 0.48, status: "moderate" },
      { name: "Informal settlement density", weight: 0.54, status: "strong" },
    ],
  },
  {
    id: "infra-lagos",
    title: "Infrastructure Failure",
    region: "Lagos Mainland",
    probability: 52,
    confidence: "low",
    dataCompleteness: 43,
    uncertaintySource: "Structural monitoring gaps in 3 critical zones",
    forecastWindow: "Next 30 days",
    lastUpdate: "6 hours ago",
    epistemicUncertainty: 0.58,
    aleatoricUncertainty: 0.15,
    modelAgreement: 0.45,
    freshnessScore: 0.62,
    populationExposure: 5100000,
    historicalAccuracy: [55, 52, 48, 51, 47, 53, 50, 49, 54, 46, 52, 50],
    auditTrail: [
      { timestamp: "2026-03-08 06:00", action: "Alert escalation", detail: "Model divergence exceeded threshold" },
      { timestamp: "2026-03-07 18:30", action: "Data gap flagged", detail: "Zone C structural sensors offline for 48h" },
      { timestamp: "2026-03-07 09:00", action: "Baseline recalculated", detail: "New population density data integrated" },
    ],
    contributingVariables: [
      { name: "Structural load index", weight: 0.77, status: "weak" },
      { name: "Rainfall accumulation", weight: 0.65, status: "moderate" },
      { name: "Traffic vibration data", weight: 0.52, status: "weak" },
      { name: "Maintenance records", weight: 0.41, status: "weak" },
      { name: "Ground subsidence rate", weight: 0.38, status: "moderate" },
    ],
  },
  {
    id: "disease-dhaka",
    title: "Disease Spread Risk",
    region: "Dhaka Metro",
    probability: 24,
    confidence: "high",
    dataCompleteness: 89,
    uncertaintySource: "Minor lag in clinical reporting from rural clinics",
    forecastWindow: "Next 21 days",
    lastUpdate: "45 min ago",
    epistemicUncertainty: 0.12,
    aleatoricUncertainty: 0.31,
    modelAgreement: 0.91,
    freshnessScore: 0.95,
    populationExposure: 8900000,
    historicalAccuracy: [88, 85, 87, 90, 86, 89, 91, 87, 88, 92, 90, 89],
    auditTrail: [
      { timestamp: "2026-03-08 11:15", action: "Data ingestion", detail: "Clinical reports from 94% of facilities received" },
      { timestamp: "2026-03-08 09:00", action: "Model update", detail: "Seasonal adjustment applied for monsoon pre-season" },
      { timestamp: "2026-03-07 20:00", action: "Confidence upgrade", detail: "New surveillance data improved coverage to 89%" },
    ],
    contributingVariables: [
      { name: "Clinical case reports", weight: 0.88, status: "strong" },
      { name: "Water quality index", weight: 0.72, status: "strong" },
      { name: "Population density", weight: 0.61, status: "strong" },
      { name: "Sanitation coverage", weight: 0.55, status: "moderate" },
      { name: "Vector density estimate", weight: 0.43, status: "moderate" },
    ],
  },
  {
    id: "crop-punjab",
    title: "Crop Loss Probability",
    region: "Punjab Agricultural Belt",
    probability: 61,
    confidence: "medium",
    dataCompleteness: 71,
    uncertaintySource: "Satellite imagery delayed due to cloud cover",
    forecastWindow: "Next 60 days",
    lastUpdate: "4 hours ago",
    epistemicUncertainty: 0.29,
    aleatoricUncertainty: 0.38,
    modelAgreement: 0.68,
    freshnessScore: 0.73,
    populationExposure: 3200000,
    historicalAccuracy: [65, 62, 67, 64, 60, 63, 66, 61, 68, 64, 62, 65],
    auditTrail: [
      { timestamp: "2026-03-08 08:00", action: "Data delay", detail: "Satellite pass obscured by cloud cover, retry in 6h" },
      { timestamp: "2026-03-07 16:00", action: "Model update", detail: "Soil moisture sensors integrated from 4 new stations" },
      { timestamp: "2026-03-07 10:00", action: "Scenario added", detail: "Irrigation intervention scenario modeled" },
    ],
    contributingVariables: [
      { name: "Soil moisture level", weight: 0.79, status: "moderate" },
      { name: "Temperature forecast", weight: 0.68, status: "strong" },
      { name: "Satellite NDVI index", weight: 0.64, status: "weak" },
      { name: "Irrigation availability", weight: 0.51, status: "moderate" },
      { name: "Pest pressure index", weight: 0.39, status: "moderate" },
    ],
  },
];

export const sensitivityVars: SensitivityVar[] = [
  { name: "72-hour rainfall estimate", impact: 0.82, direction: "positive" },
  { name: "Drainage blockage severity", impact: 0.71, direction: "positive" },
  { name: "Upstream river discharge", impact: 0.63, direction: "positive" },
  { name: "Informal settlement density", impact: 0.54, direction: "positive" },
  { name: "Soil saturation estimate", impact: 0.48, direction: "positive" },
  { name: "Emergency response readiness", impact: -0.35, direction: "negative" },
  { name: "Drainage maintenance status", impact: -0.29, direction: "negative" },
];

export const scenarios: Scenario[] = [
  { name: "Baseline", probability: 38, color: "hsl(199, 89%, 48%)", description: "Current conditions maintained" },
  { name: "Extreme Rainfall", probability: 61, color: "hsl(0, 72%, 55%)", description: "Rainfall exceeds seasonal band by 40%" },
  { name: "Improved Drainage", probability: 24, color: "hsl(152, 69%, 45%)", description: "Emergency drainage response activated" },
  { name: "Data Corrected", probability: 44, color: "hsl(45, 93%, 55%)", description: "Missing sensor data reconstructed" },
];

export const dataSources: DataSource[] = [
  { name: "Rainfall Stations", status: "partial", coverage: 58, latency: "2h", lastUpdate: "2 hours ago" },
  { name: "River Gauge Network", status: "partial", coverage: 72, latency: "9h", lastUpdate: "9 hours ago" },
  { name: "Satellite Imagery", status: "good", coverage: 91, latency: "30m", lastUpdate: "30 min ago" },
  { name: "Ground Sensors", status: "missing", coverage: 23, latency: "N/A", lastUpdate: "3 days ago" },
  { name: "Weather Models", status: "good", coverage: 95, latency: "1h", lastUpdate: "1 hour ago" },
  { name: "Drainage Monitoring", status: "unknown", coverage: 0, latency: "N/A", lastUpdate: "Unknown" },
  { name: "Population Density", status: "good", coverage: 88, latency: "24h", lastUpdate: "1 day ago" },
  { name: "Soil Moisture Sensors", status: "partial", coverage: 64, latency: "4h", lastUpdate: "4 hours ago" },
];

// Generate distribution curve
export function generateDistribution(mean: number, spread: number): DistributionPoint[] {
  const points: DistributionPoint[] = [];
  for (let i = 0; i <= 100; i += 2) {
    const x = i;
    const z = (x - mean) / spread;
    const y = Math.exp(-0.5 * z * z) / (spread * Math.sqrt(2 * Math.PI));
    points.push({
      x,
      y: Number((y * 100).toFixed(2)),
      lower: Number((y * 70).toFixed(2)),
      upper: Number((y * 130).toFixed(2)),
      tailLower: Number((y * 40).toFixed(2)),
      tailUpper: Number((y * 160).toFixed(2)),
    });
  }
  return points;
}

// Generate uncertainty over time data for a prediction
export function generateUncertaintyTimeline(prediction: Prediction): UncertaintyTimePoint[] {
  const points: UncertaintyTimePoint[] = [];
  const base = prediction.probability;
  const ep = prediction.epistemicUncertainty;
  const al = prediction.aleatoricUncertainty;

  for (let d = 0; d <= 30; d += 1) {
    const drift = Math.sin(d * 0.3) * 5 + Math.cos(d * 0.15) * 3;
    const widening = d * 0.4;
    const prob = Math.max(0, Math.min(100, base + drift));
    points.push({
      day: d,
      label: d === 0 ? "Today" : `Day ${d}`,
      probability: Number(prob.toFixed(1)),
      upper: Number(Math.min(100, prob + 8 + widening).toFixed(1)),
      lower: Number(Math.max(0, prob - 8 - widening).toFixed(1)),
      epistemic: Number((ep + d * 0.008 + Math.sin(d * 0.2) * 0.03).toFixed(3)),
      aleatoric: Number((al + Math.cos(d * 0.25) * 0.02).toFixed(3)),
    });
  }
  return points;
}

// Generate 7-day confidence drift sparkline data
export function generateConfidenceDrift(prediction: Prediction): number[] {
  const base = prediction.epistemicUncertainty * 100;
  const points: number[] = [];
  for (let d = 0; d < 7; d++) {
    const drift = Math.sin(d * 0.8 + prediction.probability * 0.1) * 4 + Math.cos(d * 0.4) * 2;
    points.push(Number((base + drift + d * (prediction.confidence === "low" ? 1.2 : prediction.confidence === "medium" ? 0.3 : -0.5)).toFixed(1)));
  }
  return points;
}

// Generate plain-language summary
export function generateUncertaintySummary(prediction: Prediction): string {
  const p = prediction;
  const confWord = p.confidence === "high" ? "strong" : p.confidence === "medium" ? "moderate" : "limited";
  const dataWord = p.dataCompleteness >= 80 ? "well-supported" : p.dataCompleteness >= 50 ? "partially supported" : "weakly supported";
  const agreementWord = p.modelAgreement >= 0.8 ? "broadly agree" : p.modelAgreement >= 0.6 ? "show some divergence" : "significantly disagree";
  const epWord = p.epistemicUncertainty >= 0.4 ? "substantial gaps in available data" : p.epistemicUncertainty >= 0.2 ? "some gaps in available data" : "relatively complete data coverage";
  const alWord = p.aleatoricUncertainty >= 0.3 ? "high natural variability" : "moderate natural variability";
  
  const popMil = (p.populationExposure / 1000000).toFixed(1);
  
  return `${p.title} in ${p.region} is estimated at ${p.probability}% probability over the ${p.forecastWindow.toLowerCase()}, with ${confWord} confidence. This estimate is ${dataWord} by current data (${p.dataCompleteness}% completeness). Forecasting models ${agreementWord} (${(p.modelAgreement * 100).toFixed(0)}% agreement). The primary source of uncertainty is ${p.uncertaintySource.toLowerCase()}. There are ${epWord}, combined with ${alWord} in the underlying system. Approximately ${popMil}M people are within the exposure zone. Last updated ${p.lastUpdate}.`;
}
