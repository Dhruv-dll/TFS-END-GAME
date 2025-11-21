import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Save,
  Settings,
  Calendar,
  Users,
  Trophy,
  Mic,
  BookOpen,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEventsData } from "../hooks/useEventsData";
import { useSponsorsData, SponsorItem } from "../hooks/useSponsorsData";
import {
  useLuminariesData,
  TeamMember as LuminaryMember,
} from "../hooks/useLuminariesData";
import {
  useConclaveSessionsData,
  Speaker,
  ConclaveSession,
} from "../hooks/useConclaveSessionsData";
import { useFinsightMagazines, Magazine } from "../hooks/useFinsightMagazines";
import AdminLuminariesPanel from "./AdminLuminariesPanel";

interface AdminEventsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminEventsPanel({
  isOpen,
  onClose,
}: AdminEventsPanelProps) {
  const [activeSection, setActiveSection] = useState<
    "events" | "sponsors" | "luminaries" | "sessions" | "magazines"
  >("events");

  const {
    addSaturdaySession,
    addNetworkingEvent,
    addFlagshipEvent,
    addUpcomingEvent,
    removeUpcomingEvent,
    removeSaturdaySession,
    removeNetworkingEvent,
    removeFlagshipEvent,
    upcomingEvents,
    eventDetails,
  } = useEventsData();

  const { sponsors, addSponsor, updateSponsor, removeSponsor } =
    useSponsorsData();

  const { faculty, leadership, addMember, updateMember, removeMember } =
    useLuminariesData();

  const {
    sessions: conclaveSessions,
    addSession,
    updateSession,
    removeSession,
    addSpeaker,
    updateSpeaker,
    removeSpeaker,
  } = useConclaveSessionsData();

  const { magazines, addMagazine, updateMagazine, removeMagazine } =
    useFinsightMagazines();

  const [newLuminary, setNewLuminary] = useState<LuminaryMember>({
    id: "",
    name: "",
    title: "",
    bio: "",
    image: "",
    email: "",
    linkedin: "",
    achievements: [],
    expertise: [],
    quote: "",
  });
  const [luminaryGroup, setLuminaryGroup] = useState<"faculty" | "leadership">(
    "faculty",
  );

  // Conclave Sessions state
  const [newSession, setNewSession] = useState({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  const [newSpeaker, setNewSpeaker] = useState({
    name: "",
    linkedinId: "",
    photo: "",
    bio: "",
    startTime: "",
    endTime: "",
  });

  const [selectedSessionForSpeaker, setSelectedSessionForSpeaker] = useState<
    string | null
  >(null);

  // Magazine state
  const [newMagazine, setNewMagazine] = useState({
    title: "",
    edition: "",
    description: "",
    cover: "",
    articles: 0,
    downloads: 0,
    readTime: "",
    categories: "",
    highlights: "",
    link: "",
  });

  const [newSaturdaySession, setNewSaturdaySession] = useState({
    title: "",
    description: "",
  });
  const [newNetworkingEvent, setNewNetworkingEvent] = useState({
    title: "",
    description: "",
  });
  const [newFlagshipEvent, setNewFlagshipEvent] = useState({
    title: "",
    description: "",
  });
  const [newUpcomingEvent, setNewUpcomingEvent] = useState({
    id: "",
    title: "",
    date: "",
    dateInput: "", // ISO date string for the date picker
    time: "",
    location: "",
    description: "",
    registrationLink: "",
    countdown: { days: 0, hours: 0, minutes: 0 },
  });

  const [newSponsor, setNewSponsor] = useState<SponsorItem>({
    id: "",
    name: "",
    logo: "",
    industry: "",
    description: "",
    website: "",
    isActive: false,
  });

  // Function to calculate days between current date and event date
  const calculateDaysLeft = (eventDateISO: string): number => {
    if (!eventDateISO) return 0;

    const currentDate = new Date();
    const eventDate = new Date(eventDateISO);

    // Reset time to midnight for accurate day calculation
    currentDate.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    const timeDifference = eventDate.getTime() - currentDate.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

    return Math.max(0, daysDifference); // Don't return negative days
  };

  // Function to format date for display
  const formatDateForDisplay = (dateISO: string): string => {
    if (!dateISO) return "";

    const date = new Date(dateISO);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return date.toLocaleDateString("en-US", options);
  };

  // Handle date input change
  const handleDateChange = (dateISO: string) => {
    const formattedDate = formatDateForDisplay(dateISO);
    const daysLeft = calculateDaysLeft(dateISO);

    setNewUpcomingEvent((prev) => ({
      ...prev,
      dateInput: dateISO,
      date: formattedDate,
      countdown: {
        ...prev.countdown,
        days: daysLeft,
      },
    }));
  };

  const handleAddSaturdaySession = () => {
    if (newSaturdaySession.title.trim()) {
      addSaturdaySession(newSaturdaySession);
      setNewSaturdaySession({ title: "", description: "" });
      alert("Saturday Session added successfully!");
    }
  };

  const handleAddNetworkingEvent = () => {
    if (newNetworkingEvent.title.trim()) {
      addNetworkingEvent(newNetworkingEvent);
      setNewNetworkingEvent({ title: "", description: "" });
      alert("Networking Event added successfully!");
    }
  };

  const handleAddFlagshipEvent = () => {
    if (newFlagshipEvent.title.trim()) {
      addFlagshipEvent(newFlagshipEvent);
      setNewFlagshipEvent({ title: "", description: "" });
      alert("Flagship Event added successfully!");
    }
  };

  const handleAddUpcomingEvent = () => {
    if (newUpcomingEvent.title.trim() && newUpcomingEvent.dateInput.trim()) {
      // Create the event object without the dateInput field (internal use only)
      const { dateInput, ...eventData } = newUpcomingEvent;
      const eventWithId = {
        ...eventData,
        id: newUpcomingEvent.id || `event-${Date.now()}`,
      };

      addUpcomingEvent(eventWithId);

      // Reset the form
      setNewUpcomingEvent({
        id: "",
        title: "",
        date: "",
        dateInput: "",
        time: "",
        location: "",
        description: "",
        registrationLink: "",
        countdown: { days: 0, hours: 0, minutes: 0 },
      });

      alert(
        `Upcoming Event "${eventWithId.title}" added successfully! Check the timeline section.`,
      );
    } else {
      alert("Please fill in at least the event title and date before adding.");
    }
  };

  const handleAddSponsor = () => {
    if (newSponsor.name.trim()) {
      const sponsor: SponsorItem = {
        ...newSponsor,
        id: newSponsor.id || `sponsor-${Date.now()}`,
        website: newSponsor.website?.trim() || undefined,
      };
      addSponsor(sponsor);
      setNewSponsor({
        id: "",
        name: "",
        logo: "",
        industry: "",
        description: "",
        website: "",
        isActive: false,
      });
      alert("Sponsor added successfully!");
    }
  };

  const handleAddLuminary = () => {
    if (
      newLuminary.name.trim() &&
      newLuminary.title.trim() &&
      newLuminary.email.trim()
    ) {
      const payload: LuminaryMember = {
        ...newLuminary,
        id: newLuminary.id || `${luminaryGroup}-${Date.now()}`,
        achievements: Array.isArray(newLuminary.achievements)
          ? newLuminary.achievements
          : String(newLuminary.achievements || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
        expertise: Array.isArray(newLuminary.expertise)
          ? newLuminary.expertise
          : String(newLuminary.expertise || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
      } as LuminaryMember;
      addMember(luminaryGroup, payload);
      setNewLuminary({
        id: "",
        name: "",
        title: "",
        bio: "",
        image: "",
        email: "",
        linkedin: "",
        achievements: [],
        expertise: [],
        quote: "",
      });
      alert("Luminary added successfully!");
    }
  };

  const handleAddConclaveSession = () => {
    if (newSession.name.trim()) {
      addSession({
        name: newSession.name,
        description: newSession.description,
        startTime: newSession.startTime,
        endTime: newSession.endTime,
        speakers: [],
      });
      setNewSession({ name: "", description: "", startTime: "", endTime: "" });
      alert("Session added successfully!");
    } else {
      alert("Please enter a session name.");
    }
  };

  const handleAddSpeaker = () => {
    if (
      selectedSessionForSpeaker &&
      newSpeaker.name.trim() &&
      newSpeaker.linkedinId.trim()
    ) {
      addSpeaker(selectedSessionForSpeaker, {
        name: newSpeaker.name,
        linkedinId: newSpeaker.linkedinId,
        photo: newSpeaker.photo,
        bio: newSpeaker.bio,
        startTime: newSpeaker.startTime,
        endTime: newSpeaker.endTime,
      });
      setNewSpeaker({
        name: "",
        linkedinId: "",
        photo: "",
        bio: "",
        startTime: "",
        endTime: "",
      });
      alert("Speaker added successfully!");
    } else {
      alert(
        "Please select a session and fill in speaker name and LinkedIn ID.",
      );
    }
  };

  const handleAddMagazine = () => {
    if (
      newMagazine.title.trim() &&
      newMagazine.edition.trim() &&
      newMagazine.cover.trim() &&
      newMagazine.link.trim()
    ) {
      const categoriesArray = newMagazine.categories
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const highlightsArray = newMagazine.highlights
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);

      addMagazine({
        title: newMagazine.title,
        edition: newMagazine.edition,
        description: newMagazine.description,
        cover: newMagazine.cover,
        articles: newMagazine.articles,
        downloads: newMagazine.downloads,
        readTime: newMagazine.readTime,
        categories: categoriesArray,
        highlights: highlightsArray,
        link: newMagazine.link,
      });

      setNewMagazine({
        title: "",
        edition: "",
        description: "",
        cover: "",
        articles: 0,
        downloads: 0,
        readTime: "",
        categories: "",
        highlights: "",
        link: "",
      });

      alert("Magazine added successfully!");
    } else {
      alert(
        "Please fill in title, edition, cover image URL, and magazine link.",
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            data-active-section={activeSection}
            className="max-w-4xl w-full h-[90vh] overflow-y-auto backdrop-blur-xl bg-gradient-to-br from-finance-navy/90 to-finance-navy-light/90 rounded-2xl p-8 border border-finance-gold/30 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Settings className="w-8 h-8 text-finance-gold" />
                <h2 className="text-3xl font-bold text-finance-gold">
                  {activeSection === "events"
                    ? "Admin Events Panel"
                    : activeSection === "sponsors"
                      ? "Admin Sponsors Panel"
                      : "Admin Luminaries Panel"}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-finance-red/20 transition-colors"
              >
                <X className="w-6 h-6 text-finance-red" />
              </button>
            </div>

            {/* Section Switch */}
            <div className="mb-8 flex justify-center">
              <div className="flex bg-finance-navy/50 backdrop-blur-sm rounded-xl p-1 border border-finance-gold/20 flex-wrap justify-center gap-1">
                <button
                  onClick={() => setActiveSection("events")}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeSection === "events"
                      ? "bg-finance-gold text-finance-navy"
                      : "text-finance-gold hover:bg-finance-gold/10"
                  }`}
                >
                  Events
                </button>
                <button
                  onClick={() => setActiveSection("sponsors")}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeSection === "sponsors"
                      ? "bg-finance-gold text-finance-navy"
                      : "text-finance-gold hover:bg-finance-gold/10"
                  }`}
                >
                  Sponsors
                </button>
                <button
                  onClick={() => setActiveSection("sessions")}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeSection === "sessions"
                      ? "bg-finance-gold text-finance-navy"
                      : "text-finance-gold hover:bg-finance-gold/10"
                  }`}
                >
                  Sessions
                </button>
                <button
                  onClick={() => setActiveSection("magazines")}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeSection === "magazines"
                      ? "bg-finance-gold text-finance-navy"
                      : "text-finance-gold hover:bg-finance-gold/10"
                  }`}
                >
                  Magazines
                </button>
                <button
                  onClick={() => setActiveSection("luminaries")}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeSection === "luminaries"
                      ? "bg-finance-gold text-finance-navy"
                      : "text-finance-gold hover:bg-finance-gold/10"
                  }`}
                >
                  Luminaries
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {activeSection === "magazines" ? (
                <>
                  {/* Add New Magazine */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-finance-navy/40 backdrop-blur-sm rounded-xl p-6 border border-finance-gold/20"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <BookOpen className="w-6 h-6 text-finance-gold" />
                      <h3 className="text-xl font-bold text-finance-gold">
                        Add Finsight Magazine
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Magazine Title"
                          value={newMagazine.title}
                          onChange={(e) =>
                            setNewMagazine((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="bg-finance-navy/50 border-finance-gold/20"
                        />
                        <Input
                          placeholder="Edition (e.g., Volume 1, Issue 2)"
                          value={newMagazine.edition}
                          onChange={(e) =>
                            setNewMagazine((prev) => ({
                              ...prev,
                              edition: e.target.value,
                            }))
                          }
                          className="bg-finance-navy/50 border-finance-gold/20"
                        />
                      </div>

                      <Input
                        placeholder="Magazine Description"
                        value={newMagazine.description}
                        onChange={(e) =>
                          setNewMagazine((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-finance-gold/20"
                      />

                      <Input
                        placeholder="Cover Image URL"
                        value={newMagazine.cover}
                        onChange={(e) =>
                          setNewMagazine((prev) => ({
                            ...prev,
                            cover: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-finance-gold/20"
                      />

                      <Input
                        placeholder="Magazine Link (PDF or external link)"
                        value={newMagazine.link}
                        onChange={(e) =>
                          setNewMagazine((prev) => ({
                            ...prev,
                            link: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-finance-gold/20"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          type="number"
                          placeholder="Number of Articles"
                          value={newMagazine.articles}
                          onChange={(e) =>
                            setNewMagazine((prev) => ({
                              ...prev,
                              articles: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="bg-finance-navy/50 border-finance-gold/20"
                        />
                        <Input
                          type="number"
                          placeholder="Number of Downloads"
                          value={newMagazine.downloads}
                          onChange={(e) =>
                            setNewMagazine((prev) => ({
                              ...prev,
                              downloads: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="bg-finance-navy/50 border-finance-gold/20"
                        />
                        <Input
                          placeholder="Read Time (e.g., 15 min)"
                          value={newMagazine.readTime}
                          onChange={(e) =>
                            setNewMagazine((prev) => ({
                              ...prev,
                              readTime: e.target.value,
                            }))
                          }
                          className="bg-finance-navy/50 border-finance-gold/20"
                        />
                      </div>

                      <Input
                        placeholder="Categories (comma-separated, e.g., Finance, Banking, Crypto)"
                        value={newMagazine.categories}
                        onChange={(e) =>
                          setNewMagazine((prev) => ({
                            ...prev,
                            categories: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-finance-gold/20"
                      />

                      <Input
                        placeholder="Key Highlights (comma-separated, e.g., Market Analysis, Expert Views)"
                        value={newMagazine.highlights}
                        onChange={(e) =>
                          setNewMagazine((prev) => ({
                            ...prev,
                            highlights: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-finance-gold/20"
                      />

                      <Button
                        onClick={handleAddMagazine}
                        className="bg-gradient-to-r from-finance-gold to-finance-electric text-finance-navy hover:scale-105 transition-transform w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Magazine
                      </Button>
                    </div>
                  </motion.div>

                  {/* Current Magazines */}
                  {magazines.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-finance-navy/40 backdrop-blur-sm rounded-xl p-6 border border-finance-gold/20"
                    >
                      <h4 className="text-lg font-semibold text-finance-gold mb-4">
                        Finsight Magazines ({magazines.length})
                      </h4>
                      <div className="space-y-3">
                        {magazines.map((mag) => (
                          <motion.div
                            key={mag.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-finance-navy/30 p-4 rounded-lg border border-finance-gold/10 hover:border-finance-gold/30 transition-colors"
                          >
                            <div className="flex gap-4 items-start">
                              {mag.cover && (
                                <img
                                  src={mag.cover}
                                  alt={mag.title}
                                  className="w-16 h-24 rounded object-cover flex-shrink-0"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-finance-gold text-lg">
                                  {mag.title}
                                </div>
                                <div className="text-sm text-finance-teal mb-2">
                                  {mag.edition}
                                </div>
                                {mag.description && (
                                  <p className="text-sm text-foreground/70 mb-2 line-clamp-2">
                                    {mag.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {mag.categories
                                    .slice(0, 3)
                                    .map((cat, idx) => (
                                      <span
                                        key={idx}
                                        className="text-xs bg-finance-navy px-2 py-1 rounded text-finance-teal border border-finance-teal/30"
                                      >
                                        {cat}
                                      </span>
                                    ))}
                                </div>
                                <div className="text-xs text-foreground/60 space-y-1">
                                  <div>
                                    📄 {mag.articles} Articles | 📥{" "}
                                    {mag.downloads} Downloads | ⏱️{" "}
                                    {mag.readTime}
                                  </div>
                                  <div className="text-finance-teal">
                                    <a
                                      href={mag.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline"
                                    >
                                      📎 View Magazine
                                    </a>
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() => removeMagazine(mag.id)}
                                variant="destructive"
                                size="sm"
                                className="flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {magazines.length === 0 && (
                    <div className="text-center py-8 text-finance-gold/60">
                      No magazines added yet. Add your first Finsight magazine
                      above!
                    </div>
                  )}
                </>
              ) : activeSection === "sessions" ? (
                <>
                  {/* Add New Session */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-finance-navy/40 backdrop-blur-sm rounded-xl p-6 border border-finance-teal/20"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-6 h-6 text-finance-teal" />
                      <h3 className="text-xl font-bold text-finance-teal">
                        Add New Session
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Session Name (e.g., Fintech Innovations)"
                        value={newSession.name}
                        onChange={(e) =>
                          setNewSession((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-finance-teal/20"
                      />
                      <Input
                        placeholder="Session Description (optional)"
                        value={newSession.description}
                        onChange={(e) =>
                          setNewSession((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-finance-teal/20"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          type="time"
                          placeholder="Start Time"
                          value={newSession.startTime}
                          onChange={(e) =>
                            setNewSession((prev) => ({
                              ...prev,
                              startTime: e.target.value,
                            }))
                          }
                          className="bg-finance-navy/50 border-finance-teal/20"
                        />
                        <Input
                          type="time"
                          placeholder="End Time"
                          value={newSession.endTime}
                          onChange={(e) =>
                            setNewSession((prev) => ({
                              ...prev,
                              endTime: e.target.value,
                            }))
                          }
                          className="bg-finance-navy/50 border-finance-teal/20"
                        />
                      </div>
                      <Button
                        onClick={handleAddConclaveSession}
                        className="bg-gradient-to-r from-finance-teal to-finance-mint text-finance-navy hover:scale-105 transition-transform"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Session
                      </Button>
                    </div>
                  </motion.div>

                  {/* Manage Sessions and Speakers */}
                  {conclaveSessions.map((session, sessionIndex) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + sessionIndex * 0.05 }}
                      className="bg-finance-navy/40 backdrop-blur-sm rounded-xl p-6 border border-finance-teal/20"
                    >
                      {/* Session Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Mic className="w-6 h-6 text-finance-teal" />
                          <div>
                            <h4 className="text-lg font-bold text-finance-teal">
                              {session.name}
                            </h4>
                            {session.description && (
                              <p className="text-sm text-finance-teal/70">
                                {session.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => removeSession(session.id)}
                          variant="destructive"
                          size="sm"
                        >
                          Delete Session
                        </Button>
                      </div>

                      {/* Add Speaker Section */}
                      <div className="bg-finance-navy/30 rounded-lg p-4 mb-4 border border-finance-teal/10">
                        <h5 className="text-sm font-bold text-finance-teal mb-3">
                          Add Speaker to This Session
                        </h5>
                        <div className="space-y-3">
                          <Input
                            placeholder="Speaker Name"
                            value={
                              selectedSessionForSpeaker === session.id
                                ? newSpeaker.name
                                : ""
                            }
                            onChange={(e) => {
                              setSelectedSessionForSpeaker(session.id);
                              setNewSpeaker((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }));
                            }}
                            className="bg-finance-navy/50 border-finance-teal/20"
                          />
                          <Input
                            placeholder="LinkedIn Profile URL or ID (e.g., linkedin.com/in/username)"
                            value={
                              selectedSessionForSpeaker === session.id
                                ? newSpeaker.linkedinId
                                : ""
                            }
                            onChange={(e) => {
                              setSelectedSessionForSpeaker(session.id);
                              setNewSpeaker((prev) => ({
                                ...prev,
                                linkedinId: e.target.value,
                              }));
                            }}
                            className="bg-finance-navy/50 border-finance-teal/20"
                          />
                          <Input
                            placeholder="Photo URL"
                            value={
                              selectedSessionForSpeaker === session.id
                                ? newSpeaker.photo
                                : ""
                            }
                            onChange={(e) => {
                              setSelectedSessionForSpeaker(session.id);
                              setNewSpeaker((prev) => ({
                                ...prev,
                                photo: e.target.value,
                              }));
                            }}
                            className="bg-finance-navy/50 border-finance-teal/20"
                          />
                          <Input
                            placeholder="Speaker Bio (optional)"
                            value={
                              selectedSessionForSpeaker === session.id
                                ? newSpeaker.bio
                                : ""
                            }
                            onChange={(e) => {
                              setSelectedSessionForSpeaker(session.id);
                              setNewSpeaker((prev) => ({
                                ...prev,
                                bio: e.target.value,
                              }));
                            }}
                            className="bg-finance-navy/50 border-finance-teal/20"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              type="time"
                              placeholder="Speaker Start Time"
                              value={
                                selectedSessionForSpeaker === session.id
                                  ? newSpeaker.startTime
                                  : ""
                              }
                              onChange={(e) => {
                                setSelectedSessionForSpeaker(session.id);
                                setNewSpeaker((prev) => ({
                                  ...prev,
                                  startTime: e.target.value,
                                }));
                              }}
                              className="bg-finance-navy/50 border-finance-teal/20"
                            />
                            <Input
                              type="time"
                              placeholder="Speaker End Time"
                              value={
                                selectedSessionForSpeaker === session.id
                                  ? newSpeaker.endTime
                                  : ""
                              }
                              onChange={(e) => {
                                setSelectedSessionForSpeaker(session.id);
                                setNewSpeaker((prev) => ({
                                  ...prev,
                                  endTime: e.target.value,
                                }));
                              }}
                              className="bg-finance-navy/50 border-finance-teal/20"
                            />
                          </div>
                          <Button
                            onClick={handleAddSpeaker}
                            disabled={selectedSessionForSpeaker !== session.id}
                            className="bg-gradient-to-r from-finance-mint to-finance-teal text-finance-navy hover:scale-105 transition-transform disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Speaker
                          </Button>
                        </div>
                      </div>

                      {/* Current Speakers */}
                      {session.speakers.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-bold text-finance-teal">
                            Speakers ({session.speakers.length})
                          </h5>
                          {session.speakers.map((speaker) => (
                            <div
                              key={speaker.id}
                              className="bg-finance-navy/30 p-3 rounded-lg flex items-start justify-between border border-finance-teal/10"
                            >
                              <div className="flex gap-3 flex-1">
                                {speaker.photo && (
                                  <img
                                    src={speaker.photo}
                                    alt={speaker.name}
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = "none";
                                    }}
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="font-medium text-finance-teal">
                                    {speaker.name}
                                  </div>
                                  <a
                                    href={
                                      speaker.linkedinId.startsWith("http")
                                        ? speaker.linkedinId
                                        : `https://linkedin.com/in/${speaker.linkedinId}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-finance-teal/60 hover:text-finance-teal/90 break-all"
                                  >
                                    {speaker.linkedinId}
                                  </a>
                                  {speaker.bio && (
                                    <p className="text-xs text-finance-teal/50 mt-1">
                                      {speaker.bio}
                                    </p>
                                  )}
                                  {(speaker.startTime || speaker.endTime) && (
                                    <p className="text-xs text-finance-mint/70 mt-1">
                                      🕐 {speaker.startTime || "—"} to{" "}
                                      {speaker.endTime || "—"}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                onClick={() =>
                                  removeSpeaker(session.id, speaker.id)
                                }
                                variant="destructive"
                                size="sm"
                                className="flex-shrink-0"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {conclaveSessions.length === 0 && (
                    <div className="text-center py-8 text-finance-teal/60">
                      No sessions created yet. Create your first session above!
                    </div>
                  )}
                </>
              ) : activeSection === "events" ? (
                <>
                  {/* Saturday Sessions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-finance-navy/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-6 h-6 text-blue-400" />
                      <h3 className="text-xl font-bold text-blue-400">
                        Saturday Sessions
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Session Title (e.g., Saturday Seminar 3: Crypto Fundamentals)"
                        value={newSaturdaySession.title}
                        onChange={(e) =>
                          setNewSaturdaySession((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-blue-500/20"
                      />
                      <Input
                        placeholder="Session Description"
                        value={newSaturdaySession.description}
                        onChange={(e) =>
                          setNewSaturdaySession((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-blue-500/20"
                      />
                      <Button
                        onClick={handleAddSaturdaySession}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105 transition-transform"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Saturday Session
                      </Button>
                    </div>

                    {/* Current Saturday Sessions */}
                    {eventDetails.find((e) => e.id === "saturday-sessions")
                      ?.events &&
                      eventDetails.find((e) => e.id === "saturday-sessions")!
                        .events!.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold text-blue-300 mb-3">
                            Current Saturday Sessions:
                          </h4>
                          <div className="space-y-2">
                            {eventDetails
                              .find((e) => e.id === "saturday-sessions")!
                              .events!.map((event, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-finance-navy/30 p-3 rounded-lg"
                                >
                                  <div>
                                    <div className="font-medium text-blue-400">
                                      {event.title}
                                    </div>
                                    {event.description && (
                                      <div className="text-sm text-blue-300/70">
                                        {event.description}
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    onClick={() => removeSaturdaySession(index)}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </motion.div>

                  {/* Networking Events */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-finance-navy/40 backdrop-blur-sm rounded-xl p-6 border border-green-500/20"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <Users className="w-6 h-6 text-green-400" />
                      <h3 className="text-xl font-bold text-green-400">
                        Networking Events
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Event Title (e.g., Alumni Mixer 2025)"
                        value={newNetworkingEvent.title}
                        onChange={(e) =>
                          setNewNetworkingEvent((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-green-500/20"
                      />
                      <Input
                        placeholder="Event Description"
                        value={newNetworkingEvent.description}
                        onChange={(e) =>
                          setNewNetworkingEvent((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-green-500/20"
                      />
                      <Button
                        onClick={handleAddNetworkingEvent}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:scale-105 transition-transform"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Networking Event
                      </Button>
                    </div>

                    {/* Current Networking Events */}
                    {eventDetails.find((e) => e.id === "networking-events")
                      ?.events &&
                      eventDetails.find((e) => e.id === "networking-events")!
                        .events!.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold text-green-300 mb-3">
                            Current Networking Events:
                          </h4>
                          <div className="space-y-2">
                            {eventDetails
                              .find((e) => e.id === "networking-events")!
                              .events!.map((event, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-finance-navy/30 p-3 rounded-lg"
                                >
                                  <div>
                                    <div className="font-medium text-green-400">
                                      {event.title}
                                    </div>
                                    {event.description && (
                                      <div className="text-sm text-green-300/70">
                                        {event.description}
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    onClick={() => removeNetworkingEvent(index)}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </motion.div>

                  {/* Flagship Events */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-finance-navy/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <Trophy className="w-6 h-6 text-purple-400" />
                      <h3 className="text-xl font-bold text-purple-400">
                        Flagship Conclave
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <Input
                        placeholder="Event Title (e.g., Annual Finance Conclave 2025)"
                        value={newFlagshipEvent.title}
                        onChange={(e) =>
                          setNewFlagshipEvent((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-purple-500/20"
                      />
                      <Input
                        placeholder="Event Description"
                        value={newFlagshipEvent.description}
                        onChange={(e) =>
                          setNewFlagshipEvent((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-purple-500/20"
                      />
                      <Button
                        onClick={handleAddFlagshipEvent}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:scale-105 transition-transform"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Flagship Event
                      </Button>
                    </div>

                    {/* Current Flagship Events */}
                    {eventDetails.find((e) => e.id === "flagship-event")
                      ?.events &&
                      eventDetails.find((e) => e.id === "flagship-event")!
                        .events!.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold text-purple-300 mb-3">
                            Current Flagship Events:
                          </h4>
                          <div className="space-y-2">
                            {eventDetails
                              .find((e) => e.id === "flagship-event")!
                              .events!.map((event, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-finance-navy/30 p-3 rounded-lg"
                                >
                                  <div>
                                    <div className="font-medium text-purple-400">
                                      {event.title}
                                    </div>
                                    {event.description && (
                                      <div className="text-sm text-purple-300/70">
                                        {event.description}
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    onClick={() => removeFlagshipEvent(index)}
                                    variant="destructive"
                                    size="sm"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </motion.div>

                  {/* Upcoming Events */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-finance-navy/40 backdrop-blur-sm rounded-xl p-6 border border-finance-gold/20"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <Calendar className="w-6 h-6 text-finance-gold" />
                      <h3 className="text-xl font-bold text-finance-gold">
                        Upcoming Events Timeline
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Event Title"
                          value={newUpcomingEvent.title}
                          onChange={(e) =>
                            setNewUpcomingEvent((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="bg-finance-navy/50 border-finance-gold/20"
                        />
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-finance-gold flex items-center gap-2">
                            📅 Event Date
                            <span className="text-xs text-finance-electric/70 font-normal">
                              (Days will be calculated automatically)
                            </span>
                          </label>
                          <Input
                            type="date"
                            value={newUpcomingEvent.dateInput}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="bg-finance-navy/50 border-finance-gold/20 focus:border-finance-gold/60"
                            min={new Date().toISOString().split("T")[0]} // Prevent past dates
                            title="Select the event date - countdown will be calculated automatically"
                          />
                          {newUpcomingEvent.date && (
                            <div className="bg-finance-navy/20 rounded p-2 space-y-1">
                              <div className="text-xs text-finance-electric">
                                ✨ Display Format:{" "}
                                <span className="font-medium">
                                  {newUpcomingEvent.date}
                                </span>
                              </div>
                              {newUpcomingEvent.countdown.days >= 0 && (
                                <div className="text-xs text-green-400">
                                  📅{" "}
                                  <span className="font-medium">
                                    {newUpcomingEvent.countdown.days}
                                  </span>{" "}
                                  days from today
                                  {newUpcomingEvent.countdown.days === 0 && (
                                    <span className="text-green-300 font-bold">
                                      {" "}
                                      (TODAY!)
                                    </span>
                                  )}
                                  {newUpcomingEvent.countdown.days <= 7 &&
                                    newUpcomingEvent.countdown.days > 0 && (
                                      <span className="text-orange-300">
                                        {" "}
                                        (Soon!)
                                      </span>
                                    )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <Input
                          placeholder="Time (e.g., 10:00 AM - 6:00 PM)"
                          value={newUpcomingEvent.time}
                          onChange={(e) =>
                            setNewUpcomingEvent((prev) => ({
                              ...prev,
                              time: e.target.value,
                            }))
                          }
                          className="bg-finance-navy/50 border-finance-gold/20"
                        />
                        <Input
                          placeholder="Location"
                          value={newUpcomingEvent.location}
                          onChange={(e) =>
                            setNewUpcomingEvent((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          className="bg-finance-navy/50 border-finance-gold/20"
                        />
                      </div>
                      <Input
                        placeholder="Event Description"
                        value={newUpcomingEvent.description}
                        onChange={(e) =>
                          setNewUpcomingEvent((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-finance-gold/20"
                      />
                      <Input
                        placeholder="Registration Link (Google Form URL)"
                        value={newUpcomingEvent.registrationLink}
                        onChange={(e) =>
                          setNewUpcomingEvent((prev) => ({
                            ...prev,
                            registrationLink: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-finance-gold/20"
                      />

                      {/* Automatic Days Calculation Display */}
                      {newUpcomingEvent.dateInput && (
                        <div className="bg-finance-navy/30 rounded-lg p-4 border border-finance-gold/30">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-finance-gold">
                                Countdown Automatically Calculated
                              </div>
                              <div className="text-xs text-finance-electric mt-1">
                                Based on selected date vs today
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-400">
                                {newUpcomingEvent.countdown.days}
                              </div>
                              <div className="text-xs text-green-300">
                                Days Left
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={handleAddUpcomingEvent}
                        className="bg-gradient-to-r from-finance-gold to-finance-electric text-finance-navy hover:scale-105 transition-transform"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Upcoming Event
                      </Button>
                    </div>

                    {/* Current Upcoming Events */}
                    {upcomingEvents.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold text-finance-electric mb-3">
                          Current Upcoming Events:
                        </h4>
                        <div className="space-y-2">
                          {upcomingEvents.map((event) => (
                            <div
                              key={event.id}
                              className="flex items-center justify-between bg-finance-navy/30 p-3 rounded-lg"
                            >
                              <div>
                                <div className="font-medium text-finance-gold">
                                  {event.title}
                                </div>
                                <div className="text-sm text-finance-electric">
                                  {event.date} • {event.location}
                                </div>
                              </div>
                              <Button
                                onClick={() => removeUpcomingEvent(event.id)}
                                variant="destructive"
                                size="sm"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </>
              ) : (
                <>
                  {/* Sponsors Admin */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-finance-navy/40 backdrop-blur-sm rounded-xl p-6 border border-finance-gold/20 sponsors-admin"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <Users className="w-6 h-6 text-finance-gold" />
                      <h3 className="text-xl font-bold text-finance-gold">
                        Manage Sponsors
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Sponsor Name"
                        value={newSponsor.name}
                        onChange={(e) =>
                          setNewSponsor((p) => ({ ...p, name: e.target.value }))
                        }
                        className="bg-finance-navy/50 border-finance-gold/20"
                      />
                      <Input
                        placeholder="Logo URL"
                        value={newSponsor.logo}
                        onChange={(e) =>
                          setNewSponsor((p) => ({ ...p, logo: e.target.value }))
                        }
                        className="bg-finance-navy/50 border-finance-gold/20"
                      />
                      <Input
                        placeholder="Industry"
                        value={newSponsor.industry}
                        onChange={(e) =>
                          setNewSponsor((p) => ({
                            ...p,
                            industry: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-finance-gold/20"
                      />
                      <Input
                        placeholder="Website (optional)"
                        value={newSponsor.website || ""}
                        onChange={(e) =>
                          setNewSponsor((p) => ({
                            ...p,
                            website: e.target.value,
                          }))
                        }
                        className="bg-finance-navy/50 border-finance-gold/20"
                      />
                      <div className="md:col-span-2 grid grid-cols-1 gap-3">
                        <Input
                          placeholder="Short Description"
                          value={newSponsor.description}
                          onChange={(e) =>
                            setNewSponsor((p) => ({
                              ...p,
                              description: e.target.value,
                            }))
                          }
                          className="bg-finance-navy/50 border-finance-gold/20"
                        />
                        <div className="flex items-center gap-3">
                          <label className="text-sm text-finance-gold">
                            Status
                          </label>
                          <select
                            value={newSponsor.isActive ? "current" : "past"}
                            onChange={(e) =>
                              setNewSponsor((p) => ({
                                ...p,
                                isActive: e.target.value === "current",
                              }))
                            }
                            className="bg-finance-navy/50 border border-finance-gold/20 rounded-lg px-3 py-2 text-sm"
                          >
                            <option value="current">Current</option>
                            <option value="past">Past</option>
                          </select>
                        </div>
                        <Button
                          onClick={handleAddSponsor}
                          className="bg-gradient-to-r from-finance-gold to-finance-electric text-finance-navy hover:scale-105 transition-transform w-fit"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add Sponsor
                        </Button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Existing sponsors list with controls */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-finance-navy/40 backdrop-blur-sm rounded-xl p-6 border border-finance-teal/20 sponsors-admin"
                  >
                    <h4 className="text-lg font-semibold text-finance-teal mb-4">
                      All Sponsors
                    </h4>
                    <div className="space-y-2">
                      {sponsors.map((sp) => (
                        <div
                          key={sp.id}
                          className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center bg-finance-navy/30 p-3 rounded-lg"
                        >
                          <div className="md:col-span-2 font-medium text-foreground truncate">
                            {sp.name}
                          </div>
                          <div className="text-sm text-foreground/70 truncate">
                            {sp.industry}
                          </div>
                          <div className="text-sm">
                            <select
                              value={sp.isActive ? "current" : "past"}
                              onChange={(e) =>
                                updateSponsor(sp.id, {
                                  isActive: e.target.value === "current",
                                })
                              }
                              className="bg-finance-navy/50 border border-finance-gold/20 rounded px-2 py-1 text-xs"
                            >
                              <option value="current">Current</option>
                              <option value="past">Past</option>
                            </select>
                          </div>
                          <div className="flex gap-2 justify-end md:col-span-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateSponsor(sp.id, { name: sp.name })
                              }
                              className="bg-finance-teal text-finance-navy"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeSponsor(sp.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      {sponsors.length === 0 && (
                        <div className="text-sm text-foreground/60">
                          No sponsors yet.
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </div>

            {activeSection === "luminaries" && (
              <div className="mt-6">
                <AdminLuminariesPanel />
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-finance-electric/70">
                💡 All changes are saved automatically in local storage. Changes
                will persist until cleared.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
