import { useState, useEffect } from "react";
import ECCStyleNavigation from "../components/ECCStyleNavigation";
import ProfessionalHeroSection from "../components/ProfessionalHeroSection";
import ModernLuminariesSection from "../components/ModernLuminariesSection";
import OptimizedFinsightSection from "../components/OptimizedFinsightSection";
import MarketDataErrorBoundary, {
  NetworkStatusIndicator,
} from "../components/MarketDataErrorBoundary";
import MobileOptimizedEventsSection from "../components/MobileOptimizedEventsSection";
import FlagshipConclaveSection from "../components/FlagshipConclaveSection";
import AboutSection from "../components/AboutSection";
import AboutBAFSection from "../components/AboutBAFSection";
import ContactSection from "../components/ContactSection";
import SponsorsSection from "../components/SponsorsSection";
import FloatingMarketIcon from "../components/FloatingMarketIcon";
import AdminEventsPanel from "../components/AdminEventsPanel";
import AdminLogin from "../components/AdminLogin";
import { EventPopupProvider } from "../hooks/useEventPopup";
import { AuthProvider, useAuth } from "../hooks/useAuth";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Users,
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  ChevronRight,
  Play,
  Download,
  ExternalLink,
} from "lucide-react";

export default function Index() {
  const [scrolled, setScrolled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLoginPanel, setShowLoginPanel] = useState(false);
  const { scrollYProgress } = useScroll();

  // Color temperature transformation based on scroll
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["rgb(0, 0, 18)", "rgb(26, 26, 46)", "rgb(51, 51, 77)"],
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Admin panel keyboard shortcut (Ctrl+Alt+A)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        console.log("🔐 Admin panel shortcut triggered");
        setShowLoginPanel(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const aboutSections = [
    {
      id: "baf",
      title: "BAF Introduction",
      description:
        "Bachelor of Accounting & Finance - Building Future Financial Leaders",
      icon: BookOpen,
      color: "from-blue-600 to-cyan-400",
      stats: [
        { label: "Years of Excellence", value: "25+" },
        { label: "Alumni Network", value: "2000+" },
        { label: "Industry Partners", value: "50+" },
      ],
    },
    {
      id: "story",
      title: "TFS Story",
      description: "Our Journey in Shaping Financial Education",
      icon: Award,
      color: "from-finance-gold to-yellow-400",
      milestones: [
        {
          year: "2018",
          event: "TFS Foundation",
          description: "Inception of The Finance Symposium",
        },
        {
          year: "2019",
          event: "First Conclave",
          description: "Inaugural flagship event with 500+ participants",
        },
        {
          year: "2020",
          event: "Digital Transformation",
          description: "Successful transition to virtual events",
        },
        {
          year: "2021",
          event: "Industry Partnership",
          description: "Collaboration with leading financial institutions",
        },
        {
          year: "2022",
          event: "Global Reach",
          description: "International speakers and participants",
        },
        {
          year: "2023",
          event: "Innovation Hub",
          description: "Launch of FinTech initiatives",
        },
      ],
    },
    {
      id: "aspirations",
      title: "Aspirations",
      description: "Vision for the Future of Finance Education",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-400",
      goals: [
        {
          title: "Industry Leadership",
          description: "Become the premier finance education platform in India",
        },
        {
          title: "Global Network",
          description: "Expand international partnerships and collaborations",
        },
        {
          title: "Innovation Center",
          description: "Establish a FinTech research and development hub",
        },
        {
          title: "Student Success",
          description: "100% placement rate for program graduates",
        },
      ],
    },
  ];

  const events = {
    upcoming: [
      {
        title: "Annual Finance Conclave 2024",
        date: "March 15-16, 2024",
        type: "Flagship Event",
        description: "Two-day premier finance event featuring industry leaders",
        category: "conclave",
        status: "Open",
      },
      {
        title: "Saturday Session: Financial Technology",
        date: "February 24, 2024",
        type: "Educational",
        description:
          "Exploring fintech innovations and digital financial services",
        category: "session",
        status: "Open",
      },
      {
        title: "Networking Mixer: Alumni Connect",
        date: "March 2, 2024",
        type: "Networking",
        description: "Connect with successful BAF alumni in the industry",
        category: "networking",
        status: "Open",
      },
    ],
    past: [
      {
        title: "Digital Banking Revolution",
        date: "January 20, 2024",
        type: "Saturday Session",
        description: "Exploring the future of digital banking",
        category: "session",
      },
      {
        title: "Investment Strategies Workshop",
        date: "December 15, 2023",
        type: "Workshop",
        description: "Hands-on investment portfolio management",
        category: "session",
      },
    ],
  };

  const finsightIssues = [
    {
      title: "Finsight Magazine",
      issue: "Second Edition",
      date: "2024",
      cover: "/api/placeholder/300/400",
      topics: [
        "Personal Finance",
        "Financial Education",
        "Investment Strategies",
      ],
    },
    {
      title: "Economic News & Laws",
      issue: "Special Feature",
      date: "2024",
      cover: "/api/placeholder/300/400",
      topics: [
        "Economic Deconstruction",
        "Financial Regulations",
        "Legal Updates",
      ],
    },
    {
      title: "Finance & Management",
      issue: "Knowledge Series",
      date: "2024",
      cover: "/api/placeholder/300/400",
      topics: ["Progressive Finance", "Dynamic Markets", "Management Insights"],
    },
  ];

  const sponsors = {
    present: [
      { name: "HDFC Bank", logo: "/api/placeholder/150/80", tier: "Platinum" },
      { name: "ICICI Bank", logo: "/api/placeholder/150/80", tier: "Gold" },
      { name: "Axis Bank", logo: "/api/placeholder/150/80", tier: "Gold" },
      {
        name: "Kotak Mahindra",
        logo: "/api/placeholder/150/80",
        tier: "Silver",
      },
    ],
    past: [
      {
        name: "State Bank of India",
        logo: "/api/placeholder/150/80",
        tier: "Platinum",
      },
      { name: "Bank of Baroda", logo: "/api/placeholder/150/80", tier: "Gold" },
      { name: "Yes Bank", logo: "/api/placeholder/150/80", tier: "Silver" },
    ],
  };

  const teamGroups = [
    {
      name: "Faculty",
      theme: "academic",
      color: "from-blue-500 to-indigo-600",
      members: [
        {
          name: "Dr. Sanjay Parab",
          role: "Vice Principal and Associate Professor",
          image: "/api/placeholder/200/200",
        },
        {
          name: "Mr. Pratik Purohit",
          role: "Assistant Professor",
          image: "/api/placeholder/200/200",
        },
        {
          name: "Ms. Kamalika Ray",
          role: "Assistant Professor",
          image: "/api/placeholder/200/200",
        },
        {
          name: "Mr. Vinayak Thool",
          role: "Assistant Professor",
          image: "/api/placeholder/200/200",
        },
        {
          name: "Mr. Lloyd Serrao",
          role: "Assistant Professor",
          image: "/api/placeholder/200/200",
        },
      ],
    },
    {
      name: "Trio Leadership",
      theme: "leadership",
      color: "from-purple-500 to-pink-500",
      members: [
        {
          name: "Arjun Patel",
          role: "President",
          image: "/api/placeholder/200/200",
        },
        {
          name: "Sneha Reddy",
          role: "Vice President",
          image: "/api/placeholder/200/200",
        },
        {
          name: "Rahul Singh",
          role: "Secretary",
          image: "/api/placeholder/200/200",
        },
      ],
    },
    {
      name: "Networking Team",
      theme: "networking",
      color: "from-green-500 to-teal-500",
      members: [
        {
          name: "Kavya Joshi",
          role: "Networking Head",
          image: "/api/placeholder/200/200",
        },
        {
          name: "Rohan Gupta",
          role: "Industry Relations",
          image: "/api/placeholder/200/200",
        },
        {
          name: "Anisha Shah",
          role: "Alumni Coordinator",
          image: "/api/placeholder/200/200",
        },
      ],
    },
    {
      name: "Management",
      theme: "executive",
      color: "from-finance-gold to-yellow-500",
      members: [
        {
          name: "Vikram Agarwal",
          role: "Event Manager",
          image: "/api/placeholder/200/200",
        },
        {
          name: "Isha Bansal",
          role: "Marketing Head",
          image: "/api/placeholder/200/200",
        },
        {
          name: "Karan Malhotra",
          role: "Operations Manager",
          image: "/api/placeholder/200/200",
        },
      ],
    },
  ];

  return (
    <AuthProvider>
      <EventPopupProvider>
        <div className="min-h-screen">
          {/* Main Content */}
          <>
            <ECCStyleNavigation scrolled={scrolled} />
            <NetworkStatusIndicator isOnline={isOnline} />
            <FloatingMarketIcon />

            {/* Hero Section */}
            <MarketDataErrorBoundary>
              <section id="home">
                <ProfessionalHeroSection />
              </section>
            </MarketDataErrorBoundary>

            {/* About TFS Section */}
            <section id="about">
              <AboutSection />
            </section>

            {/* About BAF Section */}
            <section id="about-baf">
              <AboutBAFSection />
            </section>

            {/* Meet the Team Section */}
            <section id="luminaries">
              <ModernLuminariesSection />
            </section>

            {/* Events Section */}
            <section id="events">
              <MobileOptimizedEventsSection />
            </section>

            {/* Flagship Conclave Sessions */}
            <section id="conclave">
              <FlagshipConclaveSection />
            </section>

            {/* Insights Section */}
            <section id="insights">
              <OptimizedFinsightSection />
            </section>

            {/* Sponsors Section */}
            <section id="sponsors">
              <SponsorsSection />
            </section>

            {/* Contact Us Section */}
            <section id="contact">
              <ContactSection />
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 bg-finance-navy border-t border-finance-cyan/20">
              <div className="container mx-auto">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div
                      className="w-12 h-12 flex items-center justify-center rounded-lg border border-finance-cyan/30 relative overflow-hidden"
                      style={{
                        backgroundImage:
                          "url(https://cdn.builder.io/api/v1/image/assets%2F929e4df9940a4d789ccda51924367667%2F738f11e9971c4f0f8ef4fd148b7ae990)",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }}
                    />
                    <div>
                      <h3 className="text-xl font-bold text-finance-cyan finance-heading">
                        The Finance Symposium
                      </h3>
                      <p className="text-sm text-finance-teal/80 professional-text">
                        St. Xavier's College Mumbai
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto professional-text">
                    Illuminating the future of finance through education,
                    innovation, and industry collaboration. Join us in shaping
                    the next generation of financial leaders.
                  </p>

                  <div className="text-finance-cyan/60 text-sm professional-text">
                    © 2024 The Finance Symposium. All rights reserved. |
                    Designed with ❤️ by Dhruv Moghe
                  </div>

                  {/* Admin Access Button */}
                  <div className="mt-6 pt-4 border-t border-finance-cyan/20 flex justify-center">
                    <button
                      onClick={() => setShowLoginPanel(true)}
                      className="px-3 py-1.5 text-xs text-finance-cyan/50 hover:text-finance-cyan/80 rounded border border-finance-cyan/20 hover:border-finance-cyan/50 transition-all duration-200 hover:bg-finance-cyan/5"
                      title="Admin Access"
                    >
                      ⚙️ Admin
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          </>

          {/* Admin Login Panel */}
          <AdminLogin
            isOpen={showLoginPanel}
            onClose={() => setShowLoginPanel(false)}
            onSuccess={() => setShowAdminPanel(true)}
          />

          {/* Admin Events Panel */}
          <AdminEventsPanel
            isOpen={showAdminPanel}
            onClose={() => setShowAdminPanel(false)}
          />
        </div>
      </EventPopupProvider>
    </AuthProvider>
  );
}
