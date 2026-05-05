/**
 * SensorDashboard (Final Polished Version)
 *
 */

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
import OrderFlowImbalanceStrategy from "../strategies/OrderFlowImbalanceStrategy";
import { preprocessData } from "../utils/sensorProcessing";
import { getSignalColor } from "../utils/signalStyles";

export default function SensorDashboard() {
  const [sensorData, setSensorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSensor, setSelectedSensor] = useState(null);
  const [positions, setPositions] = useState({});

  const handleTrade = (sensor, action) => {
    setPositions((prev) => ({
      ...prev,
      [sensor]: action,
    }));
  };

  const strategies = [
    new MomentumStrategy(),
    new MovingAverageStrategy(10),
    new OrderFlowImbalanceStrategy(10),
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5001/data");
        if (!res.ok) throw new Error("Backend error");

        const json = await res.json();
        const updated = {};

        Object.entries(json).forEach(([sensorName, raw]) => {
          const processed = preprocessData(raw);
          if (processed.length > 0) {
            updated[sensorName] = processed;
          }
        });

        setSensorData(updated);

        if (!selectedSensor && Object.keys(updated).length > 0) {
          setSelectedSensor(Object.keys(updated)[0]);
        }

        setError(null);
      } catch (err) {
        setError("Failed to load sensor data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedSensor]);

  const data = sensorData[selectedSensor] || [];

  const signals = strategies.map((strategy) => ({
    name: strategy.name,
    signal: strategy.generateSignal(data),
  }));

  const suggested =
    signals.find((s) => s.name === "Momentum")?.signal || "HOLD";

  const latest = data[data.length - 1];

  const positive = data.filter((d) => d.return > 0).length;
  const negative = data.filter((d) => d.return < 0).length;

  const accuracy =
    positive + negative > 0
      ? ((positive / (positive + negative)) * 100).toFixed(1)
      : "0";

  const strength =
    data.length > 0
      ? (
          data.reduce((sum, d) => sum + Math.abs(d.return), 0) /
          data.length
        ).toFixed(2)
      : "0";

  return (
    <div style={{ background: "#0a0a0a", color: "white", height: "100vh" }}>
      <h2 style={{ padding: "15px 20px", fontWeight: "600" }}>
        Quantique Exchange
      </h2>

      {loading && <p style={{ padding: "10px" }}>Loading...</p>}
      {error && <p style={{ color: "#ff4d4d", padding: "10px" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "240px 1fr 320px",
          height: "90%",
        }}
      >
        {/* LEFT PANEL */}
        <div style={{ borderRight: "1px solid #222", padding: "15px" }}>
          <h4 style={{ marginBottom: "10px", color: "#aaa" }}>SENSORS</h4>

          {Object.keys(sensorData).map((sensor) => (
            <div
              key={sensor}
              onClick={() => setSelectedSensor(sensor)}
              style={{
                padding: "10px",
                marginBottom: "6px",
                cursor: "pointer",
                background:
                  selectedSensor === sensor ? "#1f1f1f" : "transparent",
                borderRadius: "6px",
                transition: "0.2s",
              }}
            >
              {sensor}
            </div>
          ))}
        </div>

        {/* CENTER PANEL */}
        <div style={{ padding: "20px" }}>
          <h3 style={{ marginBottom: "15px" }}>{selectedSensor}</h3>

          <LineChart width={750} height={320} data={data}>
            <CartesianGrid stroke="#222" />
            <XAxis dataKey="displayTime" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#00ff9f"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ borderLeft: "1px solid #222", padding: "20px" }}>
          <h4 style={{ marginBottom: "10px", color: "#aaa" }}>
            TRADING PANEL
          </h4>

          <div style={{ marginBottom: "15px" }}>
            <div>Price: {latest?.value}</div>
            <div>Return: {latest?.return?.toFixed(2)}</div>
          </div>

          {/* SIGNALS */}
          <div style={{ marginBottom: "15px" }}>
            {signals.map(({ name, signal }) => (
              <div key={name} style={{ marginBottom: "4px" }}>
                {name}:{" "}
                <span style={{ color: getSignalColor(signal) }}>
                  {signal}
                </span>
              </div>
            ))}
          </div>

          {/* SUGGESTED */}
          <div
            style={{
              marginBottom: "15px",
              padding: "10px",
              border: "1px solid #333",
              borderRadius: "6px",
            }}
          >
            <strong>Suggested: </strong>
            <span style={{ color: getSignalColor(suggested) }}>
              {suggested}
            </span>
          </div>

          {/* POSITION */}
          <div style={{ marginBottom: "15px" }}>
            <strong>Position: </strong>
            {positions[selectedSensor] || "NONE"}
          </div>

          {/* BUTTONS */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={() => handleTrade(selectedSensor, "BUY")}
              style={{
                flex: 1,
                background: "#00ff9f",
                border: suggested === "BUY" ? "2px solid white" : "none",
                padding: "10px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              BUY
            </button>

            <button
              onClick={() => handleTrade(selectedSensor, "SELL")}
              style={{
                flex: 1,
                background: "#ff4d4d",
                color: "white",
                border: suggested === "SELL" ? "2px solid white" : "none",
                padding: "10px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              SELL
            </button>
          </div>

          {/* EVALUATION */}
          <div>
            <h4 style={{ marginBottom: "8px", color: "#aaa" }}>EVALUATION</h4>

            <div>
              Accuracy:{" "}
              <span
                style={{
                  color: accuracy > 60 ? "#00ff9f" : "#ff4d4d",
                }}
              >
                {accuracy}%
              </span>
            </div>

            <div>Signal Strength: {strength}</div>
          </div>
        </div>
      </div>
    </div>
  );
}