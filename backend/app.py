from flask import Flask, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

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
    "Content-Type": "application/json"
}

# ---------------------------------------------------
# ALL SENSOR ENDPOINTS (from your SensorTypes.js)
# ---------------------------------------------------
ENDPOINTS = [
    "door_sensors",
    "motion_sensors",
    "soil_moisture_sensors",
    "temp_humidity_sensors",
    "leak_sensors"
]

# ---------------------------------------------------
# FETCH + GROUP DATA (same logic as DataWrapper)
# ---------------------------------------------------
def fetch_all_data():
    grouped = {}

    for endpoint in ENDPOINTS:
        try:
            url = f"{BASE_URL}/{endpoint}"
            print("Fetching:", url)

            res = requests.get(url, headers=HEADERS)

            print("Status:", res.status_code)

            if res.status_code != 200:
                continue

            data = res.json()
            print(f"{endpoint} items:", len(data))

            for item in data:
                name = item.get("name")
                if not name:
                    continue

                if name not in grouped:
                    grouped[name] = []

                grouped[name].append(item)

        except Exception as e:
            print("Error:", e)

    print("Final sensors:", list(grouped.keys()))

    return grouped

# ---------------------------------------------------
# ROUTES
# ---------------------------------------------------
@app.route("/")
def home():
    return "Backend running"

@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "message": "Backend is running"
    })

@app.route("/data")
def data():
    result = fetch_all_data()
    return jsonify(result)

@app.route("/summary")
def summary():
    result = fetch_all_data()

    return jsonify({
        sensor_name: len(values)
        for sensor_name, values in result.items()
    })

# ---------------------------------------------------
# RUN SERVER
# ---------------------------------------------------
if __name__ == "__main__":
    app.run(port=5001, debug=True)