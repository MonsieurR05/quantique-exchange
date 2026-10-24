# Quantique Exchange

Quantique Exchange is a web dashboard that turns live UAL IoT sensor data into a simple trading-style simulation.

The project has two main parts:

- A **Flask backend** that fetches live sensor data.
- A **React frontend** that displays the data as market-style assets with charts, trading signals, and simple BUY/SELL actions.

This is a simulation only. It does not use real financial data or real money.

## My Role

This was a two-person team project. My part:

- Extended the Flask API with the summary, latest-reading and per-sensor routes
- Built the developer CLI (`backend/manage.py`) for testing routes from the terminal
- Refactored the trading signals into strategy classes behind a shared `TradingStrategy` interface
- Moved the API credentials out of the code into environment variables, with a startup check
- Added request timeouts so a slow sensor endpoint can't hang the dashboard
- Wrote the architecture and testing documentation

My teammate led the Bloomberg-style dashboard design and the trading interactions.

## Live Demo

**https://monsieurr05.github.io/quantique-exchange/**

The public demo runs without the backend or an API token. In demo mode, readings for the real UAL sensor names are simulated in the browser and stream in every second, so the charts, strategies and trading panel all work as they do with live data. The full version reads live data from the UAL IoT sensor API through the Flask backend.

To run the demo locally:

```bash
npm install
npm run dev:demo
```

