/**
 * TutorialOverlay
 *
 * Beginner-friendly overlay explaining how the Quantique Exchange dashboard
 * works. It is shown when users click the Help button in the header.
 */

import React from "react";

export default function TutorialOverlay({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="tutorial-backdrop">
      <div className="tutorial-modal">
        <div className="tutorial-header">
          <div>
            <h2>How Quantique Exchange Works</h2>
            <p>
              A simple guide to understanding the live sensor trading
              simulation.
            </p>
          </div>

          <button type="button" className="tutorial-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="tutorial-steps">
          <div className="tutorial-step">
            <span className="tutorial-number">1</span>
            <div>
              <h3>Live sensor data is collected</h3>
              <p>
                The backend fetches live UAL IoT sensor readings such as soil
                moisture, movement, door state, temperature, and humidity.
              </p>
            </div>
          </div>

          <div className="tutorial-step">
            <span className="tutorial-number">2</span>
            <div>
              <h3>Sensors become market assets</h3>
              <p>
                Each sensor is displayed as a company-style asset, such as
                NVIDIA or Apple. The original sensor name is still shown in
                square brackets.
              </p>
            </div>
          </div>

          <div className="tutorial-step">
            <span className="tutorial-number">3</span>
            <div>
              <h3>The chart shows live movement</h3>
              <p>
                The chart updates automatically. The refresh counter and last
                updated time show that the dashboard is checking for new data.
              </p>
            </div>
          </div>

          <div className="tutorial-step">
            <span className="tutorial-number">4</span>
            <div>
              <h3>Strategies create signals</h3>
              <p>
                Momentum, Moving Average, and Order Flow Imbalance each return
                a BUY, SELL, or HOLD signal based on recent movement.
              </p>
            </div>
          </div>

          <div className="tutorial-step">
            <span className="tutorial-number">5</span>
            <div>
              <h3>You can simulate trades</h3>
              <p>
                The BUY and SELL buttons update your simulated balance and
                owned shares. No real money or real market data is used.
              </p>
            </div>
          </div>
        </div>

        <div className="tutorial-signal-guide">
          <div>
            <span className="signal-pill buy-pill">BUY</span>
            <p>The recent movement looks positive.</p>
          </div>

          <div>
            <span className="signal-pill sell-pill">SELL</span>
            <p>The recent movement looks negative.</p>
          </div>

          <div>
            <span className="signal-pill hold-pill">HOLD</span>
            <p>The system is unsure, so waiting is safer.</p>
          </div>
        </div>

        <button type="button" className="tutorial-primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}