# Project Architecture

## Overview

Quantique Exchange uses live UAL IoT sensor data and presents it as a financial-style trading simulation. The final prototype uses a React frontend and a Flask backend. The Flask backend fetches live sensor readings from the UAL sensor API, groups the data by sensor name, and exposes simplified routes for the frontend.

## Final Architecture Flow

```text
UAL IoT Sensor API
        ↓
Flask Backend
/routes: /, /health, /summary, /data
        ↓
React Dashboard
        ↓
Sensor Processing Utilities
        ↓
Trading Strategy Classes
        ↓
Recharts Visual Dashboard