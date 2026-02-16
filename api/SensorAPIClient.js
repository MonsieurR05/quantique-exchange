//============================================================
// SensorAPIClient.js
// Created by Corey Ford - Feb 2026
//============================================================

import { SENSOR_TYPES } from "./SensorTypes.js";

/**
 * Class for interacting with sensor APIs.
 * Handles fetching sensor data, storing it, and polling updates.
 */
export default class SensorAPIClient {
  constructor() {
    /** @type {string|null} Base URL for API requests */
    this.baseUrl = null;

    /** @type {string|null} API token for authentication */
    this.apiToken = null;

    /** @type {Object<string, any[]>} Stores fetched sensor data per endpoint */
    this.sensors = {};

    /** @type {boolean} If a fetch is in progress */
    this.isFetching = false;

    /** @type {boolean} If polling is active */
    this.polling = false;

    // Initialise empty arrays for each sensor endpoint
    Object.keys(SENSOR_TYPES).forEach(endpoint => {
      this.sensors[endpoint] = [];
    });
  }

  /**
   * Initialize the client by fetching configuration and initial sensor data,
   * then start polling.
   * @returns {Promise<void>}
   * @throws Will throw an error if fetching /config fails.
   */
  async init() {
    const configResponse = await fetch("/config");
    if (!configResponse.ok) throw new Error("Failed to load config");

    const config = await configResponse.json();
    this.baseUrl = config.baseUrl;
    this.apiToken = config.apiToken;

    await this.fetchAll();
    this.startPolling();
  }

  /**
   * Start polling all sensor endpoints every 5 seconds.
   */
  startPolling() {
    if (this.polling) return;
    this.polling = true;

    const poll = async () => {
      if (!this.polling) return;

      await this.fetchAll();
      setTimeout(poll, 5000);
    };

    poll();
  }

  /**
   * Stop the polling loop.
   */
  stopPolling() {
    this.polling = false;
  }

  /**
   * Fetch data for all sensor endpoints in parallel.
   * Ensures that multiple fetches do not overlap.
   * @returns {Promise<void>}
   */
  async fetchAll() {
    if (this.isFetching) return; //< no overlap!
    this.isFetching = true;

    try {
      await Promise.all(
        Object.keys(SENSOR_TYPES).map(endpoint =>
          this.fetchEndpoint(endpoint)
        )
      );
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Fetch data from a single sensor endpoint with a timeout.
   * @param {string} endpoint - Name of the sensor endpoint to fetch.
   * @returns {Promise<void>}
   */
  async fetchEndpoint(endpoint) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "apikey": this.apiToken,
          "Content-Type": "application/json"
        }
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Fetch ${endpoint} failed: ${response.status}`);
      }

      this.sensors[endpoint] = await response.json();

    } catch (error) {
      clearTimeout(timeout);
      if (error.name === "AbortError") return;
      console.error(`Error fetching ${endpoint}:`, error);
    }
  }

  /**
   * Get the raw sensor data.
   * @returns {Object<string, any[]>} Mapping of endpoint names to their fetched data arrays.
   */
  getRawData() {
    return this.sensors;
  }
}
