import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// 🔹 Helper to extract correct value from any sensor type
const getValue = (d) => {
  if (d.contact !== undefined) return d.contact ? 1 : 0;
  if (d.occupancy !== undefined) return d.occupancy;
  if (d.temperature !== undefined) return d.temperature;
  if (d.humidity !== undefined) return d.humidity;
  if (d.illumination !== undefined) return d.illumination;
  if (d.water_leak !== undefined) return d.water_leak ? 1 : 0;
  return 0;
};

export default function SensorDashboard() {
  const [sensorData, setSensorData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5001/data");

        if (!res.ok) {
          throw new Error(`Backend error: ${res.status}`);
        }

        const json = await res.json();

        console.log("Fetched data:", json); // DEBUG

        const updated = {};

        Object.entries(json).forEach(([sensorName, raw]) => {
          if (!raw || raw.length === 0) return;

          const formatted = raw.map((d) => ({
            time: new Date(d.time).toLocaleTimeString(),
            value: getValue(d),
          }));

          updated[sensorName] = formatted;
        });

        setSensorData(updated);
        setError(null);

      } catch (err) {
        console.error("Fetch failed:", err);
        setError(err.message);
      }
    };

    fetchData(); // initial call
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: "#111", padding: "20px", color: "white" }}>
      <h2>Live Sensor Dashboard</h2>

      {/* 🔴 Error display */}
      {error && (
        <p style={{ color: "red" }}>
          Error: {error}
        </p>
      )}

      {/* 🟡 No data */}
      {!error && Object.keys(sensorData).length === 0 && (
        <p>No data received yet...</p>
      )}

      {/* 📊 Charts */}
      {Object.entries(sensorData).map(([sensorName, data]) => (
        <div
          key={sensorName}
          style={{
            marginBottom: "40px",
            padding: "15px",
            background: "#1a1a1a",
            borderRadius: "8px",
          }}
        >
          <h3>{sensorName}</h3>

          {/* Debug info */}
          <p style={{ fontSize: "12px", color: "#aaa" }}>
            Data points: {data.length}
          </p>

          <LineChart width={800} height={250} data={data}>
            <CartesianGrid stroke="#333" />
            <XAxis dataKey="time" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#00ff99" />
          </LineChart>
        </div>
      ))}
    </div>
  );
}