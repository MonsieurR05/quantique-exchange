/**
 * marketDataSource
 *
 * Decides where the dashboard gets its sensor data from.
 *
 * - Local development: the Flask backend at localhost:5001.
 * - Published demo (VITE_DEMO=true): no backend or API token is needed.
 *   VITE_DEMO_SOURCE picks the data:
 *     "generated" - readings are simulated in the browser for the real UAL
 *                   sensor names, streaming in like a live feed.
 *     "recorded"  - a snapshot of real readings in public/demo-data.json is
 *                   replayed in a loop.
 */

import { assetNameMap } from "../utils/assetNames";

export const DEMO_MODE = import.meta.env.VITE_DEMO === "true";
export const DEMO_SOURCE =
  import.meta.env.VITE_DEMO_SOURCE === "recorded" ? "recorded" : "generated";

const API_URL = "http://localhost:5001/data";
const DEMO_URL = `${import.meta.env.BASE_URL}demo-data.json`;

// The dashboard downsamples every 20 raw readings into one chart point,
// so adding 20 readings per refresh adds one point per second.
const READINGS_PER_TICK = 20;

/**
 * Fetches grouped sensor readings, keyed by sensor name.
 */
export async function fetchSensorData() {
  if (!DEMO_MODE) {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Backend error");
    }

    return response.json();
  }

  return DEMO_SOURCE === "recorded" ? nextRecordedFrame() : nextGeneratedFrame();
}

// -----------------------------
// RECORDED SNAPSHOT
// Replays real readings, starting part-way through and looping at the end.
// -----------------------------

const START_FRACTION = 0.4;

let snapshot = null;
let tick = 0;

async function nextRecordedFrame() {
  if (!snapshot) {
    const response = await fetch(DEMO_URL);

    if (!response.ok) {
      throw new Error("Demo data missing");
    }

    const json = await response.json();

    snapshot = Object.fromEntries(
      Object.entries(json).map(([sensorName, readings]) => [
        sensorName,
        [...readings].sort((a, b) => new Date(a.time) - new Date(b.time)),
      ])
    );
  }

  tick += 1;

  return Object.fromEntries(
    Object.entries(snapshot).map(([sensorName, readings]) => {
      const start = Math.floor(readings.length * START_FRACTION);
      const span = Math.max(readings.length - start, 1);
      const visible = start + ((tick * READINGS_PER_TICK) % span);

      return [sensorName, readings.slice(0, Math.max(visible, 1))];
    })
  );
}

// -----------------------------
// GENERATED READINGS
// Small per-sensor simulators that produce the same fields the UAL API
// returns, so the rest of the dashboard runs unchanged.
// -----------------------------

const HISTORY_READINGS = 1200;
const STEP_MS = 1000 / READINGS_PER_TICK;

const random = (min, max) => min + Math.random() * (max - min);
const noise = () => Math.random() + Math.random() + Math.random() - 1.5;

/**
 * Random walk that drifts back towards a target, like a slowly changing sensor.
 */
function drifting(start, target, pull, wobble, decimals) {
  let value = start;

  return () => {
    value += (target - value) * pull + noise() * wobble;
    return Number(value.toFixed(decimals));
  };
}

/**
 * On/off state that switches on rarely and switches off more quickly.
 */
function toggling(onChance, offChance) {
  let on = false;

  return () => {
    on = on ? Math.random() > offChance : Math.random() < onChance;
    return on;
  };
}

function createSensor(name) {
  if (name.startsWith("SoilMoisture")) {
    const level = random(30, 55);
    const moisture = drifting(level, level, 0.002, 0.25, 1);
    return () => ({ humidity: moisture() });
  }

  if (name.startsWith("TempHumidity")) {
    const base = random(19, 23);
    const temperature = drifting(base, base, 0.003, 0.04, 2);
    const humidity = drifting(45, 45, 0.003, 0.2, 1);
    return () => ({ temperature: temperature(), humidity: humidity() });
  }

  if (name.startsWith("Motion")) {
    const occupied = toggling(0.003, 0.01);
    return () => ({ occupancy: occupied() });
  }

  if (name.startsWith("Door")) {
    const open = toggling(0.002, 0.03);
    return () => ({ contact: !open() });
  }

  return () => ({ water_leak: false });
}

let sensors = null;
let generated = null;
let clock = 0;

function advance(steps) {
  for (let step = 0; step < steps; step += 1) {
    clock += STEP_MS;
    const time = new Date(clock).toISOString();

    for (const [name, nextReading] of sensors) {
      const readings = generated[name];
      readings.push({ name, time, ...nextReading() });

      if (readings.length > HISTORY_READINGS) {
        readings.shift();
      }
    }
  }
}

function nextGeneratedFrame() {
  if (!sensors) {
    sensors = Object.keys(assetNameMap).map((name) => [name, createSensor(name)]);
    generated = Object.fromEntries(sensors.map(([name]) => [name, []]));
    clock = Date.now() - HISTORY_READINGS * STEP_MS;
    advance(HISTORY_READINGS);
  } else {
    advance(READINGS_PER_TICK);
  }

  return Object.fromEntries(
    Object.entries(generated).map(([name, readings]) => [name, [...readings]])
  );
}
