/**
 * SensorList
 *
 * Displays the available market assets and allows the user
 * to select which asset should be shown on the main chart.
 *
 * Backend sensor IDs are preserved internally while the UI
 * displays readable company names.
 */

import React from "react";

export default function SensorList({
  sensors,
  selectedSensor,
  onSelectSensor,
  assetNames,
}) {
  return (
    <aside className="left-panel">
      <h4 className="panel-heading">MARKET WATCHLIST</h4>

      <div className="sensor-list">
        {sensors.length === 0 && (
          <p className="empty-state">No market assets available</p>
        )}

        {sensors.map((sensor) => {
          const displayName = assetNames?.[sensor] || sensor;

          return (
            <button
              key={sensor}
              type="button"
              onClick={() => onSelectSensor(sensor)}
              className={`sensor-item ${
                selectedSensor === sensor ? "active" : ""
              }`}
            >
              <span className="asset-name">{displayName}</span>
              <span className="sensor-source">[{sensor}]</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}