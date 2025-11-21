import { RequestHandler } from "express";

export interface Speaker {
  id: string;
  name: string;
  linkedinId: string;
  photo: string;
  bio?: string;
  startTime?: string;
  endTime?: string;
}

export interface ConclaveSession {
  id: string;
  name: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  speakers: Speaker[];
  createdAt: number;
}

interface SessionsConfig {
  sessions: ConclaveSession[];
  lastModified: number;
}

const defaultConfig: SessionsConfig = {
  sessions: [],
  lastModified: Date.now(),
};

async function loadSessionsData(): Promise<SessionsConfig> {
  try {
    console.log("🔍 Loading conclave sessions data from GitHub...");

    const response = await fetch(
      "https://raw.githubusercontent.com/Dhruv-dll/TFS_Final_3/main/data/sessions.json",
      { cache: "no-store" },
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Successfully loaded conclave sessions data from GitHub");
      return data;
    } else {
      console.log(
        "📝 No existing conclave sessions data found, creating with defaults",
      );
      await saveSessionsData(defaultConfig);
      return defaultConfig;
    }
  } catch (error) {
    console.log(
      "⚠️ Error loading conclave sessions data, using defaults:",
      error.message,
    );
    await saveSessionsData(defaultConfig);
    return defaultConfig;
  }
}

async function saveSessionsData(config: SessionsConfig): Promise<void> {
  try {
    config.lastModified = Date.now();
    const content = JSON.stringify(config, null, 2);

    console.log("💾 Saving conclave sessions data to GitHub...");

    const fileResponse = await fetch(
      "https://api.github.com/repos/Dhruv-dll/TFS_Final_3/contents/data/sessions.json",
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
      "https://api.github.com/repos/Dhruv-dll/TFS_Final_3/contents/data/sessions.json",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          message: `Update conclave sessions data - ${new Date().toLocaleString()}`,
          content: Buffer.from(content).toString("base64"),
          sha: sha,
          branch: "main",
        }),
      },
    );

    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log(
        "✅ Successfully committed sessions.json to GitHub:",
        result.content.html_url,
      );
    } else {
      const errorText = await updateResponse.text();
      console.error("❌ GitHub API error for sessions.json:", errorText);
      throw new Error("Failed to update GitHub file");
    }
  } catch (error) {
    console.error("❌ Failed to save conclave sessions data:", error);
    throw error;
  }
}

export const getSessionsData: RequestHandler = async (_req, res) => {
  try {
    const config = await loadSessionsData();
    res.json({
      success: true,
      data: config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to load conclave sessions data",
      message: (error as Error).message,
    });
  }
};

export const updateSessionsData: RequestHandler = async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || !Array.isArray(data.sessions)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid sessions configuration" });
    }

    await saveSessionsData(data);
    res.json({
      success: true,
      message: "Sessions configuration updated successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to update conclave sessions data",
      message: (error as Error).message,
    });
  }
};

export const checkSessionsSync: RequestHandler = async (req, res) => {
  try {
    const { lastModified } = req.query;
    const serverConfig = await loadSessionsData();
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
      error: "Failed to check sessions sync",
      message: (error as Error).message,
    });
  }
};
