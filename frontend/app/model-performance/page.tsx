"use client";

import { BarChart3, TrendingUp, Target, Zap, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import CountUp from "react-countup";

// Cuisine Prediction Data
const cuisinePredictionData = [
  { cuisine: "Chinese", precision: 0.89, recall: 0.89, f1: 0.89 },
  { cuisine: "Indian", precision: 0.9, recall: 0.93, f1: 0.92 },
  { cuisine: "Italian", precision: 0.93, recall: 0.92, f1: 0.93 },
  { cuisine: "Japanese", precision: 0.86, recall: 0.72, f1: 0.78 },
  { cuisine: "Korean", precision: 0.82, recall: 0.8, f1: 0.81 },
  { cuisine: "Mexican", precision: 0.95, recall: 0.93, f1: 0.94 },
  { cuisine: "Southern US", precision: 0.83, recall: 0.9, f1: 0.86 },
];

// Allergen Detection Data
const allergenComparisonData = [
  { allergen: "Celery", baseline: 0.718, hybrid: 0.718, risk: "Low" },
  { allergen: "Dairy", baseline: 0.908, hybrid: 0.915, risk: "High" },
  { allergen: "Eggs", baseline: 0.787, hybrid: 0.819, risk: "High" },
  { allergen: "Fish", baseline: 0.417, hybrid: 0.494, risk: "High" },
  { allergen: "Gluten", baseline: 0.759, hybrid: 0.759, risk: "Low" },
  { allergen: "Lactose", baseline: 0.136, hybrid: 0.136, risk: "Low" },
  { allergen: "Mollusks", baseline: 0.0, hybrid: 0.0, risk: "Low" },
  { allergen: "Mustard", baseline: 0.852, hybrid: 0.852, risk: "Low" },
  { allergen: "Peanuts", baseline: 0.809, hybrid: 0.833, risk: "High" },
  { allergen: "Sesame", baseline: 0.833, hybrid: 0.833, risk: "Low" },
  { allergen: "Shellfish", baseline: 0.3, hybrid: 0.32, risk: "High" },
  { allergen: "Soybeans", baseline: 0.885, hybrid: 0.885, risk: "Low" },
  { allergen: "Sulphites", baseline: 0.51, hybrid: 0.51, risk: "Low" },
  { allergen: "Sulphur Dioxide", baseline: 0.519, hybrid: 0.519, risk: "Low" },
  { allergen: "Tree Nuts", baseline: 0.583, hybrid: 0.624, risk: "High" },
  { allergen: "Wheat", baseline: 0.892, hybrid: 0.892, risk: "Low" },
];

const getRiskColor = (risk: string) => {
  return risk === "High" ? "#ef4444" : "#10b981";
};

export default function ModelPerformance() {
  return (
    <div className="min-h-full bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-glow pointer-events-none" />

      <main className="relative container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8 animate-slide-up">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">
              Model Performance
            </h1>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
              Interactive analysis of our AI models trained on thousands of
              recipes and ingredients
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-surface-elevated border border-border rounded-xl p-6 hover:border-primary transition-all hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Cuisine Accuracy
                </h3>
              </div>
              <p className="text-3xl font-bold text-primary mb-2">
                <CountUp end={90.29} decimals={2} duration={1.5} suffix="%" />
              </p>
              <p className="text-sm text-foreground-muted">
                Across 7 cuisine types
              </p>
            </div>

            <div className="bg-surface-elevated border border-border rounded-xl p-6 hover:border-secondary transition-all hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Allergen F1 Score
                </h3>
              </div>
              <p className="text-3xl font-bold text-secondary mb-2">
                <CountUp end={81.14} decimals={2} duration={1.5} suffix="%" />
              </p>
              <p className="text-sm text-foreground-muted">
                Hybrid model performance
              </p>
            </div>

            <div className="bg-surface-elevated border border-border rounded-xl p-6 hover:border-accent transition-all hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Improvement
                </h3>
              </div>
              <p className="text-3xl font-bold text-accent mb-2">
                <CountUp
                  end={0.88}
                  decimals={2}
                  duration={1.5}
                  prefix="+"
                  suffix="%"
                />
              </p>
              <p className="text-sm text-foreground-muted">
                Hybrid vs Baseline
              </p>
            </div>
          </div>

          {/* Cuisine Prediction Chart and Table */}
          <div className="bg-surface-elevated border border-border rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              Cuisine Prediction Performance
            </h2>
            <p className="text-foreground-muted">
              Precision, Recall, and F1-Score for each cuisine type
            </p>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={cuisinePredictionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="cuisine" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => (value * 100).toFixed(2) + "%"}
                />
                <Legend />
                <Bar dataKey="precision" fill="#6BBE45" radius={[8, 8, 0, 0]} />
                <Bar dataKey="recall" fill="#45BE9B" radius={[8, 8, 0, 0]} />
                <Bar dataKey="f1" fill="#3b9d7f" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Cuisine
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">
                      Precision
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">
                      Recall
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">
                      F1-Score
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">
                      Support
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      cuisine: "Chinese",
                      precision: 0.89,
                      recall: 0.89,
                      f1: 0.89,
                      support: 534,
                    },
                    {
                      cuisine: "Indian",
                      precision: 0.9,
                      recall: 0.93,
                      f1: 0.92,
                      support: 600,
                    },
                    {
                      cuisine: "Italian",
                      precision: 0.93,
                      recall: 0.92,
                      f1: 0.93,
                      support: 1568,
                    },
                    {
                      cuisine: "Japanese",
                      precision: 0.86,
                      recall: 0.72,
                      f1: 0.78,
                      support: 285,
                    },
                    {
                      cuisine: "Korean",
                      precision: 0.82,
                      recall: 0.8,
                      f1: 0.81,
                      support: 166,
                    },
                    {
                      cuisine: "Mexican",
                      precision: 0.95,
                      recall: 0.93,
                      f1: 0.94,
                      support: 1288,
                    },
                    {
                      cuisine: "Southern US",
                      precision: 0.83,
                      recall: 0.9,
                      f1: 0.86,
                      support: 864,
                    },
                  ].map((row) => (
                    <tr
                      key={row.cuisine}
                      className="border-b border-border hover:bg-surface transition-colors"
                    >
                      <td className="py-3 px-4 text-foreground font-medium">
                        {row.cuisine}
                      </td>
                      <td className="text-center py-3 px-4 text-foreground">
                        {(row.precision * 100).toFixed(0)}%
                      </td>
                      <td className="text-center py-3 px-4 text-foreground">
                        {(row.recall * 100).toFixed(0)}%
                      </td>
                      <td className="text-center py-3 px-4 text-foreground font-semibold text-primary">
                        {(row.f1 * 100).toFixed(0)}%
                      </td>
                      <td className="text-center py-3 px-4 text-foreground-muted">
                        {row.support}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Allergen Detection Chart and Table */}
          <div className="bg-surface-elevated border border-border rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              Allergen Detection Performance
            </h2>
            <p className="text-foreground-muted">
              Baseline vs Hybrid Model F1-Score Comparison
            </p>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={allergenComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="allergen"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  stroke="#666"
                />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => (value * 100).toFixed(2) + "%"}
                />
                <Legend />
                <Bar dataKey="baseline" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="hybrid" fill="#6BBE45" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Allergen
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">
                      Baseline F1
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">
                      Hybrid F1
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">
                      Improvement
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">
                      Risk Level
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allergenComparisonData.map((row) => {
                    const improvement = (
                      (row.hybrid - row.baseline) *
                      100
                    ).toFixed(2);
                    return (
                      <tr
                        key={row.allergen}
                        className="border-b border-border hover:bg-surface transition-colors"
                      >
                        <td className="py-3 px-4 text-foreground font-medium">
                          {row.allergen}
                        </td>
                        <td className="text-center py-3 px-4 text-foreground">
                          {(row.baseline * 100).toFixed(1)}%
                        </td>
                        <td className="text-center py-3 px-4 text-foreground font-semibold text-primary">
                          {(row.hybrid * 100).toFixed(1)}%
                        </td>
                        <td className="text-center py-3 px-4">
                          <span
                            className={
                              improvement !== "0.00"
                                ? "text-green-600 font-semibold"
                                : "text-foreground-muted"
                            }
                          >
                            {improvement !== "0.00" ? `+${improvement}%` : "—"}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: getRiskColor(row.risk) + "20",
                              color: getRiskColor(row.risk),
                            }}
                          >
                            <AlertCircle className="w-3 h-3" />
                            {row.risk}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary Stats */}
            <div className="grid md:grid-cols-3 gap-4 pt-4">
              <div className="bg-surface rounded-lg p-4 border border-border">
                <p className="text-sm text-foreground-muted mb-1">
                  Baseline F1 Score
                </p>
                <p className="text-2xl font-bold text-foreground">80.43%</p>
              </div>
              <div className="bg-surface rounded-lg p-4 border border-border">
                <p className="text-sm text-foreground-muted mb-1">
                  Hybrid F1 Score
                </p>
                <p className="text-2xl font-bold text-primary">81.14%</p>
              </div>
              <div className="bg-surface rounded-lg p-4 border border-border">
                <p className="text-sm text-foreground-muted mb-1">
                  Overall Improvement
                </p>
                <p className="text-2xl font-bold text-green-600">+0.88%</p>
              </div>
            </div>
          </div>

          {/* Training Data */}
          <div className="bg-surface-elevated border border-border rounded-xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Training Data
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-4xl font-bold text-primary mb-2">
                  <CountUp end={5305} duration={1.5} separator="," />
                </p>
                <p className="text-foreground-muted">Test samples evaluated</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-secondary mb-2">
                  <CountUp end={16} duration={1.5} />
                </p>
                <p className="text-foreground-muted">Allergens tracked</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-accent mb-2">
                  <CountUp end={7} duration={1.5} />
                </p>
                <p className="text-foreground-muted">Cuisine types</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-warning mb-2">
                  <CountUp end={2} duration={1.5} />
                </p>
                <p className="text-foreground-muted">Model architectures</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
