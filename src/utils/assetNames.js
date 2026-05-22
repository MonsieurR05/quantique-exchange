/**
 * Maps technical UAL sensor names to company-style asset names.
 *
 * The real sensor name is still available for technical honesty,
 * but the user-facing interface can present the data as a simulated market asset.
 */

export const assetNameMap = {
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

export function getAssetName(sensorName) {
  return assetNameMap[sensorName] || sensorName;
}