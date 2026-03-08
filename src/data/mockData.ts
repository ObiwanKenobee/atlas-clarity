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
