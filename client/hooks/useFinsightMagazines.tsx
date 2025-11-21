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

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tfs-finsight-magazines");
      if (stored) {
        const parsed = JSON.parse(stored);
        setConfig(parsed);
      } else {
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.warn("Failed to load Finsight magazines:", error);
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save to localStorage whenever config changes
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(
          "tfs-finsight-magazines",
          JSON.stringify({
            ...config,
            lastModified: Date.now(),
          }),
        );
      } catch (error) {
        console.warn("Failed to save Finsight magazines:", error);
      }
    }
  }, [config, loading]);

  const addMagazine = (magazine: Omit<Magazine, "id">) => {
    const newMagazine: Magazine = {
      ...magazine,
      id: `magazine-${Date.now()}`,
    };
    setConfig((prev) => ({
      ...prev,
      magazines: [...prev.magazines, newMagazine],
    }));
    return newMagazine;
  };

  const updateMagazine = (magazineId: string, updates: Partial<Magazine>) => {
    setConfig((prev) => ({
      ...prev,
      magazines: prev.magazines.map((m) =>
        m.id === magazineId ? { ...m, ...updates } : m
      ),
    }));
  };

  const removeMagazine = (magazineId: string) => {
    setConfig((prev) => ({
      ...prev,
      magazines: prev.magazines.filter((m) => m.id !== magazineId),
    }));
  };

  return {
    magazines: config.magazines,
    loading,
    addMagazine,
    updateMagazine,
    removeMagazine,
  };
}
