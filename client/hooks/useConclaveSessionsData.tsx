import { useState, useEffect, useRef } from "react";

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
  const lastSaveTimeRef = useRef<number>(0);

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

  // Check if local data needs sync with server (but not immediately after save)
  const checkServerSync = async () => {
    // Skip sync check for 5 seconds after a save to prevent reverting user changes
    if (Date.now() - lastSaveTimeRef.current < 5000) {
      return;
    }

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

      // Sync with server BEFORE updating local state
      try {
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ data: newConfig }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to save sessions to server",
          );
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Server returned failure response");
        }

        // Only update local state after successful server save
        setSessionsConfig(newConfig);
        lastSaveTimeRef.current = Date.now();
        console.log("✅ Sessions data saved successfully to server");
      } catch (syncError) {
        console.error(
          "❌ Failed to save sessions to server:",
          syncError?.message || "Unknown error",
        );
        throw syncError;
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("tfs-sessions-updated"));
    } catch (error) {
      console.error("Error saving sessions config:", error);
      // Don't update local state if save failed
      throw error;
    }
  };

  const addSession = async (
    session: Omit<ConclaveSession, "id" | "createdAt">,
  ) => {
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

  const addSpeaker = async (
    sessionId: string,
    speaker: Omit<Speaker, "id">,
  ) => {
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
