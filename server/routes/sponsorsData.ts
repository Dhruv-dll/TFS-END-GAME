import { RequestHandler } from "express";
import { promises as fs } from "fs";
import path from "path";

interface SponsorItem {
  id: string;
  name: string;
  logo: string;
  industry: string;
  description: string;
  website?: string;
  isActive: boolean;
}

interface SponsorsConfig {
  sponsors: SponsorItem[];
  lastModified: number;
}

const defaultConfig: SponsorsConfig = {
  sponsors: [
    {
      id: "citizen-cooperative-bank",
      name: "Citizen Cooperative Bank",
      logo: "https://cdn.builder.io/api/v1/image/assets%2Fb448f3665916406e992f77bf5e7d711e%2Fec784fa823e24e5b9b1285f4ba0a99fb",
      industry: "Banking",
      description:
        "Cooperative banking institution dedicated to financial inclusion and community development.",
      isActive: false,
      website: "https://citizenbankdelhi.com",
    },
    {
      id: "saint-gobain",
      name: "Saint Gobain (through Mahantesh Associates)",
      logo: "https://cdn.builder.io/api/v1/image/assets%2Fb448f3665916406e992f77bf5e7d711e%2F5b52ce39d6834f09a442954d4ab0e362",
      industry: "Manufacturing",
      description:
        "Global leader in sustainable construction materials, partnering through Mahantesh Associates to enhance industry exposure.",
      isActive: false,
      website: "https://saint-gobain.com",
    },
    {
      id: "zest-global-education",
      name: "Zest Global Education",
      logo: "https://cdn.builder.io/api/v1/image/assets%2Fb448f3665916406e992f77bf5e7d711e%2F8d448a7548c345c0b5060392a99881c7",
      industry: "Education",
      description:
        "International education consultancy providing global opportunities and career guidance to students.",
      isActive: false,
      website: "https://zestglobaleducation.com",
    },
    {
      id: "iqas",
      name: "IQAS",
      logo: "https://cdn.builder.io/api/v1/image/assets%2Fb448f3665916406e992f77bf5e7d711e%2F6d57193e366e4d44b95dae677d4162dc",
      industry: "Quality Assurance",
      description:
        "Quality assurance and certification services provider supporting academic excellence standards.",
      isActive: false,
      website: "https://iqas.co.in",
    },
  ],
  lastModified: Date.now(),
};

const SPONSORS_DATA_PATH = path.join(process.cwd(), "data", "sponsors.json");

async function ensureDataDirectory() {
  const dir = path.dirname(SPONSORS_DATA_PATH);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function loadSponsorsData(): Promise<SponsorsConfig> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(SPONSORS_DATA_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    await saveSponsorsData(defaultConfig);
    return defaultConfig;
  }
}

async function saveSponsorsData(config: SponsorsConfig): Promise<void> {
  await ensureDataDirectory();
  config.lastModified = Date.now();
  const content = JSON.stringify(config, null, 2);
  await fs.writeFile(SPONSORS_DATA_PATH, content);

  // Try to commit to GitHub for global persistence (optional)
  try {
    const { commitFileToGitHub } = await import("../utils/git");
    const result = (await commitFileToGitHub(
      "data/sponsors.json",
      content,
      "chore: update sponsors.json via admin",
    )) as any;
    if (!result.success) {
      console.warn("GitHub commit for sponsors.json failed:", result.error);
    } else {
      console.log("Committed sponsors.json to GitHub:", result.url);
    }
  } catch (gitErr) {
    console.warn(
      "Failed to commit sponsors.json to GitHub:",
      (gitErr as Error).message || gitErr,
    );
  }
}

export const getSponsorsData: RequestHandler = async (_req, res) => {
  try {
    const config = await loadSponsorsData();
    res.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to load sponsors data",
        message: (error as Error).message,
      });
  }
};

export const updateSponsorsData: RequestHandler = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data.sponsors)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid sponsors configuration" });
    }
    await saveSponsorsData(data);
    res.json({
      success: true,
      message: "Sponsors configuration updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to update sponsors data",
        message: (error as Error).message,
      });
  }
};

export const checkSponsorsSync: RequestHandler = async (req, res) => {
  try {
    const { lastModified } = req.query;
    const serverConfig = await loadSponsorsData();
    const clientLast = lastModified ? parseInt(lastModified as string) : 0;
    const needsUpdate = serverConfig.lastModified > clientLast;
    res.json({
      success: true,
      needsUpdate,
      serverLastModified: serverConfig.lastModified,
      clientLastModified: clientLast,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to check sponsors sync",
        message: (error as Error).message,
      });
  }
};
