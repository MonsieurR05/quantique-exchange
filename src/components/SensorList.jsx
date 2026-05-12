/**
 * SensorList
 *
 * Displays the available sensors and allows the user to select
 * which sensor should be shown on the main dashboard chart.
 */

import React from "react";

export default function SensorList({ sensors, selectedSensor, onSelectSensor }) {
  return (
    <aside className="left-panel">
      <h4 className="panel-heading">SENSORS</h4>

      <div className="sensor-list">
        {sensors.length === 0 && (
          <p className="empty-state">No sensors available</p>
        )}

        {sensors.map((sensor) => (
          <button
            key={sensor}
            type="button"
            onClick={() => onSelectSensor(sensor)}
            className={`sensor-item ${
              selectedSensor === sensor ? "active" : ""
            }`}
          >
            {sensor}
          </button>
        ))}
      </div>
    </aside>
  );
}