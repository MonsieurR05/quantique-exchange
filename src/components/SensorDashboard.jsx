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

  const strategies = [
    new MomentumStrategy(),
    new MovingAverageStrategy(10),
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5001/data");
        const json = await res.json();

        const updated = {};

        Object.entries(json).forEach(([sensorName, raw]) => {
          const processed = preprocessData(raw);

          if (processed.length > 0) {
            updated[sensorName] = processed;
          }
        });

        setSensorData(updated);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: "#0a0a0a", padding: "20px", color: "white" }}>
      <h2 style={{ marginBottom: "20px" }}>
        Quantique Exchange Dashboard
      </h2>

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