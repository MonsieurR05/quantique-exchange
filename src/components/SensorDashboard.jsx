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

import "../styles/SensorDashboard.css";

const API_URL = "http://localhost:5001/data";
const REFRESH_INTERVAL_MS = 1000;
const STRATEGY_WINDOW = 10;

/**
 * Maps backend sensor IDs to recognisable stock/company names.
 * Backend structure remains unchanged.
 */
const assetNames = {
  DoorSensor302: "BP",
  MotionSensorEntrance: "Nike",
  MotionSensorTechOffice: "Shell",
  MoistureSensorKitchen: "Apple",
  MoistureSensorMick: "Tesla",
  MoistureSensorLizzie: "Amazon",
  MotionSensor308: "Microsoft",
  WaterSensor301: "Adidas",
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
 * Chooses a clearer default sensor for the main chart.
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
  /**
   * Stores processed market asset data.
   */
  const [sensorData, setSensorData] = useState({});

  /**
   * Loading and API states.
   */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Selected active asset.
   */
  const [selectedSensor, setSelectedSensor] = useState(null);

  /**
   * Stores latest BUY/SELL position.
   */
  const [positions, setPositions] = useState({});

  /**
   * Simulated portfolio balance.
   */
  const [balance, setBalance] = useState(10000);

  /**
   * Stores owned shares per asset.
   */
  const [portfolio, setPortfolio] = useState({});

  /**
   * Live refresh state.
   */
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  /**
   * Trading strategy instances.
   */
  const strategies = [
    new MomentumStrategy(),
    new MovingAverageStrategy(STRATEGY_WINDOW),
    new OrderFlowImbalanceStrategy(STRATEGY_WINDOW),
  ];

  /**
   * Executes simulated BUY and SELL actions.
   */
  const handleTrade = (sensor, action, price) => {
    if (!sensor || !price) return;

    /**
     * BUY LOGIC
     */
    if (action === "BUY" && balance >= price) {
      setBalance((prev) => prev - price);

      setPortfolio((prev) => ({
        ...prev,
        [sensor]: (prev[sensor] || 0) + 1,
      }));

      setPositions((prev) => ({
        ...prev,
        [sensor]: "BUY",
      }));
    }

    /**
     * SELL LOGIC
     */
    if (action === "SELL" && (portfolio[sensor] || 0) > 0) {
      setBalance((prev) => prev + price);

      setPortfolio((prev) => ({
        ...prev,
        [sensor]: prev[sensor] - 1,
      }));

      setPositions((prev) => ({
        ...prev,
        [sensor]: "SELL",
      }));
    }
  };

  /**
   * Fetches live sensor data continuously.
   * Live refresh system intentionally preserved.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setRefreshing(true);

        const res = await fetch(API_URL);

        if (!res.ok) {
          throw new Error("Backend error");
        }

        const json = await res.json();

        const updated = {};

        Object.entries(json).forEach(([sensorName, raw]) => {
          /**
           * Converts binary sensor values into stock-style prices.
           * Creates more realistic market movement.
           */
          const processed = preprocessData(raw).map((reading, index) => {
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

          if (processed.length > 0) {
            updated[sensorName] = processed;
          }
        });

        setSensorData(updated);

        /**
         * Keeps current selection if still valid.
         */
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

  /**
   * Selected asset dataset.
   */
  const data = sensorData[selectedSensor] || [];

  /**
   * Generates strategy signals.
   */
  const signals = strategies.map((strategy) => ({
    name: strategy.name,
    signal: strategy.generateSignal(data),
  }));

  /**
   * Uses Momentum strategy as primary recommendation.
   */
  const suggested =
    signals.find((signal) => signal.name === "Momentum")?.signal || "HOLD";

  /**
   * Latest market reading.
   */
  const latest = data[data.length - 1];

  /**
   * Evaluation metrics.
   */
  const positive = data.filter((reading) => reading.return > 0).length;

  const negative = data.filter((reading) => reading.return < 0).length;

  const accuracy =
    positive + negative > 0
      ? ((positive / (positive + negative)) * 100).toFixed(1)
      : "0";

  const strength =
    data.length > 0
      ? (
          data.reduce(
            (sum, reading) => sum + Math.abs(reading.return),
            0
          ) / data.length
        ).toFixed(2)
      : "0";

  return (
    <div className="sensor-dashboard">
      <header className="dashboard-header">
        <div>
          <h2 className="dashboard-title">
            Quantique Exchange
          </h2>

          <p className="dashboard-subtitle">
            Live simulated market assets generated from UAL IoT data streams.
          </p>
        </div>

        <LiveStatus
          refreshing={refreshing}
          lastUpdated={lastUpdated}
          refreshCount={refreshCount}
        />
      </header>

      {loading && (
        <p className="dashboard-message">
          Loading market data...
        </p>
      )}

      {error && (
        <p className="dashboard-message dashboard-error">
          {error}
        </p>
      )}

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
          displayName={
            assetNames[selectedSensor] || selectedSensor
          }
          refreshing={refreshing}
          refreshIntervalMs={REFRESH_INTERVAL_MS}
          lastUpdated={lastUpdated}
        />

        <TradingPanel
          latest={latest}
          signals={signals}
          suggested={suggested}
          selectedSensor={selectedSensor}
          displayName={
            assetNames[selectedSensor] || selectedSensor
          }
          position={positions[selectedSensor]}
          balance={balance}
          portfolio={portfolio}
          onTrade={(action) =>
            handleTrade(
              selectedSensor,
              action,
              latest?.value
            )
          }
          accuracy={accuracy}
          strength={strength}
        />
      </main>
    </div>
  );
}