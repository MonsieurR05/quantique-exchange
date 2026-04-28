# Manual Testing Checklist

## Backend Route Tests

| Test | URL | Expected Result | Status |
|---|---|---|---|
| Backend home route | `http://127.0.0.1:5001/` | Returns `Backend running` | Pass |
| Health check route | `http://127.0.0.1:5001/health` | Returns backend status as `ok` | Pass |
| Sensor summary route | `http://127.0.0.1:5001/summary` | Returns sensor names with the number of readings for each sensor | Pass |
| Full data route | `http://127.0.0.1:5001/data` | Returns grouped JSON sensor data by sensor name | Pass |

## Frontend Dashboard Tests

| Test | Expected Result | Status |
|---|---|---|
| Dashboard loads | Page displays the Quantique Exchange title and explanation panel | Pass |
| Sensor cards display | Each available sensor appears as a financial-style asset card | Pass |
| Chart renders | Each sensor card displays a line chart of processed sensor values | Pass |
| Trading signals display | Momentum, Moving Average, and Order Flow Imbalance show BUY, SELL, or HOLD | Pass |
| Loading feedback appears | Dashboard shows a loading message while sensor data is being fetched | Pass |
| Error feedback appears | Dashboard shows an error message if the Flask backend is unavailable | Pass |

## Notes

The `/summary` route was added to make backend testing faster. The full `/data` route can return thousands of sensor readings, so `/summary` provides a lightweight way to confirm that the backend is successfully fetching and grouping live UAL IoT sensor data.

The dashboard was tested by running the Flask backend on port `5001` and the React frontend through Vite.