/**
 * SensorDashboard
 *
 * Container component for the Quantique Exchange dashboard.
 * It handles data fetching, selected sensor state, simulated positions,
 * live refresh feedback, and passes data into smaller UI components.
 */

import React, { useEffect, useState } from "react";

import MomentumStrategy from "../strategies/MomentumStrategy";
import MovingAverageStrategy from "../strategies/MovingAverageStrategy";
import OrderFlowImbalanceStrategy from "../strategies/OrderFlowImbalanceStrategy";
import { preprocessData } from "../utils/sensorProcessing";

import SensorList from "./SensorList";
import SensorChart from "./SensorChart";
import LiveStatus from "./LiveStatus";
import TradingPanel from "./TradingPanel";

import "../styles/SensorDashboard.css";

const API_URL = "http://localhost:5001/data";
const REFRESH_INTERVAL_MS = 3000;
const STRATEGY_WINDOW = 10;

export default function SensorDashboard() {
  const [sensorData, setSensorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSensor, setSelectedSensor] = useState(null);
  const [positions, setPositions] = useState({});

  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const strategies = [
    new MomentumStrategy(),
    new MovingAverageStrategy(STRATEGY_WINDOW),
    new OrderFlowImbalanceStrategy(STRATEGY_WINDOW),
  ];

  const handleTrade = (sensor, action) => {
    if (!sensor) return;

    setPositions((prev) => ({
      ...prev,
      [sensor]: action,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setRefreshing(true);

        const res = await fetch(API_URL);
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

        setLastUpdated(new Date());
        setRefreshCount((count) => count + 1);
        setError(null);
      } catch (err) {
        setError("Failed to load sensor data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, REFRESH_INTERVAL_MS);

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

        <LiveStatus
          refreshing={refreshing}
          lastUpdated={lastUpdated}
          refreshCount={refreshCount}
        />
      </header>

      {loading && <p className="dashboard-message">Loading sensor data...</p>}

      {error && <p className="dashboard-message dashboard-error">{error}</p>}

      <main className="dashboard-layout">
        <SensorList
          sensors={Object.keys(sensorData)}
          selectedSensor={selectedSensor}
          onSelectSensor={setSelectedSensor}
        />

        <SensorChart
          data={data}
          selectedSensor={selectedSensor}
          refreshing={refreshing}
          refreshIntervalMs={REFRESH_INTERVAL_MS}
          lastUpdated={lastUpdated}
        />

        <TradingPanel
          latest={latest}
          signals={signals}
          suggested={suggested}
          selectedSensor={selectedSensor}
          position={positions[selectedSensor]}
          onTrade={handleTrade}
          accuracy={accuracy}
          strength={strength}
        />
      </main>
    </div>
  );
}