import { RequestHandler } from "express";

export interface Magazine {
  id: string;
  title: string;
  edition: string;
  description: string;
  cover: string;
  articles: number;
  downloads: number;
  readTime: string;
  categories: string[];
  highlights: string[];
  link: string;
}

interface MagazinesConfig {
  magazines: Magazine[];
  lastModified: number;
}

const defaultConfig: MagazinesConfig = {
  magazines: [],
  lastModified: Date.now(),
};

async function loadMagazinesData(): Promise<MagazinesConfig> {
  try {
    console.log("🔍 Loading Finsight magazines data from GitHub...");

    const response = await fetch(
      "https://raw.githubusercontent.com/Dhruv-dll/TFS_Final_3/main/data/magazines.json",
      { cache: "no-store" },
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Successfully loaded Finsight magazines data from GitHub");
      return data;
    } else {
      console.log(
        "📝 No existing Finsight magazines data found, creating with defaults",
      );
      await saveMagazinesData(defaultConfig);
      return defaultConfig;
    }
  } catch (error) {
    console.log(
      "⚠️ Error loading Finsight magazines data, using defaults:",
      error.message,
    );
    await saveMagazinesData(defaultConfig);
    return defaultConfig;
  }
}

async function saveMagazinesData(config: MagazinesConfig): Promise<void> {
  try {
    config.lastModified = Date.now();
    const content = JSON.stringify(config, null, 2);

    console.log("💾 Saving Finsight magazines data to GitHub...");

    const fileResponse = await fetch(
      "https://api.github.com/repos/Dhruv-dll/TFS_Final_3/contents/data/magazines.json",
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    let sha = undefined;
    if (fileResponse.ok) {
      const fileInfo = await fileResponse.json();
      sha = fileInfo.sha;
    }

    const updateResponse = await fetch(
      "https://api.github.com/repos/Dhruv-dll/TFS_Final_3/contents/data/magazines.json",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: `Update Finsight magazines data - ${new Date().toLocaleString()}`,
          content: Buffer.from(content).toString("base64"),
          sha: sha,
          branch: "main",
        }),
      },
    );

    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log(
        "✅ Successfully committed magazines.json to GitHub:",
        result.content.html_url,
      );
    } else {
      const errorText = await updateResponse.text();
      console.error("❌ GitHub API error for magazines.json:", errorText);
      throw new Error("Failed to update GitHub file");
    }
  } catch (error) {
    console.error("❌ Failed to save Finsight magazines data:", error);
    throw error;
  }
}

export const getMagazinesData: RequestHandler = async (_req, res) => {
  try {
    const config = await loadMagazinesData();
    res.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to load Finsight magazines data",
      message: (error as Error).message,
    });
  }
};

export const updateMagazinesData: RequestHandler = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data.magazines)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid magazines configuration" });
    }

    await saveMagazinesData(data);
    res.json({
      success: true,
      message: "Magazines configuration updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to update Finsight magazines data",
      message: (error as Error).message,
    });
  }
};

export const checkMagazinesSync: RequestHandler = async (req, res) => {
  try {
    const { lastModified } = req.query;
    const serverConfig = await loadMagazinesData();
    const clientLast = lastModified ? parseInt(lastModified as string) : 0;
    const needsUpdate = serverConfig.lastModified > clientLast;

    res.json({
      success: true,
      needsUpdate,
      serverLastModified: serverConfig.lastModified,
      clientLastModified: clientLast,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to check magazines sync",
      message: (error as Error).message,
    });
  }
};
