//============================================================
// sketch.js
// NOTE: This is the likley entry point for your app.
// Created by Corey Ford - Feb 2026
//============================================================

import DataWrapper from "../api/DataWrapper.js";
import DashboardGrid from "./DashboardGrid.js";

/** @type {DataWrapper} Handle API/data operations. */
let dataWrapper;

/** @type {DashboardGrid} To draw dashboard layout. */
let dashboard;

/** @type {boolean} Check if app is ready to render dashboard. */
let isReady = false;

/** @type {string} Text on initial loading. */
let loadingText = "Loading data...";

/** @type {string} Text on initial loading. */
let frameCounter = 0;
//============================================================

/**
 * Setup function to initialize canvas and start the app.
 */
window.setup = function () {
  // Setup canvas size, font and colours.
  createCanvas(910, 610);
  textFont("monospace");
  textSize(16);
  stroke(255);
  fill(255);
  background(30);

  // Create a new instance of DataWrapper
  dataWrapper = new DataWrapper();

  // Run async initialization separately.
  initialise();
};

/**
 * Initializes data from API and build dashboard layout.
 */
async function initialise() {
  await dataWrapper.init();

  // Create a dashboard grid with 3 rows and 5 columns
  dashboard = new DashboardGrid(dataWrapper, 3, 5);
  dashboard.buildLayout();

  // Set ready once initialisation is complete
  isReady = true;
}

/**
 * Draw function to render canvas repeatedly.
 */
window.draw = function () {
  background(30);

  // Give some sense of progress whilst data is loading...
  if (!isReady) {
    frameCounter++;
    text(loadingText, 20, 40);
    if (frameCounter % 15 === 0)
      loadingText+=".";
    return;
  }

  // Draw the dashboard
  dashboard.draw();
};
