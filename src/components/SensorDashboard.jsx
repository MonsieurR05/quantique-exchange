/**
 * SensorDashboard
 *
 * Responsibilities:
 * - Fetch and preprocess IoT sensor data
 * - Apply strategies
 * - Provide trading interaction
 * - Render Bloomberg-style layout
 *
 * Layout:
 * LEFT → sensor selection
 * CENTER → chart
 * RIGHT → signals + trading
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

  // Selected sensor for panel view
  const [selectedSensor, setSelectedSensor] = useState(null);

  // Trading positions
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

        // Auto-select first sensor
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

  // Current selected data
  const data = sensorData[selectedSensor] || [];

  const signals = strategies.map((strategy) => ({
    name: strategy.name,
    signal: strategy.generateSignal(data),
  }));

  // Task 3 (kept)
  const suggested =
    signals.find((s) => s.name === "Momentum")?.signal || "HOLD";

  const latest = data[data.length - 1];

  return (
    <div style={{ background: "#0a0a0a", color: "white", height: "100vh" }}>
      <h2 style={{ padding: "10px 20px" }}>Quantique Exchange</h2>

      {/* GRID LAYOUT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr 300px",
          height: "90%",
        }}
      >
        {/* LEFT PANEL */}
        <div style={{ borderRight: "1px solid #222", padding: "10px" }}>
          <h4>Sensors</h4>

          {Object.keys(sensorData).map((sensor) => (
            <div
              key={sensor}
              onClick={() => setSelectedSensor(sensor)}
              style={{
                padding: "8px",
                cursor: "pointer",
                background:
                  selectedSensor === sensor ? "#1a1a1a" : "transparent",
                borderRadius: "4px",
              }}
            >
              {sensor}
            </div>
          ))}
        </div>

        {/* CENTER PANEL */}
        <div style={{ padding: "20px" }}>
          <h3>{selectedSensor}</h3>

          <LineChart width={700} height={300} data={data}>
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

        {/* RIGHT PANEL */}
        <div style={{ borderLeft: "1px solid #222", padding: "15px" }}>
          <h4>Trading Panel</h4>

          <p>Price: {latest?.value}</p>
          <p>Return: {latest?.return?.toFixed(2)}</p>

          {/* SIGNALS */}
          <div>
            {signals.map(({ name, signal }) => (
              <div key={name}>
                {name}:{" "}
                <span style={{ color: getSignalColor(signal) }}>
                  {signal}
                </span>
              </div>
            ))}
          </div>

          {/* SUGGESTED */}
          <div style={{ marginTop: "10px" }}>
            <strong>Suggested: </strong>
            <span style={{ color: getSignalColor(suggested) }}>
              {suggested}
            </span>
          </div>

          {/* POSITION */}
          <div style={{ marginTop: "10px" }}>
            <strong>Position: </strong>
            {positions[selectedSensor] || "NONE"}
          </div>

          {/* TRADING */}
          <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
            <button
              onClick={() => handleTrade(selectedSensor, "BUY")}
              style={{
                background: "#00ff9f",
                border: suggested === "BUY" ? "2px solid white" : "none",
                padding: "8px",
                fontWeight: "bold",
              }}
            >
              BUY
            </button>

            <button
              onClick={() => handleTrade(selectedSensor, "SELL")}
              style={{
                background: "#ff4d4d",
                color: "white",
                border: suggested === "SELL" ? "2px solid white" : "none",
                padding: "8px",
                fontWeight: "bold",
              }}
            >
              SELL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}