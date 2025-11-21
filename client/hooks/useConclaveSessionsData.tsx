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

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tfs-conclave-sessions");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSessionsConfig(parsed);
      } else {
        setSessionsConfig(defaultConfig);
      }
    } catch (error) {
      console.warn("Failed to load conclave sessions:", error);
      setSessionsConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save to localStorage whenever config changes
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(
          "tfs-conclave-sessions",
          JSON.stringify({
            ...sessionsConfig,
            lastModified: Date.now(),
          }),
        );
      } catch (error) {
        console.warn("Failed to save conclave sessions:", error);
      }
    }
  }, [sessionsConfig, loading]);

  const addSession = (session: Omit<ConclaveSession, "id" | "createdAt">) => {
    const newSession: ConclaveSession = {
      ...session,
      id: `session-${Date.now()}`,
      createdAt: Date.now(),
    };
    setSessionsConfig((prev) => ({
      ...prev,
      sessions: [...prev.sessions, newSession],
    }));
    return newSession;
  };

  const updateSession = (
    sessionId: string,
    updates: Partial<ConclaveSession>,
  ) => {
    setSessionsConfig((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId ? { ...s, ...updates } : s,
      ),
    }));
  };

  const removeSession = (sessionId: string) => {
    setSessionsConfig((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== sessionId),
    }));
  };

  const addSpeaker = (sessionId: string, speaker: Omit<Speaker, "id">) => {
    const newSpeaker: Speaker = {
      ...speaker,
      id: `speaker-${Date.now()}`,
    };

    setSessionsConfig((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, speakers: [...s.speakers, newSpeaker] }
          : s,
      ),
    }));

    return newSpeaker;
  };

  const updateSpeaker = (
    sessionId: string,
    speakerId: string,
    updates: Partial<Speaker>,
  ) => {
    setSessionsConfig((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              speakers: s.speakers.map((sp) =>
                sp.id === speakerId ? { ...sp, ...updates } : sp,
              ),
            }
          : s,
      ),
    }));
  };

  const removeSpeaker = (sessionId: string, speakerId: string) => {
    setSessionsConfig((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              speakers: s.speakers.filter((sp) => sp.id !== speakerId),
            }
          : s,
      ),
    }));
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
