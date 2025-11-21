import { useState, useEffect } from "react";

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
  lastModified?: number;
}

const defaultConfig: MagazinesConfig = {
  magazines: [],
  lastModified: Date.now(),
};

export function useFinsightMagazines() {
  const [config, setConfig] = useState<MagazinesConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  // Load magazines data with server sync
  const loadMagazinesFromServer = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch("/api/magazines", {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setConfig(result.data);
          return true;
        }
      }
      throw new Error("Server request failed");
    } catch (error) {
      console.warn(
        "Failed to load magazines from server, using default data:",
        error?.message || "Unknown error",
      );
      return false;
    }
  };

  // Check if local data needs sync with server
  const checkServerSync = async () => {
    try {
      const localLastModified = config.lastModified || 0;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(
        `/api/magazines/sync?lastModified=${localLastModified}`,
        { signal: controller.signal, headers: { Accept: "application/json" } },
      );
      clearTimeout(timeoutId);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.needsUpdate) {
          console.log("Server has newer magazines data, syncing...");
          await loadMagazinesFromServer();
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
    const initializeMagazines = async () => {
      const loadedFromServer = await loadMagazinesFromServer();
      if (!loadedFromServer) {
        setConfig(defaultConfig);
      }
      setLoading(false);
    };

    initializeMagazines();

    // Set up periodic sync check every 30 seconds
    const syncInterval = setInterval(checkServerSync, 30000);

    return () => clearInterval(syncInterval);
  }, []);

  // Keep same-tab notifications for immediate UI updates
  useEffect(() => {
    const handleCustomStorageChange = () => {
      loadMagazinesFromServer();
    };

    window.addEventListener("tfs-magazines-updated", handleCustomStorageChange);
    return () =>
      window.removeEventListener(
        "tfs-magazines-updated",
        handleCustomStorageChange,
      );
  }, []);

  // Helper function to save config and sync with server
  const saveConfig = async (newConfig: MagazinesConfig) => {
    try {
      newConfig.lastModified = Date.now();

      // Update local state immediately
      setConfig(newConfig);

      // Sync with server with proper error handling
      try {
        const fetchWithTimeout = new Promise<Response>((resolve, reject) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
            reject(new Error("Save request timeout"));
          }, 10000);

          fetch("/api/magazines", {
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
          console.log("Magazines data synced with server successfully");
        } else {
          console.warn(
            "Failed to sync magazines data with server - response not ok",
          );
        }
      } catch (syncError) {
        console.warn(
          "Failed to sync magazines data with server:",
          syncError?.message || "Unknown sync error",
        );
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("tfs-magazines-updated"));
    } catch (error) {
      console.error("Error saving magazines config:", error);
      setConfig(newConfig);
      window.dispatchEvent(new CustomEvent("tfs-magazines-updated"));
    }
  };

  const addMagazine = async (magazine: Omit<Magazine, "id">) => {
    const newMagazine: Magazine = {
      ...magazine,
      id: `magazine-${Date.now()}`,
    };
    const newConfig = {
      ...config,
      magazines: [...config.magazines, newMagazine],
    };
    await saveConfig(newConfig);
    return newMagazine;
  };

  const updateMagazine = async (magazineId: string, updates: Partial<Magazine>) => {
    const newConfig = {
      ...config,
      magazines: config.magazines.map((m) =>
        m.id === magazineId ? { ...m, ...updates } : m
      ),
    };
    await saveConfig(newConfig);
  };

  const removeMagazine = async (magazineId: string) => {
    const newConfig = {
      ...config,
      magazines: config.magazines.filter((m) => m.id !== magazineId),
    };
    await saveConfig(newConfig);
  };

  return {
    magazines: config.magazines,
    loading,
    addMagazine,
    updateMagazine,
    removeMagazine,
  };
}
