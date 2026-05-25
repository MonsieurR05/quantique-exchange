"""Flask backend for Quantique Exchange.

This module exposes API routes for retrieving UAL IoT sensor data and serving
it to the React frontend. The backend keeps API credentials out of the frontend,
groups sensor readings by sensor name, and provides smaller helper routes for
testing and debugging.
"""

import os

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS


load_dotenv()

app = Flask(__name__)
CORS(app)

BASE_URL = os.getenv("BASE_URL")
API_KEY = os.getenv("API_TOKEN")

if not BASE_URL or not API_KEY:
    raise RuntimeError("Missing BASE_URL or API_TOKEN in .env file")

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "apikey": API_KEY,
    "Content-Type": "application/json",
}

# Sensor endpoint names provided by the UAL IoT API.
ENDPOINTS = [
    "door_sensors",
    "motion_sensors",
    "soil_moisture_sensors",
    "temp_humidity_sensors",
    "leak_sensors",
]

# Backend configuration constants.
REQUEST_TIMEOUT_SECONDS = 8
SERVER_PORT = 5001


def fetch_all_data():
    """Fetches and groups readings from all configured sensor endpoints.

    Each endpoint is requested from the UAL IoT API. Returned readings are
    grouped by their sensor `name` field so the frontend can access each sensor
    as a separate market-style asset.

    Returns:
        dict: A dictionary where each key is a sensor name and each value is a
        list of readings for that sensor.
    """
    grouped = {}

    for endpoint in ENDPOINTS:
        try:
            url = f"{BASE_URL}/{endpoint}"
            print("Fetching:", url)

            response = requests.get(
                url,
                headers=HEADERS,
                timeout=REQUEST_TIMEOUT_SECONDS,
            )

            print("Status:", response.status_code)

            if response.status_code != 200:
                continue

            data = response.json()
            print(f"{endpoint} items:", len(data))

            for item in data:
                name = item.get("name")

                if not name:
                    continue

                if name not in grouped:
                    grouped[name] = []

                grouped[name].append(item)

        except requests.RequestException as error:
            print("Request error:", error)

        except ValueError as error:
            print("JSON parsing error:", error)

    print("Final sensors:", list(grouped.keys()))

    return grouped


def get_latest_readings(grouped_data):
    """Gets the most recent reading for each grouped sensor.

    Args:
        grouped_data (dict): Sensor readings grouped by sensor name.

    Returns:
        dict: A dictionary containing the latest reading for each sensor.
    """
    latest = {}

    for sensor_name, readings in grouped_data.items():
        if not readings:
            continue

        sorted_readings = sorted(
            readings,
            key=lambda reading: reading.get("timestamp", 0),
        )

        latest[sensor_name] = sorted_readings[-1]

    return latest


@app.route("/")
def home():
    """Checks that the backend root route is reachable.

    Returns:
        str: Basic backend status message.
    """
    return "Backend running"


@app.route("/health")
def health():
    """Returns backend health status.

    Returns:
        Response: JSON response confirming that the backend is running.
    """
    return jsonify(
        {
            "status": "ok",
            "message": "Backend is running",
        }
    )


@app.route("/data")
def data():
    """Returns all grouped sensor readings.

    Returns:
        Response: JSON response containing grouped sensor readings.
    """
    result = fetch_all_data()
    return jsonify(result)


@app.route("/summary")
def summary():
    """Returns a lightweight count summary for each sensor.

    This route is useful for testing because it avoids returning the full
    sensor dataset.

    Returns:
        Response: JSON response mapping each sensor name to its reading count.
    """
    result = fetch_all_data()

    return jsonify(
        {
            sensor_name: len(values)
            for sensor_name, values in result.items()
        }
    )


@app.route("/latest")
def latest():
    """Returns the latest reading for each available sensor.

    Returns:
        Response: JSON response containing the number of sensors found and the
        latest reading for each sensor.
    """
    result = fetch_all_data()
    latest_readings = get_latest_readings(result)

    return jsonify(
        {
            "count": len(latest_readings),
            "latest_readings": latest_readings,
        }
    )


@app.route("/sensor/<sensor_name>")
def sensor(sensor_name):
    """Returns readings for a specific sensor.

    Args:
        sensor_name (str): Name of the sensor requested through the route.

    Returns:
        Response: JSON response containing sensor readings, or a 404 response
        if the requested sensor does not exist.
    """
    result = fetch_all_data()

    if sensor_name not in result:
        return (
            jsonify(
                {
                    "error": "Sensor not found",
                    "sensor": sensor_name,
                    "available_sensors": list(result.keys()),
                }
            ),
            404,
        )

    return jsonify(
        {
            "sensor": sensor_name,
            "count": len(result[sensor_name]),
            "data": result[sensor_name],
        }
    )


if __name__ == "__main__":
    app.run(port=SERVER_PORT, debug=True)