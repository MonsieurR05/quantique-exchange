/**
 * SensorList
 *
 * Displays the available market assets and allows the user
 * to select which asset should be shown on the main chart.
 *
 * Features:
 * - Searchable watchlist
 * - Active asset highlighting
 * - Frontend asset name mapping
 */

import React, { useState } from "react";

export default function SensorList({
  sensors,
  selectedSensor,
  onSelectSensor,
  assetNames,
}) {
  /**
   * Stores current search query.
   */
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Filters assets based on user input.
   */
  const filteredSensors = sensors.filter((sensor) => {
    const displayName = assetNames?.[sensor] || sensor;

    return displayName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  return (
    <aside className="left-panel">
      <h4 className="panel-heading">
        MARKET WATCHLIST
      </h4>

      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search assets..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="watchlist-search"
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "16px",
          background: "#111",
          border: "1px solid #222",
          color: "white",
          borderRadius: "8px",
          outline: "none",
          fontSize: "14px",
        }}
      />

      {/* WATCHLIST */}
      <div className="sensor-list">
        {filteredSensors.length === 0 && (
          <p className="empty-state">
            No matching assets found
          </p>
        )}

        {filteredSensors.map((sensor) => {
          const displayName =
            assetNames?.[sensor] || sensor;

          /**
           * Simulated market movement indicator.
           */
          const randomChange =
            (Math.random() * 4 - 2).toFixed(2);

          const positive =
            Number(randomChange) >= 0;

          return (
            <button
              key={sensor}
              type="button"
              onClick={() => onSelectSensor(sensor)}
              className={`sensor-item ${
                selectedSensor === sensor
                  ? "active"
                  : ""
              }`}
              style={{
                width: "100%",
                background:
                  selectedSensor === sensor
                    ? "#151515"
                    : "transparent",
                border:
                  selectedSensor === sensor
                    ? "1px solid #333"
                    : "1px solid transparent",
                color: "white",
                padding: "14px",
                marginBottom: "10px",
                borderRadius: "10px",
                cursor: "pointer",
                textAlign: "left",
                transition: "0.2s ease",
              }}
            >
              {/* ASSET NAME */}
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <strong
                  style={{
                    fontSize: "16px",
                  }}
                >
                  {displayName}
                </strong>

                {/* MARKET CHANGE */}
                <span
                  style={{
                    color: positive
                      ? "#00ffae"
                      : "#ff4d4d",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  {positive ? "▲" : "▼"}{" "}
                  {Math.abs(randomChange)}%
                </span>
              </div>

              {/* ORIGINAL SENSOR SOURCE */}
              <div
                style={{
                  fontSize: "12px",
                  color: "#777",
                }}
              >
                [{sensor}]
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}