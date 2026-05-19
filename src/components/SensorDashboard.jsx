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
const REFRESH_INTERVAL_MS = 1000;
const STRATEGY_WINDOW = 10;

/**
 * Checks whether a processed sensor only returns binary values.
 * Binary sensors such as door/contact sensors usually produce 0/1 values,
 * which can make the chart look static or visually unclear for users.
 */
function isBinarySensor(readings) {
  if (!readings || readings.length === 0) return true;

  const uniqueValues = new Set(
    readings
      .map((reading) => Number(reading.value))
      .filter((value) => !Number.isNaN(value))
  );

  return (
    uniqueValues.size <= 2 &&
    [...uniqueValues].every((value) => value === 0 || value === 1)
  );
}

/**
 * Chooses a clearer default sensor for the main chart.
 * Non-binary sensors are prioritised so the first chart shown has smoother
 * visual movement and feels more live to beginner users.
 */
function chooseDefaultSensor(updatedSensors) {
  const sensorEntries = Object.entries(updatedSensors);

  const nonBinarySensor = sensorEntries.find(([sensorName, readings]) => {
    const lowerName = sensorName.toLowerCase();

    const likelyBinarySensor =
      lowerName.includes("door") ||
      lowerName.includes("motion") ||
      lowerName.includes("leak");

    return !likelyBinarySensor && !isBinarySensor(readings);
  });

  if (nonBinarySensor) {
    return nonBinarySensor[0];
  }

  return (
    sensorEntries.find(([, readings]) => !isBinarySensor(readings))?.[0] ||
    sensorEntries[0]?.[0] ||
    null
  );
}
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
          const currentReadings = updated[currentSensor];

          if (currentSensor && currentReadings && !isBinarySensor(currentReadings)) {
            return currentSensor;
          }

          return chooseDefaultSensor(updated);
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