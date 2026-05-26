/**
 * SensorChart
 *
 * Displays the main market chart for the selected asset.
 *
 * Features:
 * - Line chart mode
 * - Area chart mode
 * - Live refresh indicator
 * - Responsive chart sizing
 * - Company asset name with original sensor source
 */

import React, { useState } from "react";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function SensorChart({
  data,
  selectedSensor,
  displayName,
  refreshing,
  refreshIntervalMs,
  lastUpdated,
}) {
  const [chartType, setChartType] = useState("area");

  /**
   * Limits rendered points for performance and keeps the chart readable.
   */
  const chartData = data.slice(-120);

  return (
    <section className="chart-panel">
      <div className="chart-header">
        <div>
          <h2 className="chart-title">
            {displayName || "No Asset Selected"}

            {selectedSensor && (
              <span className="chart-source">[{selectedSensor}]</span>
            )}
          </h2>

          <p className="chart-caption">
            Live chart checks for new market readings every{" "}
            {refreshIntervalMs / 1000} second. Current points loaded:{" "}
            {chartData.length}.
          </p>
        </div>

        <div className="chart-update-badge">
          {refreshing ? "Refreshing data" : "Live"}
        </div>
      </div>

      <div className="chart-controls">
        <button
          type="button"
          onClick={() => setChartType("line")}
          className={`chart-control-button ${
            chartType === "line" ? "active" : ""
          }`}
        >
          Line Chart
        </button>

        <button
          type="button"
          onClick={() => setChartType("area")}
          className={`chart-control-button ${
            chartType === "area" ? "active" : ""
          }`}
        >
          Area Chart
        </button>
      </div>

      <div className="chart-card">
        {chartData.length === 0 ? (
          <p className="empty-state">Waiting for chart data...</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={chartData}>
                <CartesianGrid stroke="#1f1f1f" />

                <XAxis
                  dataKey="displayTime"
                  stroke="#666"
                  minTickGap={45}
                  tick={{ fontSize: 11 }}
                />

                <YAxis stroke="#666" tick={{ fontSize: 11 }} />

                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid #333",
                    borderRadius: "10px",
                    color: "white",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#00ffae"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={450}
                />
              </LineChart>
            ) : (
              <AreaChart data={chartData}>
                <CartesianGrid stroke="#1f1f1f" />

                <XAxis
                  dataKey="displayTime"
                  stroke="#666"
                  minTickGap={45}
                  tick={{ fontSize: 11 }}
                />

                <YAxis stroke="#666" tick={{ fontSize: 11 }} />

                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid #333",
                    borderRadius: "10px",
                    color: "white",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#00ffae"
                  fill="#00ffae22"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={450}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      <div className="chart-footer">
        Last updated:{" "}
        {lastUpdated ? lastUpdated.toLocaleTimeString() : "Waiting for data"}
      </div>
    </section>
  );
}