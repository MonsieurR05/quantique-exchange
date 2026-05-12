/**
 * SensorChart
 *
 * Displays the selected sensor as a live line chart.
 * It uses chartTime.js to normalise the x-axis labels so the chart appears
 * as a live feed with evenly spaced timestamps.
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
            {selectedSensor || "No sensor selected"}
          </h3>

          <p className="chart-caption">
            Live chart checks for new sensor readings every{" "}
            {refreshIntervalMs / 1000} seconds. Current points loaded:{" "}
            {data.length}
          </p>
        </div>

        <div className="chart-update-badge">
          {refreshing ? "Refreshing data" : "Auto-refresh enabled"}
        </div>
      </div>

      <div className="chart-card">
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
      </div>
    </section>
  );
}