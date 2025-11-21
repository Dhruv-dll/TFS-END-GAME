import { useState, useEffect } from "react";

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
  lastModified?: number;
}

const defaultConfig: SessionsConfig = {
  sessions: [],
  lastModified: Date.now(),
};

export function useConclaveSessionsData() {
  const [sessionsConfig, setSessionsConfig] =
    useState<SessionsConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  // Load sessions data with server sync
  const loadSessionsFromServer = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch("/api/sessions", {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSessionsConfig(result.data);
          return true;
        }
      }
      throw new Error("Server request failed");
    } catch (error) {
      console.warn(
        "Failed to load sessions from server, using default data:",
        error?.message || "Unknown error",
      );
      return false;
    }
  };

  // Check if local data needs sync with server
  const checkServerSync = async () => {
    try {
      const localLastModified = sessionsConfig.lastModified || 0;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(
        `/api/sessions/sync?lastModified=${localLastModified}`,
        { signal: controller.signal, headers: { Accept: "application/json" } },
      );
      clearTimeout(timeoutId);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.needsUpdate) {
          console.log("Server has newer sessions data, syncing...");
          await loadSessionsFromServer();
        }
      }
    } catch (error) {
      if (
        error?.message &&
        !error.message.includes("fetch") &&
        !error.message.includes("timeout")
      ) {
        console.warn(
          "Failed to check server sync:",
          error?.message || "Unknown error",
        );
      }
    }
  };

  useEffect(() => {
    const initializeSessions = async () => {
      const loadedFromServer = await loadSessionsFromServer();
      if (!loadedFromServer) {
        setSessionsConfig(defaultConfig);
      }
      setLoading(false);
    };

    initializeSessions();

    // Set up periodic sync check every 30 seconds
    const syncInterval = setInterval(checkServerSync, 30000);

    return () => clearInterval(syncInterval);
  }, []);

  // Keep same-tab notifications for immediate UI updates
  useEffect(() => {
    const handleCustomStorageChange = () => {
      loadSessionsFromServer();
    };

    window.addEventListener("tfs-sessions-updated", handleCustomStorageChange);
    return () =>
      window.removeEventListener(
        "tfs-sessions-updated",
        handleCustomStorageChange,
      );
  }, []);

  // Helper function to save config and sync with server
  const saveConfig = async (newConfig: SessionsConfig) => {
    try {
      newConfig.lastModified = Date.now();

      // Update local state immediately
      setSessionsConfig(newConfig);

      // Sync with server with proper error handling
      try {
        const fetchWithTimeout = new Promise<Response>((resolve, reject) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
            reject(new Error("Save request timeout"));
          }, 10000);

          fetch("/api/sessions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ data: newConfig }),
            signal: controller.signal,
          })
            .then((response) => {
              clearTimeout(timeoutId);
              resolve(response);
            })
            .catch((error) => {
              clearTimeout(timeoutId);
              reject(error);
            });
        });

        const response = await fetchWithTimeout;
        if (response.ok) {
          console.log("Sessions data synced with server successfully");
        } else {
          console.warn(
            "Failed to sync sessions data with server - response not ok",
          );
        }
      } catch (syncError) {
        console.warn(
          "Failed to sync sessions data with server:",
          syncError?.message || "Unknown sync error",
        );
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("tfs-sessions-updated"));
    } catch (error) {
      console.error("Error saving sessions config:", error);
      setSessionsConfig(newConfig);
      window.dispatchEvent(new CustomEvent("tfs-sessions-updated"));
    }
  };

  const addSession = async (session: Omit<ConclaveSession, "id" | "createdAt">) => {
    const newSession: ConclaveSession = {
      ...session,
      id: `session-${Date.now()}`,
      createdAt: Date.now(),
    };
    const newConfig = {
      ...sessionsConfig,
      sessions: [...sessionsConfig.sessions, newSession],
    };
    await saveConfig(newConfig);
    return newSession;
  };

  const updateSession = async (
    sessionId: string,
    updates: Partial<ConclaveSession>,
  ) => {
    const newConfig = {
      ...sessionsConfig,
      sessions: sessionsConfig.sessions.map((s) =>
        s.id === sessionId ? { ...s, ...updates } : s,
      ),
    };
    await saveConfig(newConfig);
  };

  const removeSession = async (sessionId: string) => {
    const newConfig = {
      ...sessionsConfig,
      sessions: sessionsConfig.sessions.filter((s) => s.id !== sessionId),
    };
    await saveConfig(newConfig);
  };

  const addSpeaker = async (sessionId: string, speaker: Omit<Speaker, "id">) => {
    const newSpeaker: Speaker = {
      ...speaker,
      id: `speaker-${Date.now()}`,
    };

    const newConfig = {
      ...sessionsConfig,
      sessions: sessionsConfig.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, speakers: [...s.speakers, newSpeaker] }
          : s,
      ),
    };
    await saveConfig(newConfig);

    return newSpeaker;
  };

  const updateSpeaker = async (
    sessionId: string,
    speakerId: string,
    updates: Partial<Speaker>,
  ) => {
    const newConfig = {
      ...sessionsConfig,
      sessions: sessionsConfig.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              speakers: s.speakers.map((sp) =>
                sp.id === speakerId ? { ...sp, ...updates } : sp,
              ),
            }
          : s,
      ),
    };
    await saveConfig(newConfig);
  };

  const removeSpeaker = async (sessionId: string, speakerId: string) => {
    const newConfig = {
      ...sessionsConfig,
      sessions: sessionsConfig.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              speakers: s.speakers.filter((sp) => sp.id !== speakerId),
            }
          : s,
      ),
    };
    await saveConfig(newConfig);
  };

  return {
    sessions: sessionsConfig.sessions,
    loading,
    addSession,
    updateSession,
    removeSession,
    addSpeaker,
    updateSpeaker,
    removeSpeaker,
  };
}
