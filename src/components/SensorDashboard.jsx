import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import MomentumStrategy from "../strategies/MomentumStrategy";
import MovingAverageStrategy from "../strategies/MovingAverageStrategy";
import { preprocessData } from "../utils/sensorProcessing";
import { getSignalColor } from "../utils/signalStyles";

// -----------------------------
// MAIN COMPONENT
// -----------------------------
export default function SensorDashboard() {
  const [sensorData, setSensorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const strategies = [
    new MomentumStrategy(),
    new MovingAverageStrategy(10),
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5001/data");

        if (!res.ok) {
          throw new Error("Backend returned an error");
        }

        const json = await res.json();
        const updated = {};

        Object.entries(json).forEach(([sensorName, raw]) => {
          const processed = preprocessData(raw);

          if (processed.length > 0) {
            updated[sensorName] = processed;
          }
        });

        setSensorData(updated);
        setError(null);
      } catch (err) {
        console.error("Fetch failed:", err);
        setError("Could not load live sensor data. Please check the backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: "#0a0a0a", padding: "20px", color: "white" }}>
      <h2 style={{ marginBottom: "10px" }}>
        Quantique Exchange Dashboard
      </h2>

      <p
        style={{
          color: "#aaa",
          maxWidth: "850px",
          lineHeight: "1.5",
          marginBottom: "25px",
        }}
      >
        Live UAL IoT sensor readings are converted into financial-style assets.
        Each card shows the latest sensor value as a price, calculates movement as a return,
        and applies trading strategies to generate BUY, SELL, or HOLD signals.
      </p>

      {loading && (
        <p style={{ color: "#aaa" }}>
          Loading live UAL sensor data...
        </p>
      )}

      {error && (
        <p style={{ color: "#ff4d4d" }}>
          {error}
        </p>
      )}

      {!loading && !error && Object.keys(sensorData).length === 0 && (
        <p style={{ color: "#aaa" }}>
          No sensor data is currently available.
        </p>
      )}

      {Object.entries(sensorData).map(([sensorName, data]) => {
        const signals = strategies.map((strategy) => ({
          name: strategy.name,
          signal: strategy.generateSignal(data),
        }));

        const latest = data[data.length - 1];

        return (
          <div
            key={sensorName}
            style={{
              marginBottom: "20px",
              padding: "15px",
              background: "#111",
              border: "1px solid #222",
              borderRadius: "6px",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <h3 style={{ margin: 0 }}>
                {sensorName} <span style={{ color: "#666" }}>(Asset)</span>
              </h3>

              <span style={{ color: "#888" }}>
                Points: {data.length}
              </span>
            </div>

            {/* DATA PANEL */}
            <div
              style={{
                display: "flex",
                gap: "30px",
                marginBottom: "10px",
                fontSize: "14px",
              }}
            >
              <div>
                <div>Price</div>
                <strong>{latest?.value}</strong>
              </div>

              <div>
                <div>Return</div>
                <strong>{latest?.return.toFixed(2)}</strong>
              </div>

              {signals.map(({ name, signal }) => (
                <div key={name}>
                  <div>{name}</div>
                  <strong style={{ color: getSignalColor(signal) }}>
                    {signal}
                  </strong>
                </div>
              ))}
            </div>

            {/* CHART */}
            <LineChart width={800} height={200} data={data}>
              <CartesianGrid stroke="#222" />
              <XAxis dataKey="displayTime" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#00ff9f"
                dot={false}
              />
            </LineChart>
          </div>
        );
      })}
    </div>
  );
}