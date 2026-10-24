/**
 * marketDataSource
 *
 * Decides where the dashboard gets its sensor data from.
 *
 * - Local development: the Flask backend at localhost:5001.
 * - Published demo (VITE_DEMO=true): a recorded snapshot of real UAL sensor
 *   readings in public/demo-data.json, replayed so it behaves like a live feed.
 *   The demo needs no backend and no API token.
 */

export const DEMO_MODE = import.meta.env.VITE_DEMO === "true";

const API_URL = "http://localhost:5001/data";
const DEMO_URL = `${import.meta.env.BASE_URL}demo-data.json`;

// The dashboard downsamples every 20 raw readings into one chart point,
// so revealing 20 readings per refresh adds one point per second.
const READINGS_PER_TICK = 20;
const START_FRACTION = 0.4;

let snapshot = null;
let tick = 0;

async function loadSnapshot() {
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

/**
 * Returns the readings visible at the current replay position.
 * Each sensor starts part-way through its recording and loops at the end.
 */
function replayFrame() {
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

  if (!snapshot) {
    await loadSnapshot();
  }

  return replayFrame();
}
