/**
 * SensorDashboard
 *
 * Responsibilities:
 * - Fetch and preprocess IoT sensor data
 * - Apply multiple trading strategies
 * - Display signals, chart, and trading controls
 * - Provide user interaction (BUY / SELL)
 *
 * Sprint 2 Enhancements:
 * - Task 1: Trading state (positions)
 * - Task 2: Interactive trading controls
 * - Task 3: Intelligent suggested action (Momentum-based)
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
  /** Processed sensor data */
  const [sensorData, setSensorData] = useState({});

  /** UI states */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Trading positions per sensor */
  const [positions, setPositions] = useState({});

  /**
   * Handles BUY / SELL actions
   *
   * @param {string} sensor
   * @param {string} action
   */
  const handleTrade = (sensor, action) => {
    setPositions((prev) => ({
      ...prev,
      [sensor]: action,
    }));
  };

  /** Strategy instances */
  const strategies = [
    new MomentumStrategy(),
    new MovingAverageStrategy(10),
    new OrderFlowImbalanceStrategy(10),
  ];

  /**
   * Fetch data every 5 seconds
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5001/data");
        if (!res.ok) throw new Error("Backend returned an error");

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
        setError("Could not load live sensor data.");
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
      <h2>Quantique Exchange Dashboard</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {Object.entries(sensorData).map(([sensorName, data]) => {
        /**
         * Generate signals for all strategies
         */
        const signals = strategies.map((strategy) => ({
          name: strategy.name,
          signal: strategy.generateSignal(data),
        }));

        /**
         * Task 3: Suggested action derived from Momentum strategy
         */
        const suggestedAction =
          signals.find((s) => s.name === "Momentum")?.signal || "HOLD";

        const latest = data[data.length - 1];

        return (
          <div key={sensorName} style={{ marginBottom: "20px" }}>
            <h3>{sensorName}</h3>

            {/* DATA PANEL */}
            <div style={{ display: "flex", gap: "20px" }}>
              <div>Price: {latest?.value}</div>
              <div>Return: {latest?.return.toFixed(2)}</div>

              {signals.map(({ name, signal }) => (
                <div key={name}>
                  {name}:{" "}
                  <span style={{ color: getSignalColor(signal) }}>
                    {signal}
                  </span>
                </div>
              ))}

              {/* Suggested Action */}
              <div>
                Suggested:{" "}
                <strong style={{ color: getSignalColor(suggestedAction) }}>
                  {suggestedAction}
                </strong>
              </div>

              {/* Position */}
              <div>
                Position: {positions[sensorName] || "NONE"}
              </div>
            </div>

            {/* TRADING CONTROLS */}
            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => handleTrade(sensorName, "BUY")}
                style={{
                  background: "#00ff9f",
                  border:
                    suggestedAction === "BUY" ? "2px solid white" : "none",
                }}
              >
                BUY
              </button>

              <button
                onClick={() => handleTrade(sensorName, "SELL")}
                style={{
                  background: "#ff4d4d",
                  color: "white",
                  border:
                    suggestedAction === "SELL" ? "2px solid white" : "none",
                }}
              >
                SELL
              </button>
            </div>

            {/* CHART */}
            <LineChart width={600} height={200} data={data}>
              <CartesianGrid stroke="#222" />
              <XAxis dataKey="displayTime" />
              <YAxis />
              <Tooltip />
              <Line dataKey="value" stroke="#00ff9f" />
            </LineChart>
          </div>
        );
      })}
    </div>
  );
}