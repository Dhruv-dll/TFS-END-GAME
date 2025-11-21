import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getMarketData } from "./routes/marketData";
import {
  getEventsData,
  updateEventsData,
  checkEventsSync,
} from "./routes/eventsData";
import {
  getSponsorsData,
  updateSponsorsData,
  checkSponsorsSync,
} from "./routes/sponsorsData";
import {
  getLuminariesData,
  updateLuminariesData,
  checkLuminariesSync,
} from "./routes/luminariesData";
import {
  getSessionsData,
  updateSessionsData,
  checkSessionsSync,
} from "./routes/conclaveSessionsData";
import {
  getMagazinesData,
  updateMagazinesData,
  checkMagazinesSync,
} from "./routes/finsightMagazinesData";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.get("/api/market-data", getMarketData);

  // Events API endpoints
  app.get("/api/events", getEventsData);
  app.post("/api/events", updateEventsData);
  app.get("/api/events/sync", checkEventsSync);

  // Sponsors API endpoints
  app.get("/api/sponsors", getSponsorsData);
  app.post("/api/sponsors", updateSponsorsData);
  app.get("/api/sponsors/sync", checkSponsorsSync);

  // Luminaries API endpoints
  app.get("/api/luminaries", getLuminariesData);
  app.post("/api/luminaries", updateLuminariesData);
  app.get("/api/luminaries/sync", checkLuminariesSync);

  // Conclave Sessions API endpoints
  app.get("/api/sessions", getSessionsData);
  app.post("/api/sessions", updateSessionsData);
  app.get("/api/sessions/sync", checkSessionsSync);

  // Finsight Magazines API endpoints
  app.get("/api/magazines", getMagazinesData);
  app.post("/api/magazines", updateMagazinesData);
  app.get("/api/magazines/sync", checkMagazinesSync);

  return app;
}
