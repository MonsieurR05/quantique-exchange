//============================================================
// run.js
// NOTE: You should not need to change this file at any point.
// Created by Corey Ford - Feb 2026
//============================================================

import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

//============================================================

dotenv.config(); //< Load environment variables from .env file

/** @constant {string} __filename - Current module file path. */
const __filename = fileURLToPath(import.meta.url);

/** @constant {string} __dirname - Current module directory path. */
const __dirname = path.dirname(__filename);

/** @constant {express.Express} app - Express app to run server. */
const app = express();

/** @constant {number} PORT - Port number the server listens on. */
const PORT = 3001;

//============================================================

/** Tell app to parse incoming JSON requests. */
app.use(express.json());

/** Tell app to show our static files. */
app.use(express.static(__dirname));

/**
 * Prevent favicon 404 errors.
 * @name GET /favicon.ico
 * @param {express.Request} req - Incoming request object.
 * @param {express.Response} res - Outgoing response object.
 */
app.get("/favicon.ico", (req, res) => res.status(204).end());

/**
 * Prevent aggressive caching (useful during development).
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next - Callback to pass control to next middleware.
 */
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

//============================================================

/**
 * GET /config
 * Returns our API info from the .env file. Preventing leaked keys.
 * @name GET /config
 * @param {express.Request} req - Incoming request object.
 * @param {express.Response} res - Outgoing response object.
 */
app.get("/config", (req, res) => {
  if (!process.env.API_TOKEN || !process.env.BASE_URL) {
    return res.status(500).json({
      error: "Server configuration missing environment variables."
    });
  }

  res.json({
    apiToken: process.env.API_TOKEN,
    baseUrl: process.env.BASE_URL
  });
});

//============================================================

/** Run the server. */
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
