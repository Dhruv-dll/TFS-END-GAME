import { useState, useEffect, useMemo } from "react";

interface EventItem {
  title: string;
  description?: string;
}

interface EventDetails {
  id: string;
  title: string;
  events?: EventItem[];
  comingSoon?: boolean;
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
  lastModified?: number;
}

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

export function useEventsData() {
  const [eventsConfig, setEventsConfig] = useState<EventsConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  // Set up global error handler for events fetch failures
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.message?.includes("Failed to fetch") ||
        event.reason?.message?.includes("events") ||
        event.reason?.message?.includes("sync")
      ) {
        console.warn(
          "🔄 Events data fetch error handled gracefully:",
          event.reason?.message || "Unknown error",
        );
        event.preventDefault(); // Prevent error from bubbling up
      }
    };

    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes("events") ||
        event.message?.includes("sync")
      ) {
        console.warn("🔄 Events script error handled gracefully");
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
      window.removeEventListener("error", handleError);
    };
  }, []);

  // Previously used localStorage; now prefer server as single source of truth

  // Load events data with server sync
  const loadEventsFromServer = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const response = await fetch("/api/events", {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setEventsConfig(result.data);
          return true;
        }
      }
      throw new Error("Server request failed");
    } catch (error) {
      console.warn(
        "Failed to load events from server, using default data:",
        error?.message || "Unknown error",
      );
      return false;
    }
  };

  // Check if local data needs sync with server
  const checkServerSync = async () => {
    try {
      const localLastModified = eventsConfig.lastModified || 0;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(
        `/api/events/sync?lastModified=${localLastModified}`,
        { signal: controller.signal, headers: { Accept: "application/json" } },
      );
      clearTimeout(timeoutId);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.needsUpdate) {
          console.log("Server has newer events data, syncing...");
          await loadEventsFromServer();
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
    const initializeEvents = async () => {
      const loadedFromServer = await loadEventsFromServer();
      if (!loadedFromServer) {
        setEventsConfig(defaultConfig);
      }
      setLoading(false);
    };

    initializeEvents();

    // Set up periodic sync check every 30 seconds
    const syncInterval = setInterval(checkServerSync, 30000);

    return () => clearInterval(syncInterval);
  }, []);

  // Keep same-tab notifications for immediate UI updates
  useEffect(() => {
    const handleCustomStorageChange = () => {
      // reload from server to reflect changes
      loadEventsFromServer();
    };

    window.addEventListener("tfs-events-updated", handleCustomStorageChange);
    return () =>
      window.removeEventListener(
        "tfs-events-updated",
        handleCustomStorageChange,
      );
  }, []);

  // Helper function to get title from ID
  const getTitleFromId = (id: string): string => {
    const titleMap: { [key: string]: string } = {
      "saturday-sessions": "Saturday Sessions",
      "networking-events": "Networking Events",
      "flagship-event": "Flagship Conclave",
    };
    return titleMap[id] || id;
  };

  // Convert config to EventDetails format - memoized to prevent infinite re-renders
  const eventDetails = useMemo((): EventDetails[] => {
    return Object.entries(eventsConfig.pastEvents).map(([id, config]) => ({
      id,
      title: getTitleFromId(id),
      events: config.events,
      comingSoon: config.comingSoon,
    }));
  }, [eventsConfig.pastEvents]);

  // Sort upcoming events chronologically (earliest first) - memoized for performance
  const sortedUpcomingEvents = useMemo((): UpcomingEvent[] => {
    return [...eventsConfig.upcomingEvents].sort((a, b) => {
      // Parse dates for comparison
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      // If same date, sort by time
      if (dateA.getTime() === dateB.getTime()) {
        // Parse time strings (assuming format like "10:00 AM" or "14:30")
        const timeA = parseTimeString(a.time);
        const timeB = parseTimeString(b.time);
        return timeA - timeB;
      }

      // Otherwise sort by date (earliest first)
      return dateA.getTime() - dateB.getTime();
    });
  }, [eventsConfig.upcomingEvents]);

  // Helper function to parse time strings into comparable numbers
  const parseTimeString = (timeStr: string): number => {
    try {
      // Handle various time formats
      const cleanTime = timeStr.toLowerCase().trim();

      // Check for AM/PM format
      if (cleanTime.includes("am") || cleanTime.includes("pm")) {
        const [time, period] = cleanTime.split(/\s+/);
        const [hours, minutes = "0"] = time.split(":").map(Number);

        let hour24 = hours;
        if (period.includes("pm") && hours !== 12) {
          hour24 += 12;
        } else if (period.includes("am") && hours === 12) {
          hour24 = 0;
        }

        return hour24 * 60 + minutes;
      }

      // Handle 24-hour format
      const [hours, minutes = "0"] = cleanTime.split(":").map(Number);
      return hours * 60 + minutes;
    } catch (error) {
      console.warn(`Failed to parse time string: ${timeStr}`);
      return 0;
    }
  };

  // Helper function to save config and sync with server
  const saveConfig = async (newConfig: EventsConfig) => {
    try {
      // Add timestamp
      newConfig.lastModified = Date.now();

      // Update local state immediately
      setEventsConfig(newConfig);

      // Sync with server with proper error handling
      try {
        const fetchWithTimeout = new Promise<Response>((resolve, reject) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            controller.abort();
            reject(new Error("Save request timeout"));
          }, 10000);

          fetch("/api/events", {
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
          console.log("Events data synced with server successfully");
        } else {
          console.warn(
            "Failed to sync events data with server - response not ok",
          );
        }
      } catch (syncError) {
        console.warn(
          "Failed to sync events data with server:",
          syncError?.message || "Unknown sync error",
        );
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("tfs-events-updated"));
    } catch (error) {
      console.error("Error saving events config:", error);
      // Still update local state even if server sync fails
      setEventsConfig(newConfig);
      localStorage.setItem("tfs-events-config", JSON.stringify(newConfig));
      window.dispatchEvent(new CustomEvent("tfs-events-updated"));
    }
  };

  // Admin functions to update events
  const addSaturdaySession = async (event: EventItem) => {
    const newConfig = { ...eventsConfig };
    if (!newConfig.pastEvents["saturday-sessions"].events) {
      newConfig.pastEvents["saturday-sessions"].events = [];
    }
    newConfig.pastEvents["saturday-sessions"].events!.push(event);
    newConfig.pastEvents["saturday-sessions"].comingSoon = false;

    await saveConfig(newConfig);
  };

  const addNetworkingEvent = async (event: EventItem) => {
    const newConfig = { ...eventsConfig };
    if (!newConfig.pastEvents["networking-events"].events) {
      newConfig.pastEvents["networking-events"].events = [];
    }
    newConfig.pastEvents["networking-events"].events!.push(event);
    newConfig.pastEvents["networking-events"].comingSoon = false;

    await saveConfig(newConfig);
  };

  const addFlagshipEvent = async (event: EventItem) => {
    const newConfig = { ...eventsConfig };
    if (!newConfig.pastEvents["flagship-event"].events) {
      newConfig.pastEvents["flagship-event"].events = [];
    }
    newConfig.pastEvents["flagship-event"].events!.push(event);
    newConfig.pastEvents["flagship-event"].comingSoon = false;

    await saveConfig(newConfig);
  };

  const addUpcomingEvent = async (event: UpcomingEvent) => {
    const newConfig = { ...eventsConfig };
    newConfig.upcomingEvents.push(event);
    // No need to sort here - the memoized getter will handle sorting

    await saveConfig(newConfig);
  };

  const removeUpcomingEvent = async (eventId: string) => {
    const newConfig = { ...eventsConfig };
    newConfig.upcomingEvents = newConfig.upcomingEvents.filter(
      (e) => e.id !== eventId,
    );

    await saveConfig(newConfig);
  };

  // Remove functions for past events
  const removeSaturdaySession = async (eventIndex: number) => {
    const newConfig = { ...eventsConfig };
    if (newConfig.pastEvents["saturday-sessions"].events) {
      newConfig.pastEvents["saturday-sessions"].events.splice(eventIndex, 1);
      if (newConfig.pastEvents["saturday-sessions"].events.length === 0) {
        newConfig.pastEvents["saturday-sessions"].comingSoon = true;
        delete newConfig.pastEvents["saturday-sessions"].events;
      }
    }
    await saveConfig(newConfig);
  };

  const removeNetworkingEvent = async (eventIndex: number) => {
    const newConfig = { ...eventsConfig };
    if (newConfig.pastEvents["networking-events"].events) {
      newConfig.pastEvents["networking-events"].events.splice(eventIndex, 1);
      if (newConfig.pastEvents["networking-events"].events.length === 0) {
        newConfig.pastEvents["networking-events"].comingSoon = true;
        delete newConfig.pastEvents["networking-events"].events;
      }
    }
    await saveConfig(newConfig);
  };

  const removeFlagshipEvent = async (eventIndex: number) => {
    const newConfig = { ...eventsConfig };
    if (newConfig.pastEvents["flagship-event"].events) {
      newConfig.pastEvents["flagship-event"].events.splice(eventIndex, 1);
      if (newConfig.pastEvents["flagship-event"].events.length === 0) {
        newConfig.pastEvents["flagship-event"].comingSoon = true;
        delete newConfig.pastEvents["flagship-event"].events;
      }
    }
    await saveConfig(newConfig);
  };

  const updateEventConfig = async (newConfig: EventsConfig) => {
    await saveConfig(newConfig);
  };

  return {
    loading,
    eventDetails,
    upcomingEvents: sortedUpcomingEvents, // Return sorted events
    addSaturdaySession,
    addNetworkingEvent,
    addFlagshipEvent,
    addUpcomingEvent,
    removeUpcomingEvent,
    removeSaturdaySession,
    removeNetworkingEvent,
    removeFlagshipEvent,
    updateEventConfig,
    rawConfig: eventsConfig,
  };
}
