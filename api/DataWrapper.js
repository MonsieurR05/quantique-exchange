//============================================================
// DataWrapper.js
// NOTE: You could extend this class, but not necessary.
// Created by Corey Ford - Feb 2026
//============================================================

import SensorAPIClient from "./SensorAPIClient.js";
import { SENSOR_TYPES } from "./SensorTypes.js";

/**
 * Class that wraps sensor data and provides easy access to it.
 */
export default class DataWrapper {
  //============================================================

  /** Get the data structure of sensors
    * @constant {Object<string, {fields: string[], names: string[]}>}
    */
  static SENSOR_TYPES = SENSOR_TYPES;

  /** @type {Object<string, string>} Lookup mapping sensor name to endpoint. */
  sensorLookup;

  /** @type {SensorAPIClient} Internal API client instance. */
  apiClient;

  //============================================================

  /**
   * Create a DataWrapper instance.
   */
  constructor() {
    this.sensorLookup = {};

    // Build lookup from sensors to endpoints
    Object.entries(DataWrapper.SENSOR_TYPES).forEach(
      ([endpoint, config]) => {
        config.names.forEach(name => {
          this.sensorLookup[name] = endpoint;
        });
      }
    );

    // Initialize API client
    this.apiClient = new SensorAPIClient(DataWrapper.SENSOR_TYPES);
  }

  /**
   * Initialize the DataWrapper by initializing the API client.
   * @returns {Promise<void>}
   */
  async init() {
    await this.apiClient.init();
  }

  //============================================================
  // Getters for retrieving data

  /**
   * Get the names of all sensors available in this DataWrapper.
   * @returns {string[]} Array of sensor names.
   */
  getSensorNames() {
    return Object.keys(this.sensorLookup);
  }

  /**
   * Get all field names for a specific sensor.
   * @param {string} name - The name of the sensor.
   * @returns {string[]} Array of field names associated with the sensor.
   *                     Returns an empty array if sensor is not found.
   */
  getFieldsForSensor(name) {
    const endpoint = this.sensorLookup[name];
    return DataWrapper.SENSOR_TYPES[endpoint]?.fields ?? [];
  }

  /**
   * Get the latest value of a specific field for a sensor.
   * If the field is omitted, returns the full latest data object.
   * @param {string} name - The name of the sensor.
   * @param {string} [field] - Optional field name to retrieve.
   * @returns {any|null} Latest value of the specified field, full object, 
   *                     or null if sensor/field/data is unavailable.
   */
  getLatest(name, field) {
    const endpoint = this.sensorLookup[name];
    if (!endpoint) return null;

    const dataArray = this.apiClient.getRawData()[endpoint];
    if (!dataArray?.length) return null;

    const latestItem = dataArray.filter(item => item.name === name).at(-1);
    if (!latestItem) return null;

    return field ? latestItem[field] ?? null : latestItem;
  }

  /**
   * Get all raw sensor data fetched by the API client.
   * @returns {Object<string, any[]>} Object mapping endpoint names to arrays of data objects.
   */
  getRawData() {
    return this.apiClient.getRawData();
  }
}