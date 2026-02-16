//============================================================
// DashboardGrid.js
// Created by Corey Ford - Feb 2026
//============================================================

import SensorCard from "./SensorCard.js";

/**
 * Class representing a grid of sensor cards on the dashboard.
 */
export default class DashboardGrid {
  /**
   * Create a DashboardGrid.
   * @param {Object} dataWrapper - Get DataWrapper to fetch sensor data.
   * @param {number} [cols=3] - Number of columns in the grid.
   * @param {number} [rows=5] - Number of rows in the grid.
   */
  constructor(dataWrapper, cols = 3, rows = 5) {
    /** @type {Object} */
    this.dataWrapper = dataWrapper;

    /** @type {number} */
    this.cols = cols;

    /** @type {number} */
    this.rows = rows;

    /** @type {SensorCard[]} Array of sensor cards in the grid. */
    this.cards = [];
  }

  /**
   * Build grid layout for each sensor.
   */
  buildLayout() {
    const sensorNames = this.dataWrapper.getSensorNames();

    const w = 300;
    const h = 120;

    let acc = 0; //< accumulator to count sensor index

    this.cards = [];

    for (let col = 0; col < this.rows; col++) {
      for (let row = 0; row < this.cols; row++) {
        const name = sensorNames[acc];
        if (!name) continue;

        const x = 5 + row * w;
        const y = 5 + col * h;

        this.cards.push(
          new SensorCard(this.dataWrapper, name, x, y, w, h)
        );

        acc++;
      }
    }
  }

  /**
   * Draws all sensor cards in the grid on the canvas.
   */
  draw() {
    this.cards.forEach(card => card.draw());
  }
}
