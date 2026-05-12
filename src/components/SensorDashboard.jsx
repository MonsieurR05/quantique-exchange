/**
 * SensorDashboard
 *
 * Main dashboard component for displaying live UAL IoT sensor data as
 * trading-style assets. It fetches backend data, applies reusable trading
 * strategies, and allows users to simulate BUY/SELL positions.
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
import "../styles/SensorDashboard.css";

export default function SensorDashboard() {
  const [sensorData, setSensorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSensor, setSelectedSensor] = useState(null);
  const [positions, setPositions] = useState({});

  const handleTrade = (sensor, action) => {
    if (!sensor) return;

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

        setSelectedSensor((currentSensor) => {
          if (currentSensor && updated[currentSensor]) {
            return currentSensor;
          }

          return Object.keys(updated)[0] || null;
        });

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
  }, []);

  const data = sensorData[selectedSensor] || [];

  const signals = strategies.map((strategy) => ({
    name: strategy.name,
    signal: strategy.generateSignal(data),
  }));

  const suggested =
    signals.find((signal) => signal.name === "Momentum")?.signal || "HOLD";

  const latest = data[data.length - 1];

  const positive = data.filter((reading) => reading.return > 0).length;
  const negative = data.filter((reading) => reading.return < 0).length;

  const accuracy =
    positive + negative > 0
      ? ((positive / (positive + negative)) * 100).toFixed(1)
      : "0";

  const strength =
    data.length > 0
      ? (
          data.reduce((sum, reading) => sum + Math.abs(reading.return), 0) /
          data.length
        ).toFixed(2)
      : "0";

  return (
    <div className="sensor-dashboard">
      <header className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Quantique Exchange</h2>
          <p className="dashboard-subtitle">
            Live UAL sensor data transformed into simulated trading signals.
          </p>
        </div>
      </header>

      {loading && <p className="dashboard-message">Loading sensor data...</p>}

      {error && <p className="dashboard-message dashboard-error">{error}</p>}

      <main className="dashboard-layout">
        {/* LEFT PANEL */}
        <aside className="left-panel">
          <h4 className="panel-heading">SENSORS</h4>

          <div className="sensor-list">
            {Object.keys(sensorData).map((sensor) => (
              <button
                key={sensor}
                onClick={() => setSelectedSensor(sensor)}
                className={`sensor-item ${
                  selectedSensor === sensor ? "active" : ""
                }`}
              >
                {sensor}
              </button>
            ))}
          </div>
        </aside>

        {/* CENTER PANEL */}
        <section className="center-panel">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">{selectedSensor || "No sensor selected"}</h3>
              <p className="chart-caption">
                Chart updates from live backend sensor readings.
              </p>
            </div>
          </div>

          <div className="chart-card">
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
        </section>

        {/* RIGHT PANEL */}
        <aside className="right-panel">
          <h4 className="panel-heading">TRADING PANEL</h4>

          <div className="metric-card">
            <div className="metric-row">
              <span>Price</span>
              <strong>{latest?.value ?? "-"}</strong>
            </div>

            <div className="metric-row">
              <span>Return</span>
              <strong>{latest?.return?.toFixed(2) ?? "-"}</strong>
            </div>
          </div>

          <div className="signal-list">
            {signals.map(({ name, signal }) => (
              <div key={name} className="signal-row">
                <span>{name}</span>
                <strong style={{ color: getSignalColor(signal) }}>
                  {signal}
                </strong>
              </div>
            ))}
          </div>

          <div className="suggested-card">
            <span>Suggested action</span>
            <strong style={{ color: getSignalColor(suggested) }}>
              {suggested}
            </strong>
          </div>

          <div className="position-row">
            <span>Current position</span>
            <strong>{positions[selectedSensor] || "NONE"}</strong>
          </div>

          <div className="trade-buttons">
            <button
              onClick={() => handleTrade(selectedSensor, "BUY")}
              className={`trade-button buy ${
                suggested === "BUY" ? "recommended" : ""
              }`}
            >
              BUY
            </button>

            <button
              onClick={() => handleTrade(selectedSensor, "SELL")}
              className={`trade-button sell ${
                suggested === "SELL" ? "recommended" : ""
              }`}
            >
              SELL
            </button>
          </div>

          <div className="evaluation-section">
            <h4 className="panel-heading">EVALUATION</h4>

            <div className="metric-row">
              <span>Accuracy</span>
              <strong
                className={
                  Number(accuracy) > 60 ? "positive-text" : "negative-text"
                }
              >
                {accuracy}%
              </strong>
            </div>

            <div className="metric-row">
              <span>Signal Strength</span>
              <strong>{strength}</strong>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}