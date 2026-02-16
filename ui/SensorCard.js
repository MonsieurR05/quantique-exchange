//============================================================
// DataWrapper.js
// Created by Corey Ford - Feb 2026
//============================================================

/**
 * Class representing a sensor card in the dashboard.
 */
export default class SensorCard {
  /**
   * Create a SensorCard.
   * @param {Object} dataWrapper - Instance of DataWrapper to fetch sensor data.
   * @param {string} sensorName - Name of the sensor to display.
   * @param {number} x - X-coordinate of the card on the canvas.
   * @param {number} y - Y-coordinate of the card on the canvas.
   * @param {number} w - Width of the card.
   * @param {number} h - Height of the card.
   */
  constructor(dataWrapper, sensorName, x, y, w, h) {
    /** @type {Object} */
    this.dataWrapper = dataWrapper;

    /** @type {string} */
    this.sensorName = sensorName;

    /** @type {number} */
    this.x = x;

    /** @type {number} */
    this.y = y;

    /** @type {number} */
    this.w = w;

    /** @type {number} */
    this.h = h;
  }

  /**
   * Draws the sensor card on the canvas.
   * Displays the sensor name and its latest field values (except "time").
   */
  draw() {
    // Background
    fill(30);
    stroke(255);
    rect(this.x, this.y, this.w, this.h);

    fill(255);

    // Title
    text(this.sensorName, this.x + 10, this.y + 25);

    // Fields
    const fields = this.dataWrapper.getFieldsForSensor(this.sensorName);

    let offsetY = this.y + 50;

    fields.forEach(field => {
      if (field === "time") return;

      const value = this.dataWrapper.getLatest(this.sensorName, field);
      if (value === null || value === undefined) return;

      text(`${field}: ${value}`, this.x + 20, offsetY);
      offsetY += 25;
    });
  }
}