Set `VITE_DEMO_SOURCE=recorded` in `.env.demo` and add `public/demo-data.json` (saved from the backend's `/data` route) to replay recorded readings instead.


---

## What the Project Does

1. The backend connects to the UAL IoT sensor API.
2. The backend groups sensor readings by sensor name.
3. The frontend fetches that grouped data from the backend.
4. The frontend displays each sensor as a company-style asset.
5. The dashboard shows a live chart for the selected asset.
6. Trading strategies generate BUY, SELL, or HOLD signals.
7. Users can simulate buying or selling an asset.
8. The dashboard updates the simulated balance and owned shares.

Example:

```text
NVIDIA
[SoilMoistureSensor-Corby]
```

The company name makes the dashboard easier to understand.  
The sensor name in square brackets shows the real data source.

---

## Main Features

- Live UAL IoT sensor data
- React dashboard
- Flask backend API
- Company-style asset names
- Original sensor names shown in brackets
- Live chart updates
- Last updated time
- Refresh counter
- BUY and SELL buttons
- Simulated portfolio balance
- Owned shares tracking
- Trading signals:
  - Momentum
  - Moving Average
  - Order Flow Imbalance
- Backend route testing
- Developer CLI for checking backend routes

---

## Tech Used

### Frontend

- React
- Vite
- JavaScript
- Recharts
- CSS

### Backend

- Python
- Flask
- Flask-CORS
- Requests
- python-dotenv

---

## Project Structure

```text
quantique-exchange/
│
├── backend/
│   ├── app.py
│   ├── manage.py
│   ├── data_wrapper.py
│   ├── sensor_client.py
│   └── requirements.txt
│
├── docs/
│   ├── architecture.md
│   ├── testing.md
│   └── user-feedback-actions.md
│
├── src/
│   ├── api/
│   │   ├── marketDataSource.js
│   │   ├── DataWrapper.js
│   │   ├── SensorAPIClient.js
│   │   └── SensorTypes.js
│   │
│   ├── components/
│   │   ├── SensorDashboard.jsx
│   │   ├── SensorList.jsx
│   │   ├── SensorChart.jsx
│   │   ├── LiveStatus.jsx
│   │   ├── TradingPanel.jsx
│   │   ├── EvaluationPanel.jsx
│   │   ├── InfoTooltip.jsx
│   │   └── TutorialOverlay.jsx
│   │
│   ├── strategies/
│   │   ├── TradingStrategy.js
│   │   ├── MomentumStrategy.js
│   │   ├── MovingAverageStrategy.js
│   │   └── OrderFlowImbalanceStrategy.js
│   │
│   ├── utils/
│   │   ├── sensorProcessing.js
│   │   ├── chartTime.js
│   │   ├── signalStyles.js
│   │   └── assetNames.js
│   │
│   ├── styles/
│   │   └── SensorDashboard.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .github/workflows/pages.yml
├── .env.example
├── .env.demo
├── package.json
└── README.md
```

---

## How to Run the Project

You need **two terminals**:

- Terminal 1 runs the Flask backend.
- Terminal 2 runs the React frontend.

---

## 1. Clone the Project

```bash
git clone https://github.com/MonsieurR05/quantique-exchange.git
cd quantique-exchange
```

---

## 2. Set Up the Backend

Open Terminal 1.

Go into the backend folder:

```bash
cd backend
```

Install the Python dependencies:

```bash
python -m pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder.

Use this format:

```env
BASE_URL=http://your-sensor-api-host:3000
API_TOKEN=your_api_token_here
BACKEND_URL=http://127.0.0.1:5001
```

Replace `your_api_token_here` with the real API token.

Start the backend:

```bash
python app.py
```

The backend should run at:

```text
http://127.0.0.1:5001
```

To check the backend is working, open this in the browser:

```text
http://127.0.0.1:5001/health
```

Expected result:

```json
{
  "message": "Backend is running",
  "status": "ok"
}
```

Keep this terminal running.

---

## 3. Set Up the Frontend

Open Terminal 2.

Go to the main project folder:

```bash
cd quantique-exchange
```

Install frontend dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Vite will show a local URL. It is usually:

```text
http://localhost:5173
```

Open that URL in the browser.

---

## 4. Test Backend Routes

With the backend running, these routes can be opened in the browser:

| Route | What it does |
|---|---|
| `http://127.0.0.1:5001/` | Checks the backend is running |
| `http://127.0.0.1:5001/health` | Returns backend health status |
| `http://127.0.0.1:5001/summary` | Shows sensor names and reading counts |
| `http://127.0.0.1:5001/latest` | Shows the latest reading for each sensor |
| `http://127.0.0.1:5001/data` | Returns full grouped sensor data |
| `http://127.0.0.1:5001/sensor/<sensor_name>` | Returns data for one sensor |

Example:

```text
http://127.0.0.1:5001/sensor/SoilMoistureSensor-Corby
```

---

## 5. Optional: Use the Developer CLI

The project includes a small backend CLI for route testing.

In a terminal, go to the backend folder:

```bash
cd backend
```

Run:

```bash
python manage.py health
```

Other useful commands:

```bash
python manage.py summary
python manage.py latest
python manage.py data
```

The `data` command can return a lot of information because it checks the full sensor dataset.

---

## How the Dashboard Works

### Market Watchlist

The left panel shows available assets.

Each asset has:

- A company-style name
- The original sensor name in square brackets

Example:

```text
NVIDIA
[SoilMoistureSensor-Corby]
```

Clicking an asset changes the chart and trading panel.

---

### Live Chart

The middle panel shows the selected asset as a live line or area chart.

The chart:

- Uses live backend data
- Updates regularly
- Shows a refresh status
- Shows how many data points are loaded

The chart uses generated display times so the x-axis is easier to read.

---

### Trading Panel

The right panel shows:

- Selected asset
- Original sensor source
- Market price
- Return
- Portfolio balance
- Owned shares
- Strategy signals
- Suggested action
- BUY and SELL buttons

Clicking BUY or SELL updates the simulated balance and owned shares.

---

## Trading Signals

The dashboard uses three simple strategies.

### Momentum

Looks at the latest movement.

```text
Positive movement = BUY
Negative movement = SELL
No clear movement = HOLD
```

### Moving Average

Compares the latest value with the recent average.

```text
Above average = BUY
Below average = SELL
Close to average = HOLD
```

### Order Flow Imbalance

Compares recent upward movement with recent downward movement.

```text
More upward movement = BUY
More downward movement = SELL
Balanced movement = HOLD
```

---

## Important Notes

- This is a simulation.
- It does not use real stock market data.
- It does not use real money.
- Company names are used to make the interface easier to understand.
- The real sensor source is still shown in square brackets.
- The project needs a valid UAL IoT API token to load live data.
- If the API token is missing or expired, the dashboard will show an error.

---

## Troubleshooting

### Backend does not start

Check that dependencies are installed:

```bash
python -m pip install -r requirements.txt
```

Check that the `.env` file exists inside `backend`.

Check that it includes:

```env
BASE_URL=http://your-sensor-api-host:3000
API_TOKEN=your_api_token_here
BACKEND_URL=http://127.0.0.1:5001
```

---

### Frontend shows an error

Make sure the backend is running:

```bash
cd backend
python app.py
```

Then check:

```text
http://127.0.0.1:5001/health
```

If this route does not work, the frontend will not be able to load data.

---

### Charts look flat or jumpy

Some sensors only return values like `0` and `1`.

These sensors are binary sensors, such as door, motion, or leak sensors.

The dashboard tries to choose smoother sensors first where possible.

---

### Terminal prints too much data

The `/data` route can return a large JSON response.

Use `/summary` or the CLI summary command for a shorter output:

```bash
python manage.py summary
```

---

## Documentation

More project documentation is available in the `docs` folder:

| File | Purpose |
|---|---|
| `architecture.md` | Explains how the system is structured |
| `testing.md` | Manual testing checklist |
| `user-feedback-actions.md` | Shows how user feedback affected the project |

---

## Commit Style

The project uses this commit format:

```text
type[area]: message
```

Examples:

```text
feat[frontend]: add company-style asset mapping
fix[frontend]: prioritise smoother default sensor
refactor[frontend]: extract trading panel component
docs[project]: update manual testing checklist
chore[backend]: add Python dependencies
```

---

## Future Improvements

Possible future improvements:

- Beginner help panel
- Better portfolio history
- Trade history log
- Strategy filters
- Sensor type filters
- Backend caching
- Automated strategy tests
- Full backtesting mode
- Saved user sessions

---

## Summary

Quantique Exchange is a live IoT data dashboard presented as a trading simulation. The backend fetches UAL sensor data, the frontend turns it into market-style assets, and users can view charts, read trading signals, and simulate BUY/SELL actions.

The project focuses on clear data flow, simple interaction, modular code, and user feedback-led improvements.

---

## Credits

Built as a two-person team project on the Computer Science course at University of the Arts London (see My Role above). The starter template was provided by the course.

Before this copy was published, the commit history was cleaned: teammate and staff details were anonymised, and an old API token and internal links were removed.
