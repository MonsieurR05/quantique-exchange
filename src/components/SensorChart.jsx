/**
 * SensorChart
 *
 * Displays the selected market asset as a live line chart.
 * Company names are shown clearly, while backend sensor IDs are shown
 * quietly in square brackets for technical transparency.
 */

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { addLiveDisplayTimes } from "../utils/chartTime";

export default function SensorChart({
  data,
  selectedSensor,
  displayName,
  refreshing,
  refreshIntervalMs,
  lastUpdated,
}) {
  const chartEndTime = lastUpdated || new Date();
  const chartData = addLiveDisplayTimes(data, chartEndTime, refreshIntervalMs);

  return (
    <section className="center-panel">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">
            {displayName || "No asset selected"}

            {selectedSensor && (
              <span className="chart-source">[{selectedSensor}]</span>
            )}
          </h3>

          <p className="chart-caption">
            Live chart checks for new market readings every{" "}
            {refreshIntervalMs / 1000} second. Current points loaded:{" "}
            {data.length}.
          </p>
        </div>

        <div className="chart-update-badge">
          {refreshing ? "Refreshing data" : "Auto-refresh enabled"}
        </div>
      </div>

      <div className="chart-card">
        {data.length === 0 ? (
          <p className="empty-state">Waiting for chart data...</p>
        ) : (
          <LineChart width={750} height={320} data={chartData}>
            <CartesianGrid stroke="#222" />
            <XAxis dataKey="liveDisplayTime" stroke="#888" minTickGap={35} />
            <YAxis stroke="#888" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#00ff9f"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={500}
            />
          </LineChart>
        )}
      </div>
    </section>
  );
}