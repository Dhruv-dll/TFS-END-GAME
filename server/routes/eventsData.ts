import { RequestHandler } from "express";
import { promises as fs } from "fs";
import path from "path";

// Define the events data structure
interface EventItem {
  title: string;
  description?: string;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  registrationLink: string;
  countdown: {
    days: number;
    hours: number;
    minutes: number;
  };
}

interface EventsConfig {
  pastEvents: {
    [key: string]: {
      events?: EventItem[];
      comingSoon?: boolean;
    };
  };
  upcomingEvents: UpcomingEvent[];
  lastModified: number;
}

// Default events configuration
const defaultConfig: EventsConfig = {
  pastEvents: {
    "saturday-sessions": {
      events: [
        {
          title: "Saturday Seminar 1: Data Meets Finance",
          description:
            "Exploring the intersection of data analytics and financial decision-making",
        },
        {
          title:
            "Saturday Seminar 2: Banking 101: Demystifying India's Backbone",
          description:
            "Understanding the fundamentals of India's banking system",
        },
      ],
    },
    "networking-events": {
      comingSoon: true,
    },
    "flagship-event": {
      comingSoon: true,
    },
  },
  upcomingEvents: [],
  lastModified: Date.now(),
};

// Path to store events data
const EVENTS_DATA_PATH = path.join(process.cwd(), "data", "events.json");

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(EVENTS_DATA_PATH);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load events data from file
async function loadEventsData(): Promise<EventsConfig> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(EVENTS_DATA_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log("No existing events data found, using default configuration");
    await saveEventsData(defaultConfig);
    return defaultConfig;
  }
}

// Save events data to file
async function saveEventsData(config: EventsConfig): Promise<void> {
  try {
    await ensureDataDirectory();
    config.lastModified = Date.now();
    const content = JSON.stringify(config, null, 2);
    await fs.writeFile(EVENTS_DATA_PATH, content);
    console.log("Events data saved successfully");

    // Try to commit to GitHub for global persistence (optional)
    try {
      const { commitFileToGitHub } = await import("../utils/git");
      const result = (await commitFileToGitHub(
        "data/events.json",
        content,
        "chore: update events.json via admin",
      )) as any;
      if (!result.success) {
        console.warn("GitHub commit for events.json failed:", result.error);
      } else {
        console.log("Committed events.json to GitHub:", result.url);
      }
    } catch (gitErr) {
      console.warn(
        "Failed to commit events.json to GitHub:",
        (gitErr as Error).message || gitErr,
      );
    }
  } catch (error) {
    console.error("Failed to save events data:", error);
    throw error;
  }
}

// GET /api/events - Retrieve events configuration
export const getEventsData: RequestHandler = async (req, res) => {
  try {
    const config = await loadEventsData();
    res.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error loading events data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load events data",
      message: error.message,
    });
  }
};

// POST /api/events - Update events configuration
export const updateEventsData: RequestHandler = async (req, res) => {
  try {
    const { data: newConfig } = req.body;

    if (!newConfig || typeof newConfig !== "object") {
      return res.status(400).json({
        success: false,
        error: "Invalid events configuration data",
      });
    }

    // Validate required structure
    if (!newConfig.pastEvents || !Array.isArray(newConfig.upcomingEvents)) {
      return res.status(400).json({
        success: false,
        error: "Invalid events configuration structure",
      });
    }

    await saveEventsData(newConfig);

    res.json({
      success: true,
      message: "Events configuration updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating events data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update events data",
      message: error.message,
    });
  }
};

// GET /api/events/sync - Check if local data is outdated
export const checkEventsSync: RequestHandler = async (req, res) => {
  try {
    const { lastModified } = req.query;
    const serverConfig = await loadEventsData();

    const clientLastModified = lastModified
      ? parseInt(lastModified as string)
      : 0;
    const needsUpdate = serverConfig.lastModified > clientLastModified;

    res.json({
      success: true,
      needsUpdate,
      serverLastModified: serverConfig.lastModified,
      clientLastModified,
    });
  } catch (error) {
    console.error("Error checking events sync:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check events sync",
      message: error.message,
    });
  }
};
