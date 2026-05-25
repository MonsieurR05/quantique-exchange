# Manual Testing Checklist

## Backend Route Tests

| Test | URL / Command | Expected Result | Status |
|---|---|---|---|
| Backend home route | `http://127.0.0.1:5001/` | Returns `Backend running` | Pass |
| Health check route | `http://127.0.0.1:5001/health` | Returns backend status as `ok` | Pass |
| Sensor summary route | `http://127.0.0.1:5001/summary` | Returns sensor names with the number of readings for each sensor | Pass |
| Full data route | `http://127.0.0.1:5001/data` | Returns grouped JSON sensor data by sensor name | Pass |
| Latest readings route | `http://127.0.0.1:5001/latest` | Returns the latest reading for each available sensor | Pass |
| Individual sensor route | `http://127.0.0.1:5001/sensor/<sensor_name>` | Returns readings for the requested sensor or a 404 message if not found | Pass |
| CLI health command | `python manage.py health` | Prints backend health JSON in the terminal | Pass |
| CLI summary command | `python manage.py summary` | Prints sensor count summary in the terminal | Pass |
| CLI data command | `python manage.py data` | Prints backend data or a summarised version of the route output | Pass |
| CLI latest command | `python manage.py latest` | Prints latest readings JSON in the terminal | Pass |

## Frontend Dashboard Tests

| Test | Expected Result | Status |
|---|---|---|
| Dashboard loads | Page displays the Quantique Exchange title and dashboard layout | Pass |
| Market watchlist displays | Sensors appear as company-style market assets | Pass |
| Sensor source transparency | Original backend sensor names appear in small square brackets | Pass |
| Default asset selection | Dashboard prioritises a smoother non-binary asset where available | Pass |
| Chart renders | Selected asset displays a line chart of simulated market values | Pass |
| Chart time labels display | Chart x-axis shows evenly spaced live-style timestamps | Pass |
| Live refresh feedback appears | Dashboard shows live status, last updated time, and refresh count | Pass |
| Trading signals display | Momentum, Moving Average, and Order Flow Imbalance show BUY, SELL, or HOLD | Pass |
| Suggested action displays | Trading panel shows a primary suggested action | Pass |
| Buy button works | Clicking BUY updates current position and owned shares if balance is available | Pass |
| Sell button works | Clicking SELL updates current position and balance if shares are owned | Pass |
| Portfolio balance displays | Trading panel shows simulated portfolio balance | Pass |
| Owned shares display | Trading panel shows the number of owned shares for the selected asset | Pass |
| Loading feedback appears | Dashboard shows a loading message while data is being fetched | Pass |
| Error feedback appears | Dashboard shows an error message if the Flask backend is unavailable | Pass |

## Strategy Signal Tests

| Test | Expected Result | Status |
|---|---|---|
| Momentum strategy | Positive latest return gives BUY, negative latest return gives SELL, otherwise HOLD | Pass |
| Moving Average strategy | Latest value above recent average gives BUY, below average gives SELL, otherwise HOLD | Pass |
| Order Flow Imbalance strategy | More upward movement gives BUY, more downward movement gives SELL, otherwise HOLD | Pass |
| Strategy output format | Each strategy returns one of `BUY`, `SELL`, or `HOLD` | Pass |

## User Feedback Related Tests

| Feedback Point | Test | Expected Result | Status |
|---|---|---|---|
| Graphs should feel live | Check live status and refresh count | Refresh count increases while dashboard is open | Pass |
| Default example should not only be 0/1 | Reload dashboard | First selected asset avoids binary sensor where possible | Pass |
| Trading panel should be clearer | Inspect right panel | Selected asset, price, signals, balance, shares, and actions are visible | Pass |
| Users need clearer asset naming | Check watchlist/chart/trading panel | Company-style names are shown with original sensor IDs in brackets | Pass |

## Notes

The `/summary` route was added to make backend testing faster because the full `/data` route can return thousands of sensor readings. The `/latest` and `/sensor/<sensor_name>` routes provide more focused ways to inspect backend data.

The developer CLI `manage.py` was added so backend routes can be tested from the terminal without manually opening each URL in the browser.

The frontend was tested by running the Flask backend on port `5001` and the React frontend through Vite. The dashboard was checked for loading feedback, error feedback, live refresh indicators, company-style asset naming, strategy signals, and simulated BUY/SELL portfolio behaviour.