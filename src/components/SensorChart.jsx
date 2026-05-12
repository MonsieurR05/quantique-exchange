/**
 * SensorChart
 *
 * Displays the selected sensor as a live line chart.
 * It also normalises the x-axis labels so the chart appears as a live feed
 * with evenly spaced timestamps.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const CHART_POINT_INTERVAL_MS = 3000;

export default function SensorChart({
  data,
  selectedSensor,
  refreshing,
  refreshIntervalMs,
  lastUpdated,
}) {
  const chartEndTime = lastUpdated || new Date();

  const chartData = data.map((reading, index) => {
    const pointTime = new Date(
      chartEndTime.getTime() -
        (data.length - index - 1) * CHART_POINT_INTERVAL_MS
    );

    return {
      ...reading,
      liveDisplayTime: pointTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  });

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
          <XAxis
            dataKey="liveDisplayTime"
            stroke="#888"
            minTickGap={35}
          />
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