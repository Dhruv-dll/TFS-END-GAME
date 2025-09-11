import { useEffect, useMemo, useState } from "react";

export interface SponsorItem {
  id: string;
  name: string;
  logo: string;
  industry: string;
  description: string;
  website?: string;
  isActive: boolean; // true = current, false = past
}

interface SponsorsConfig {
  sponsors: SponsorItem[];
  lastModified: number;
}

const defaultSponsors: SponsorsConfig = {
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

export function useSponsorsData() {
  const [config, setConfig] = useState<SponsorsConfig>(defaultSponsors);
  const [loading, setLoading] = useState(true);

  // Prefer server as single source of truth; remove localStorage usage

  const fetchWithTimeout = async (
    input: RequestInfo,
    init?: RequestInit,
    timeout = 8000,
  ) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(input, {
        ...(init || {}),
        signal: controller.signal,
      });
      clearTimeout(id);
      return res;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  const loadFromServer = async () => {
    try {
      const res = await fetchWithTimeout("/api/sponsors");
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setConfig(result.data);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  const checkSync = async () => {
    try {
      const localLast = config.lastModified || 0;
      const res = await fetchWithTimeout(
        `/api/sponsors/sync?lastModified=${localLast}`,
        undefined,
        5000,
      );
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.needsUpdate) {
          await loadFromServer();
        }
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    const init = async () => {
      const fromServer = await loadFromServer();
      if (!fromServer) setConfig(defaultSponsors);
      setLoading(false);
    };
    init();

    const id = setInterval(checkSync, 30000);
    return () => clearInterval(id);
  }, []);

  // Save and sync
  const saveConfig = async (next: SponsorsConfig) => {
    next.lastModified = Date.now();
    setConfig(next);
    try {
      await fetchWithTimeout(
        "/api/sponsors",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ data: next }),
        },
        10000,
      );
    } catch {
      // ignore sync errors
    }
    window.dispatchEvent(new CustomEvent("tfs-sponsors-updated"));
  };

  useEffect(() => {
    const onCustom = () => loadFromServer();
    window.addEventListener("tfs-sponsors-updated", onCustom as EventListener);
    return () =>
      window.removeEventListener(
        "tfs-sponsors-updated",
        onCustom as EventListener,
      );
  }, []);

  const sponsors = useMemo(() => config.sponsors, [config.sponsors]);

  const addSponsor = async (s: SponsorItem) => {
    const next = { ...config, sponsors: [...config.sponsors, s] };
    await saveConfig(next);
  };

  const updateSponsor = async (id: string, patch: Partial<SponsorItem>) => {
    const next = {
      ...config,
      sponsors: config.sponsors.map((sp) =>
        sp.id === id ? { ...sp, ...patch } : sp,
      ),
    };
    await saveConfig(next);
  };

  const removeSponsor = async (id: string) => {
    const next = {
      ...config,
      sponsors: config.sponsors.filter((sp) => sp.id !== id),
    };
    await saveConfig(next);
  };

  return {
    loading,
    sponsors,
    addSponsor,
    updateSponsor,
    removeSponsor,
    rawConfig: config,
  };
}
