// -----------------------------
// VALUE EXTRACTION
// Converts different sensor fields into one numeric value.
// -----------------------------
export const getValue = (d) => {
  if (d.contact !== undefined) return d.contact ? 1 : 0;
  if (d.occupancy !== undefined) return d.occupancy;
  if (d.temperature !== undefined) return d.temperature;
  if (d.humidity !== undefined) return d.humidity;
  if (d.illumination !== undefined) return d.illumination;
  if (d.water_leak !== undefined) return d.water_leak ? 1 : 0;
  return 0;
};

// -----------------------------
// DOWNSAMPLE
// Reduces chart density so the dashboard stays readable.
// -----------------------------
export const downsample = (data, step = 20) => {
  return data.filter((_, i) => i % step === 0);
};

// -----------------------------
// PREPROCESSING
// Sorts sensor data, converts values, calculates returns,
// and reduces chart noise.
// -----------------------------
export const preprocessData = (raw) => {
  if (!raw || raw.length === 0) return [];

  const sorted = [...raw].sort(
    (a, b) => new Date(a.time) - new Date(b.time)
  );

  const base = sorted.map((d) => ({
    time: new Date(d.time),
    displayTime: new Date(d.time).toLocaleTimeString(),
    value: getValue(d),
  }));

  const withReturns = base.map((d, i) => {
    if (i === 0) return { ...d, return: 0 };

    return {
      ...d,
      return: d.value - base[i - 1].value,
    };
  });

  return downsample(withReturns, 20);
};