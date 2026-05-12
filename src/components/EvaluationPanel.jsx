/**
 * EvaluationPanel
 *
 * Displays simple evaluation metrics for the selected sensor.
 * These metrics help users understand how active or directional
 * the recent sensor-derived signal data has been.
 */

export default function EvaluationPanel({ accuracy, strength }) {
  return (
    <div className="evaluation-section">
      <h4 className="panel-heading">EVALUATION</h4>

      <div className="metric-row">
        <span>Accuracy</span>
        <strong
          className={Number(accuracy) > 60 ? "positive-text" : "negative-text"}
        >
          {accuracy}%
        </strong>
      </div>

      <div className="metric-row">
        <span>Signal Strength</span>
        <strong>{strength}</strong>
      </div>
    </div>
  );
}