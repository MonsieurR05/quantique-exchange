import React, { useEffect } from "react";
import DataWrapper from "../../api/DataWrapper.js";

export default function P5Sketch() {
  useEffect(() => {
    let dataWrapper;
    let intervalId;

    async function initialise() {
      try {
        dataWrapper = new DataWrapper();
        await dataWrapper.init();

        console.log("DataWrapper initialised");

        intervalId = setInterval(() => {
          console.log(
            "Most recent DoorSensor302 values:",
            dataWrapper.getLatest("DoorSensor302")
          );

          console.log(
            "Most recent DoorSensor302 contact:",
            dataWrapper.getLatest("DoorSensor302", "contact")
          );

          const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
          console.log(
            "DoorSensor302 times ten mins ago:",
            dataWrapper.getSinceTime("DoorSensor302", tenMinutesAgo, "time")
          );

          console.log("=============");
        }, 5000);
      } catch (err) {
        console.error("Initialise failed:", err);
      }
    }

    initialise();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (dataWrapper?.apiClient) {
        dataWrapper.apiClient.stopPolling();
      }
    };
  }, []);

  return (
    <div
      style={{
        width: "910px",
        height: "610px",
        backgroundColor: "black",
      }}
    />
  );
}