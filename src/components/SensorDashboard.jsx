/**
 * SensorDashboard
 *
 * Container component for the Quantique Exchange dashboard.
 * It handles:
 * - Live sensor fetching
 * - Simulated stock price generation
 * - Trading strategy execution
 * - Portfolio simulation
 * - Live refresh tracking
 * - Asset selection state
 *
 * Design Notes:
 * - Uses Strategy Pattern for modular trading logic
 * - Preserves backend sensor structure
 * - Converts IoT data into financial-style assets
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
import TutorialOverlay from "./TutorialOverlay";

import "../styles/SensorDashboard.css";

const API_URL = "http://localhost:5001/data";
const REFRESH_INTERVAL_MS = 1000;
const STRATEGY_WINDOW = 10;

/**
 * Maps backend sensor IDs to recognisable company-style asset names.
 * The backend sensor IDs are preserved internally.
 */
const assetNames = {
  DoorSensor302: "BP",
  DoorSensor308: "Shell",
  DoorSensorEntrance: "Nike",
  DoorSensorTechOffice: "Apple",

  LeakSensor: "Thames Water",

  "MotionSensor-302": "Uber",
  "MotionSensor-HCILab": "Tesla",
  "MotionSensor-Kitchen": "Amazon",
  MotionSensor308: "Deliveroo",

  "SoilMoistureSensor-Corby": "NVIDIA",
  "SoilMoistureSensor-Lizzie": "Microsoft",
  "SoilMoistureSensor-Mick": "Google",
  "SoilMoistureSensor-Sarah": "Meta",

  "TempHumiditySensor-HCILab": "Samsung",
  "TempHumiditySensor-Kitchen": "Netflix",
};

/**
 * Checks whether a processed sensor only returns binary values.
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
 * Chooses a clearer default asset for the main chart.
 * Non-binary assets are prioritised so the dashboard opens on a smoother chart.
 */
function chooseDefaultSensor(updatedSensors) {
  const sensorEntries = Object.entries(updatedSensors);

  const preferredSensor = sensorEntries.find(([sensorName, readings]) => {
    const lowerName = sensorName.toLowerCase();

    const likelyBinarySensor =
      lowerName.includes("door") ||
      lowerName.includes("motion") ||
      lowerName.includes("leak");

    return !likelyBinarySensor && !isBinarySensor(readings);
  });

  if (preferredSensor) {
    return preferredSensor[0];
  }

  return (
    sensorEntries.find(([, readings]) => !isBinarySensor(readings))?.[0] ||
    sensorEntries[0]?.[0] ||
    null
  );
}

/**
 * Converts processed sensor readings into simulated market-style prices.
 */
function createSimulatedMarketData(rawReadings) {
  return preprocessData(rawReadings).map((reading, index) => {
    const simulatedPrice =
      100 +
      Number(reading.value) * 31 +
      Math.sin(index / 2) * 8 +
      Math.random() * 5;

    return {
      ...reading,
      value: Number(simulatedPrice.toFixed(2)),
    };
  });
}

export default function SensorDashboard() {
  const [sensorData, setSensorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSensor, setSelectedSensor] = useState(null);
  const [positions, setPositions] = useState({});

  const [balance, setBalance] = useState(10000);
  const [portfolio, setPortfolio] = useState({});

  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const [showTutorial, setShowTutorial] = useState(false);

  const strategies = [
    new MomentumStrategy(),
    new MovingAverageStrategy(STRATEGY_WINDOW),
    new OrderFlowImbalanceStrategy(STRATEGY_WINDOW),
  ];

  const handleTrade = (sensor, action, price) => {
    if (!sensor || !price) return;

    if (action === "BUY" && balance >= price) {
      setBalance((previousBalance) => previousBalance - price);

      setPortfolio((previousPortfolio) => ({
        ...previousPortfolio,
        [sensor]: (previousPortfolio[sensor] || 0) + 1,
      }));

      setPositions((previousPositions) => ({
        ...previousPositions,
        [sensor]: "BUY",
      }));
    }

    if (action === "SELL" && (portfolio[sensor] || 0) > 0) {
      setBalance((previousBalance) => previousBalance + price);

      setPortfolio((previousPortfolio) => ({
        ...previousPortfolio,
        [sensor]: previousPortfolio[sensor] - 1,
      }));

      setPositions((previousPositions) => ({
        ...previousPositions,
        [sensor]: "SELL",
      }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setRefreshing(true);

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Backend error");
        }

        const json = await response.json();
        const updated = {};

        Object.entries(json).forEach(([sensorName, rawReadings]) => {
          const processed = createSimulatedMarketData(rawReadings);

          if (processed.length > 0) {
            updated[sensorName] = processed;
          }
        });

        setSensorData(updated);

        setSelectedSensor((currentSensor) => {
          const currentReadings = updated[currentSensor];

          if (
            currentSensor &&
            currentReadings &&
            !isBinarySensor(currentReadings)
          ) {
            return currentSensor;
          }

          return chooseDefaultSensor(updated);
        });

        setLastUpdated(new Date());
        setRefreshCount((count) => count + 1);
        setError(null);
      } catch (err) {
        setError("Failed to load market data");
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

  const displayName = assetNames[selectedSensor] || selectedSensor;

  return (
    <div className="sensor-dashboard">
      <header className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Quantique Exchange</h2>

          <p className="dashboard-subtitle">
            Live simulated market assets generated from UAL IoT data streams.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="help-button"
            onClick={() => setShowTutorial(true)}
          >
            Help
          </button>

          <LiveStatus
            refreshing={refreshing}
            lastUpdated={lastUpdated}
            refreshCount={refreshCount}
          />
        </div>
      </header>

      {loading && <p className="dashboard-message">Loading market data...</p>}

      {error && <p className="dashboard-message dashboard-error">{error}</p>}

      <main className="dashboard-layout">
        <SensorList
          sensors={Object.keys(sensorData)}
          selectedSensor={selectedSensor}
          onSelectSensor={setSelectedSensor}
          assetNames={assetNames}
        />

        <SensorChart
          data={data}
          selectedSensor={selectedSensor}
          displayName={displayName}
          refreshing={refreshing}
          refreshIntervalMs={REFRESH_INTERVAL_MS}
          lastUpdated={lastUpdated}
        />

        <TradingPanel
          latest={latest}
          signals={signals}
          suggested={suggested}
          selectedSensor={selectedSensor}
          displayName={displayName}
          position={positions[selectedSensor]}
          balance={balance}
          portfolio={portfolio}
          onTrade={(action) => handleTrade(selectedSensor, action, latest?.value)}
          accuracy={accuracy}
          strength={strength}
        />
      </main>

      <TutorialOverlay
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
}