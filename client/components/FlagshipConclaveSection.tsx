import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Clock,
  Users,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "./ui/button";
import { useConclaveSessionsData } from "../hooks/useConclaveSessionsData";

export default function FlagshipConclaveSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  const { sessions, loading } = useConclaveSessionsData();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Auto-expand first session on load
  React.useEffect(() => {
    if (sessions.length > 0 && !expandedSession) {
      setExpandedSession(sessions[0].id);
    }
  }, [sessions, expandedSession]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (containerRef.current) {
      inViewRef(containerRef.current);
    }
  }, [inViewRef]);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 px-6 bg-gradient-to-b from-finance-navy to-finance-navy-light overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-finance-teal/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-finance-mint/5 rounded-full blur-3xl animate-float" />
      </div>

      <div className="container mx-auto relative z-10" ref={containerRef}>
        {/* Section Header */}
        {sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              FLAGSHIP <span className="text-finance-teal">CONCLAVE</span>
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-finance-teal to-finance-mint mx-auto mb-6" />
            <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
              Exclusive sessions featuring industry experts, thought leaders,
              and innovators shaping the future of finance
            </p>
          </motion.div>
        )}

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
                ease: "easeOut",
              }}
              className="group"
            >
              <motion.div
                className="relative h-full bg-gradient-to-br from-finance-navy/80 to-finance-navy-light/50 backdrop-blur-xl border border-finance-teal/30 rounded-2xl overflow-hidden hover:border-finance-teal/60 transition-all duration-300"
                whileHover={{
                  y: -5,
                  boxShadow: "0 20px 40px rgba(32, 178, 170, 0.2)",
                }}
              >
                {/* Session Header */}
                <div className="p-6 border-b border-finance-teal/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-finance-teal mb-2">
                        {session.name}
                      </h3>
                      {session.description && (
                        <p className="text-foreground/70 text-sm mb-3">
                          {session.description}
                        </p>
                      )}

                      {/* Session Timing */}
                      {(session.startTime || session.endTime) && (
                        <div className="flex items-center gap-2 text-finance-mint text-sm">
                          <Clock className="w-4 h-4" />
                          <span>
                            {session.startTime || "—"}{" "}
                            {session.endTime && `to ${session.endTime}`}
                          </span>
                        </div>
                      )}

                      {/* Speaker Count */}
                      <div className="flex items-center gap-2 text-finance-electric text-sm mt-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {session.speakers.length} Speaker
                          {session.speakers.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Speakers List - Always Visible */}
                <div className="px-6 pb-6 space-y-4">
                  {session.speakers.length > 0 ? (
                    session.speakers.map((speaker, speakerIndex) => (
                      <motion.div
                        key={speaker.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: speakerIndex * 0.1 }}
                        className="bg-finance-navy/50 rounded-lg p-4 border border-finance-teal/20 hover:border-finance-teal/40 transition-colors"
                      >
                        <div className="flex gap-4">
                          {speaker.photo && (
                            <img
                              src={speaker.photo}
                              alt={speaker.name}
                              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-bold text-finance-teal mb-1">
                              {speaker.name}
                            </div>
                            {speaker.bio && (
                              <p className="text-xs text-foreground/70 mb-2">
                                {speaker.bio}
                              </p>
                            )}
                            {(speaker.startTime || speaker.endTime) && (
                              <div className="flex items-center gap-2 text-finance-mint text-xs mb-2">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {speaker.startTime || "—"}{" "}
                                  {speaker.endTime && `to ${speaker.endTime}`}
                                </span>
                              </div>
                            )}
                            {speaker.linkedinId && (
                              <a
                                href={
                                  speaker.linkedinId.startsWith("http")
                                    ? speaker.linkedinId
                                    : `https://linkedin.com/in/${speaker.linkedinId}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-finance-electric text-xs hover:text-finance-teal transition-colors"
                              >
                                LinkedIn
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-foreground/60">
                      No speakers added yet for this session
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          <div className="bg-gradient-to-br from-finance-teal/10 to-finance-mint/10 rounded-lg p-6 border border-finance-teal/30 text-center">
            <div className="text-4xl font-bold text-finance-teal mb-2">
              {sessions.length}
            </div>
            <div className="text-foreground/70">Total Sessions</div>
          </div>
          <div className="bg-gradient-to-br from-finance-mint/10 to-finance-teal/10 rounded-lg p-6 border border-finance-mint/30 text-center">
            <div className="text-4xl font-bold text-finance-mint mb-2">
              {sessions.reduce((acc, s) => acc + s.speakers.length, 0)}
            </div>
            <div className="text-foreground/70">Expert Speakers</div>
          </div>
          <div className="bg-gradient-to-br from-finance-electric/10 to-finance-teal/10 rounded-lg p-6 border border-finance-electric/30 text-center">
            <div className="text-4xl font-bold text-finance-electric mb-2">
              {
                new Set(sessions.flatMap((s) => s.speakers.map((sp) => sp.id)))
                  .size
              }
            </div>
            <div className="text-foreground/70">Unique Experts</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
