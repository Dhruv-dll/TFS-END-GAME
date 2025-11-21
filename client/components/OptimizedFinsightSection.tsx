import React, { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Eye,
  Share,
  Star,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Award,
  ArrowUpRight,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  useFinsightMagazines,
  Magazine as SavedMagazine,
} from "../hooks/useFinsightMagazines";

interface Magazine {
  id: string;
  title: string;
  edition: string;
  date: string;
  coverImage: string;
  description: string;
  featured: boolean;
  articles: number;
  downloads: number;
  readTime: string;
  categories: string[];
  highlights: string[];
  link?: string;
}

// Default magazine data
const defaultMagazines: Magazine[] = [
  {
    id: "vol-1",
    title: "Finsight Magazine Vol. 1",
    edition: "Volume 1",
    date: "2024",
    coverImage: "/placeholder.svg",
    description:
      "Our inaugural edition featuring comprehensive insights into finance, markets, and emerging technologies shaping the financial world.",
    featured: true,
    articles: 15,
    downloads: 3500,
    readTime: "50 min",
    categories: ["Finance", "Markets", "Technology", "Analysis"],
    highlights: [
      "Market trends and analysis",
      "Investment strategies for students",
      "Industry expert interviews",
      "Financial technology insights",
    ],
  },
];

export default function OptimizedFinsightSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [selectedMagazine, setSelectedMagazine] = useState<Magazine | null>(
    null,
  );

  const { magazines: savedMagazines } = useFinsightMagazines();

  // Combine saved magazines with default magazines, mark first saved as featured if it exists
  const allMagazines: Magazine[] =
    savedMagazines.length > 0
      ? savedMagazines.map((mag, idx) => ({
          ...mag,
          date: new Date().getFullYear().toString(),
          coverImage: mag.cover,
          featured: idx === 0,
        }))
      : defaultMagazines;

  const featuredMagazine =
    allMagazines.find((mag) => mag.featured) || allMagazines[0];

  const MagazineCard = ({
    magazine,
    featured = false,
  }: {
    magazine: Magazine;
    featured?: boolean;
  }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <motion.div
        className={`relative ${featured ? "w-full max-w-sm mx-auto" : "w-64"} cursor-pointer group`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (magazine.link) {
            window.open(magazine.link, "_blank");
          }
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className={`relative ${featured ? "h-80" : "h-72"} rounded-2xl overflow-hidden shadow-xl bg-finance-navy-light border border-finance-teal/30`}
          animate={{
            boxShadow: isHovered
              ? "0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 212, 204, 0.3)"
              : "0 10px 25px rgba(0, 0, 0, 0.1)",
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0, 212, 204, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 204, 0.1) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
          </div>

          {/* Magazine Cover Content */}
          <div className="relative h-full p-6 flex flex-col justify-between z-10">
            {/* Header */}
            <div className="text-center mb-4">
              <motion.h3
                className="text-2xl font-bold text-finance-teal mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                FINSIGHT
              </motion.h3>
              <Badge className="bg-finance-teal text-white font-bold">
                {magazine.edition}
              </Badge>
            </div>

            {/* Featured Article */}
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <h4 className="text-lg font-bold text-white text-center leading-tight">
                {magazine.title}
              </h4>

              {/* Simple Visual Element */}
              <div className="relative h-24 bg-finance-teal/10 rounded-xl border border-finance-teal/20 flex items-center justify-center">
                <TrendingUp className="w-12 h-12 text-finance-teal" />
              </div>

              {/* Stats */}
              <div className="flex justify-between text-xs text-white/70">
                <span>{magazine.articles} Articles</span>
                <span>{magazine.readTime} Read</span>
                <span>{magazine.downloads} Downloads</span>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-1 justify-center">
              {magazine.categories.slice(0, 3).map((category) => (
                <span
                  key={category}
                  className="text-xs bg-finance-teal/20 border border-finance-teal/30 px-2 py-1 rounded-full text-white/80"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Hover Overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-finance-teal/5 to-transparent opacity-0 rounded-2xl"
            animate={{
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Subtle Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl -z-10"
          style={{
            background: "rgba(0, 212, 204, 0.1)",
            filter: "blur(15px)",
          }}
          animate={{
            opacity: isHovered ? 0.3 : 0.1,
            scale: isHovered ? 1.02 : 1,
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    );
  };

  return (
    <section
      ref={sectionRef}
      id="insights"
      className="relative min-h-screen py-12 sm:py-16 lg:py-20 overflow-hidden"
      style={{
        backgroundColor: "#101E36", // Solid navy background
      }}
    >
      {/* Professional Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0, 212, 204, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 204, 0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Enhanced Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16 lg:mb-20"
          initial={{ opacity: 0, y: -30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center space-x-3 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="w-12 h-12 bg-finance-teal rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-finance-navy" />
            </div>
            <div className="text-left">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white">
                <span className="text-finance-teal">FINSIGHT</span>
              </h2>
              <motion.p
                className="text-lg sm:text-xl text-finance-teal font-medium"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Financial Intelligence Magazine
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center justify-center space-x-4 sm:space-x-6 mb-6 sm:mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="w-16 sm:w-24 h-0.5 bg-gradient-to-r from-transparent via-finance-teal to-transparent" />
            <div className="flex space-x-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-finance-teal" />
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-finance-teal" />
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-finance-teal" />
            </div>
            <div className="w-16 sm:w-24 h-0.5 bg-gradient-to-r from-transparent via-finance-teal to-transparent" />
          </motion.div>

          <motion.p
            className="text-lg sm:text-xl text-white/80 max-w-4xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Dive deep into the world of finance with our quarterly digital
            magazine. Featuring cutting-edge insights, expert perspectives, and
            exclusive interviews from industry leaders and rising stars.
          </motion.p>
        </motion.div>

        {/* Featured Magazine Display */}
        <motion.div
          className="flex justify-center mb-12 sm:mb-16 lg:mb-20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="relative">
            <MagazineCard magazine={featuredMagazine} featured={true} />

            {/* Stats - Mobile Responsive */}
          </div>
        </motion.div>

        {/* Call to Action - Mobile Responsive */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Stay Updated
            </h3>
            <p className="text-white/80 mb-6 text-sm sm:text-base">
              Get notified when new editions are released and never miss out on
              the latest financial insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                onClick={() => {
                  if (featuredMagazine.link) {
                    window.open(featuredMagazine.link, "_blank");
                  }
                }}
              >
                <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Read Magazine
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-6 sm:px-8 py-3 rounded-xl transition-all duration-300"
              >
                <Share className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Subscribe
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Magazine Detail Modal - Mobile Responsive */}
      <AnimatePresence>
        {selectedMagazine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMagazine(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Header - Mobile Responsive */}
                <div className="relative p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 sm:space-x-6 flex-1">
                      <div className="w-16 h-20 sm:w-20 sm:h-24 lg:w-24 lg:h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 truncate">
                          {selectedMagazine.title}
                        </h3>
                        <p className="text-base sm:text-lg lg:text-xl text-blue-300 mb-2 sm:mb-4">
                          {selectedMagazine.edition}
                        </p>
                        <p className="text-white/80 leading-relaxed text-sm sm:text-base hidden sm:block">
                          {selectedMagazine.description}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMagazine(null)}
                      className="text-white hover:bg-white/10 p-2"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Mobile description */}
                  <p className="text-white/80 leading-relaxed text-sm mt-4 sm:hidden">
                    {selectedMagazine.description}
                  </p>
                </div>

                {/* Content - Mobile Responsive */}
                <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {/* Stats - Mobile Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      {
                        label: "Articles",
                        value: selectedMagazine.articles,
                        icon: BookOpen,
                      },
                      {
                        label: "Downloads",
                        value: selectedMagazine.downloads.toLocaleString(),
                        icon: Download,
                      },
                      {
                        label: "Read Time",
                        value: selectedMagazine.readTime,
                        icon: Calendar,
                      },
                      { label: "Rating", value: "4.9/5", icon: Star },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        className="text-center p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl border border-white/10"
                      >
                        <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-400 mx-auto mb-2" />
                        <div className="text-sm sm:text-base lg:text-xl font-bold text-white">
                          {stat.value}
                        </div>
                        <div className="text-xs sm:text-sm text-white/70">
                          {stat.label}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Highlights - Mobile Responsive */}
                  <div>
                    <h4 className="text-lg sm:text-xl font-semibold text-white mb-4">
                      Key Highlights
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedMagazine.highlights.map((highlight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + index * 0.05 }}
                          className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                          <span className="text-white/90 text-sm sm:text-base">
                            {highlight}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Actions - Mobile Responsive */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 sm:px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Download PDF
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white/30 text-white hover:bg-white/10 px-6 sm:px-8 py-3 rounded-xl transition-all duration-300"
                    >
                      <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Read Online
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
