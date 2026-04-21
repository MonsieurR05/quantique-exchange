import React, { useEffect, useState } from "react";
import DataWrapper from "../../api/DataWrapper.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function SensorDashboard() {
  const [dataWrapper, setDataWrapper] = useState(null);
  const [sensorData, setSensorData] = useState({});

  useEffect(() => {
    let wrapper = new DataWrapper();
    let intervalId;

    async function initialise() {
      await wrapper.init();
      setDataWrapper(wrapper);

      intervalId = setInterval(() => {
        const allSensors = wrapper.getSensorNames();
        const updatedData = {};

        allSensors.forEach((sensorName) => {
          const raw = wrapper.getAll(sensorName);

          if (!raw || raw.length === 0) return;

          const fields = wrapper.getFieldsForSensor(sensorName);

          // pick first non-time field
          const valueField = fields.find((f) => f !== "time");

          const formatted = raw.map((d) => ({
            time: new Date(d.time).toLocaleTimeString(),
            value: d[valueField] ?? 0,
          }));

          updatedData[sensorName] = formatted;
        });

        setSensorData(updatedData);
      }, 5000);
    }

    initialise();

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ background: "#111", padding: "20px", color: "white" }}>
      <h2>All Sensor Data Dashboard</h2>

      {Object.entries(sensorData).map(([sensorName, data]) => (
        <div key={sensorName} style={{ marginBottom: "40px" }}>
          <h3>{sensorName}</h3>

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