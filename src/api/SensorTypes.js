//============================================================
// SensorTypes.js
// NOTE: You could extend this class, but not necessary.
// Created by Corey Ford - Feb 2026
//============================================================

/**
 * Data structure of all sensor types, their fields, and sensor names.
 * @constant {Object<string, {fields: string[], names: string[]}>}
 */
export const SENSOR_TYPES = Object.freeze({
  door_sensors: {
    fields: ["contact", "time"],
    names: [
      "DoorSensor302",
      "DoorSensor308",
      "DoorSensorEntrance",
      "DoorSensorTechOffice"
    ]
  },
  motion_sensors: {
    fields: ["occupancy", "illumination", "time"],
    names: [
      "MotionSensor-302",
      "MotionSensor-HCILab",
      "MotionSensor-Kitchen",
      "MotionSensor308"
    ]
  },
  soil_moisture_sensors: {
    fields: ["temperature", "humidity", "time"],
    names: [
      "SoilMoistureSensor-Corby",
      "SoilMoistureSensor-Lizzie",
      "SoilMoistureSensor-Mick",
      "SoilMoistureSensor-Sarah"
    ]
  },
  temp_humidity_sensors: {
    fields: ["temperature", "humidity", "time"],
    names: [
      "TempHumiditySensor-HCILab",
      "TempHumiditySensor-Kitchen"
    ]
  },
  leak_sensors: {
    fields: ["water_leak", "time"],
    names: ["LeakSensor"]
  }
});
