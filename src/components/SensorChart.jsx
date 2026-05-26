/**
 * SensorChart
 *
 * Displays the main market chart for the selected asset.
 *
 * Features:
 * - Line chart mode
 * - Area chart mode
 * - Live refresh indicators
 * - Bloomberg-inspired visual styling
 * - Chart variation controls
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
  /**
   * Stores selected chart visualisation type.
   */
  const [chartType, setChartType] = useState("line");

  /**
   * Limits rendered chart points for performance.
   */
  const chartData = data.slice(-120);

  return (
    <section className="chart-panel">
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "18px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "26px",
              color: "white",
            }}
          >
            {displayName || "No Asset Selected"}

            {selectedSensor && (
              <span
                style={{
                  marginLeft: "10px",
                  color: "#777",
                  fontSize: "14px",
                  fontWeight: "normal",
                }}
              >
                [{selectedSensor}]
              </span>
            )}
          </h2>

          <p
            style={{
              color: "#888",
              marginTop: "8px",
              marginBottom: 0,
              fontSize: "14px",
            }}
          >
            Live chart checks for new market readings every{" "}
            {refreshIntervalMs / 1000} second.
            Current points loaded: {chartData.length}.
          </p>
        </div>

        {/* LIVE STATUS */}
        <div
          style={{
            background: "#111",
            border: "1px solid #222",
            padding: "12px 18px",
            borderRadius: "999px",
            color: refreshing ? "#ffd166" : "#00ffae",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          {refreshing ? "Refreshing data" : "Live"}
        </div>
      </div>

      {/* CHART CONTROLS */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <button
          onClick={() => setChartType("line")}
          style={{
            background:
              chartType === "line"
                ? "#00ffae"
                : "#111",
            color:
              chartType === "line"
                ? "black"
                : "white",
            border: "1px solid #222",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Line Chart
        </button>

        <button
          onClick={() => setChartType("area")}
          style={{
            background:
              chartType === "area"
                ? "#00ffae"
                : "#111",
            color:
              chartType === "area"
                ? "black"
                : "white",
            border: "1px solid #222",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Area Chart
        </button>
      </div>

      {/* CHART CONTAINER */}
      <div
        style={{
          width: "100%",
          height: "520px",
          background: "#050505",
          border: "1px solid #1a1a1a",
          borderRadius: "18px",
          padding: "20px",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <>
            {/* LINE CHART */}
            {chartType === "line" && (
              <LineChart data={chartData}>
                <CartesianGrid stroke="#1f1f1f" />

                <XAxis
                  dataKey="displayTime"
                  stroke="#666"
                />

                <YAxis stroke="#666" />

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
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            )}

            {/* AREA CHART */}
            {chartType === "area" && (
              <AreaChart data={chartData}>
                <CartesianGrid stroke="#1f1f1f" />

                <XAxis
                  dataKey="displayTime"
                  stroke="#666"
                />

                <YAxis stroke="#666" />

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
                  strokeWidth={3}
                />
              </AreaChart>
            )}
          </>
        </ResponsiveContainer>
      </div>

      {/* FOOTER */}
      <div
        style={{
          marginTop: "14px",
          color: "#666",
          fontSize: "13px",
        }}
      >
        Last updated:{" "}
        {lastUpdated
          ? lastUpdated.toLocaleTimeString()
          : "Waiting for data"}
      </div>
    </section>
  );
}