//============================================================
// sketch.js
// NOTE: This is the likley entry point for your app.
// Created by Corey Ford - Feb 2026
//============================================================

import DataWrapper from "../api/DataWrapper.js";

/** @type {DataWrapper} Handle API/data operations. */
let dataWrapper;

/** @type {boolean} Check if app is ready to render sensors. */
let isReady = false;

//============================================================

/**
 * Setup function to initialize canvas and start the app.
 */
window.setup = function () {
  // Setup canvas size, font and colours.
  createCanvas(910, 610);
  background(0);
  
  frameRate(0.2); //< slow down the sketch to avoid spam.

  // Create a new instance of DataWrapper
  dataWrapper = new DataWrapper();
  initialise(); //< Run async initialization separately.
};

/**
 * Initializes data from API.
 */
async function initialise() {
  await dataWrapper.init();
  isReady = true;
}

/**
 * Draw function to render canvas repeatedly.
 */
window.draw = function () {
  if (isReady){

    // To get the full database of values from a sensor
    print("All DoorSensor302 values:", 
          dataWrapper.getAll("DoorSensor302")
        );

    // To get the full database of values from a sensor, for a certain param
    print("All DoorSensor302 contacts: ",
          dataWrapper.getAll("DoorSensor302", "contact")
        );

    // To get the values before a certain time
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    print("All DoorSensor302 times ten mins ago: ", 
          dataWrapper.getSinceTime("DoorSensor302", tenMinutesAgo, "time")
        );

    // To get the latest values from a sensor
    print("Most recent DoorSensor302 values: ",
          dataWrapper.getLatest("DoorSensor302")
        );

    // To get the latest specific value from a sensor
    // Note, This also polls every 5 seconds, so updates frequently 
    print("Most recent DoorSensor302 contacts: ",
          dataWrapper.getLatest("DoorSensor302", "contact")
        );

    //=======

    // To get an array of sensor names...
    // print(dataWrapper.getSensorNames());

    // To get the fields from a particular sensor... 
    // (See api/SensorTypes.js for list of sensors)
    // print(dataWrapper.getFieldsForSensor("DoorSensor302"));

    console.log("=============");

  } else {
    console.log("Loading...");
  }
};
