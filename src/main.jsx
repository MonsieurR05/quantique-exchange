import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Force full black background globally
document.body.style.margin = "0";
document.body.style.backgroundColor = "#0a0a0a";
document.documentElement.style.backgroundColor = "#0a0a0a";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);