import { useEffect, useMemo, useState } from "react";

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  email: string;
  linkedin?: string;
  achievements: string[];
  expertise: string[];
  quote: string;
  isLeadership?: boolean;
}

interface LuminariesConfig {
  faculty: TeamMember[];
  leadership: TeamMember[];
  lastModified: number;
}

const defaultConfig: LuminariesConfig = {
  faculty: [
    {
      id: "sanjay-parab",
      name: "Dr. Sanjay Parab",
      title: "Vice Principal and Associate Professor",
      bio: "Dr. Sanjay Parab, Vice Principal and Associate Professor, holds multiple qualifications including M.Com., M.A., M.Phil., Ph.D., LL.M., and FCS, with over 21 years of teaching experience. He has a keen research interest in Corporate Governance, Business Administration, and Corporate Finance, and was a university topper in Company Law during his LLB.",
      image: "/placeholder.svg",
      email: "sanjay.parab@xaviers.edu",
      linkedin: "sanjay-parab",
      achievements: [
        "M.Com., M.A., M.Phil., Ph.D., LL.M., FCS",
        "Over 21 years of teaching experience",
        "University topper in Company Law (LLB)",
        "Vice Principal and Associate Professor",
      ],
      expertise: [
        "Corporate Governance",
        "Business Administration",
        "Corporate Finance",
        "Company Law",
      ],
      quote:
        "Excellence in corporate governance and finance education drives sustainable business growth.",
    },
    {
      id: "pratik-purohit",
      name: "Mr. Pratik Purohit",
      title: "Assistant Professor",
      bio: "Mr. Pratik Purohit, Assistant Professor, holds an M.Com. in Accountancy, PGDFM, and M.Phil., and is currently pursuing a Ph.D. With 6 years of teaching experience, his research interests lie in Accountancy and Finance, Business Policy and Administration, and Management.",
      image: "/placeholder.svg",
      email: "pratik.purohit@xaviers.edu",
      linkedin: "pratik-purohit",
      achievements: [
        "M.Com. in Accountancy, PGDFM, M.Phil.",
        "Currently pursuing Ph.D.",
        "6 years of teaching experience",
        "Assistant Professor",
      ],
      expertise: [
        "Accountancy and Finance",
        "Business Policy and Administration",
        "Management",
      ],
      quote:
        "Integrating theoretical knowledge with practical management approaches creates well-rounded financial professionals.",
    },
    {
      id: "kamalika-ray",
      name: "Ms. Kamalika Ray",
      title: "Assistant Professor",
      bio: "Ms. Kamalika Ray, Assistant Professor, holds an M.Com. in Accountancy, PGDBA (Finance), EPG in Data Analytics, and is a Certified TRP, currently pursuing a Ph.D. With 3 years of teaching experience, her research interests include Accountancy and Finance, ESG, and Personal Finance.",
      image: "/placeholder.svg",
      email: "kamalika.ray@xaviers.edu",
      achievements: [
        "M.Com. in Accountancy, PGDBA (Finance)",
        "EPG in Data Analytics, Certified TRP",
        "Currently pursuing Ph.D.",
        "3 years of teaching experience",
      ],
      expertise: [
        "Accountancy and Finance",
        "ESG",
        "Personal Finance",
        "Data Analytics",
      ],
      quote:
        "Empowering students with data-driven financial insights and sustainable investment practices.",
    },
    {
      id: "vinayak-thool",
      name: "Mr. Vinayak Thool",
      title: "Assistant Professor",
      bio: "Mr. Vinayak Thool, Assistant Professor, holds an M.Com. degree and has 2 years of teaching experience. His research interests include Accountancy, Finance, and Digital Governance.",
      image: "/placeholder.svg",
      email: "vinayak.thool@xaviers.edu",
      achievements: [
        "M.Com. degree",
        "2 years of teaching experience",
        "Assistant Professor",
      ],
      expertise: ["Accountancy", "Finance", "Digital Governance"],
      quote:
        "Digital governance in finance ensures transparency and efficiency in modern financial systems.",
    },
    {
      id: "lloyd-serrao",
      name: "Mr. Lloyd Serrao",
      title: "Assistant Professor",
      bio: "Mr. Lloyd Serrao, Assistant Professor, is a C.S., L.L.B., and Associate Member of ICSI with over five years of experience in corporate filings, FEMA, IBC, and compliances. With 2 years of teaching experience, his research interests include Finance, Corporate and Commercial Laws, and Banking.",
      image: "/placeholder.svg",
      email: "lloyd.serrao@xaviers.edu",
      achievements: [
        "C.S., L.L.B., Associate Member of ICSI",
        "Over 5 years experience in corporate filings",
        "Expert in FEMA, IBC, and compliances",
        "2 years of teaching experience",
      ],
      expertise: [
        "Finance",
        "Corporate and Commercial Laws",
        "Banking",
        "Corporate Compliance",
      ],
      quote:
        "Understanding legal frameworks is essential for sound financial decision-making and corporate compliance.",
    },
  ],
  leadership: [
    {
      id: "aaradhy-mehra",
      name: "Aaradhy Mehra",
      title: "Chairperson – The Finance Symposium (TFS)",
      bio: "Aaradhy Mehra is a driven student-leader and aspiring entrepreneur from the BAF batch of 2026–27 at St. Xavier's College, Mumbai. As Chairperson of The Finance Symposium, he curates strategic initiatives that connect finance, innovation, and enterprise through student-led forums and industry collaborations. He serves as Editor-in-Chief of Currency of Change, leading its editorial vision while mentoring contributors. A former Summer Intern at SBI Securities and a CUET 98%iler, Aaradhy pairs strong analytical thinking with a forward-looking approach to market trends and institutional strategy. His deep interests in technology, automobiles, and design reflect in his digital presence, where he has garnered over 1.5 million views on YouTube and built a professional network of 5,000+ followers on LinkedIn.",
      image: "/placeholder.svg",
      email: "aaradhy.mehra@student.xaviers.edu",
      linkedin: "aaradhy-mehra",
      achievements: [
        "SBI Securities Summer Intern",
        "CUET 98%iler",
        "Editor-in-Chief – Currency of Change",
        "1.5M+ Views Digital Creator",
        "5,000+ LinkedIn Followers",
        "Sub-Head of Design – The Business Conference 2023–24",
      ],
      expertise: [
        "Strategic Leadership",
        "Editorial Management",
        "Digital Content Creation",
        "Financial Analysis",
        "Visual Storytelling",
      ],
      quote:
        "Balancing entrepreneurial curiosity with creative insight, exemplifying next-gen leadership rooted in impact, innovation, and influence.",
      isLeadership: true,
    },
    {
      id: "akarsh-ojha",
      name: "Akarsh Ojha",
      title: "Vice Chairperson – Networking, The Finance Society (TFS) 2025",
      bio: "Akarsh Ojha is currently pursuing a Bachelor's in Accounting and Finance at St. Xavier's College, Mumbai, and serves as the Vice Chairperson – Networking at The Finance Society (TFS) 2025. In this role, he leads strategic outreach, fostering connections with alumni, industry experts, and institutions across India and abroad. A Godha Family Scholar (2023) and Visiting Student at the University of Oxford (Trinity Term 2025) under the Betty and Keating Scholarship, Akarsh blends academic excellence with cross-disciplinary curiosity. He is the author of Nothing but Only You, a nationally acclaimed poetry collection, and a winner of multiple national literary and aptitude competitions, including an All India Rank 1 in a reasoning challenge. Raised in a remote village in Bihar, his journey from limited resources to global platforms reflects resilience, vision, and a deep belief in education as a force for transformation.",
      image: "/placeholder.svg",
      email: "akarsh.ojha@student.xaviers.edu",
      linkedin: "akarsh-ojha",
      achievements: [
        "Godha Family Scholar (2023)",
        "Visiting Student – University of Oxford (Trinity Term 2025)",
        "Betty and Keating Scholarship Recipient",
        "Author of 'Nothing but Only You'",
        "All India Rank 1 – Reasoning Challenge",
        "Multiple National Literary Competition Winner",
      ],
      expertise: [
        "Strategic Networking",
        "Cross-disciplinary Research",
        "Literary Writing",
        "Educational Leadership",
        "International Relations",
      ],
      quote:
        "Education as a force for transformation can bridge any gap between limited resources and global opportunities.",
      isLeadership: true,
    },
    {
      id: "jatin-phulwani",
      name: "Jatin Phulwani",
      title: "Vice Chairperson – Management, The Finance Symposium (TFS)",
      bio: "Jatin Phulwani is the only second-year student in the core trio of The Finance Symposium (TFS), where he serves as Vice Chairperson – Management. He is a two-time elected Course Representative of the BAF batch and a member of the Student Council at St. Xavier's College, Mumbai. Jatin has consistently led from the front, playing a pivotal role in streamlining internal operations, enabling team synergy, and ensuring flawless execution of the committee's flagship initiatives. As Organiser (OG) – Admin for Malhar 2025, one of India's largest student-run college festivals, he contributes with strategic foresight and unmatched precision. Crowned Mr. DPS at his school convocation — the highest honour awarded to a student — Jatin's leadership journey began early. He has earned certifications from IIM Bangalore, Wharton, and BCG, with expertise spanning strategy, consulting, and finance.",
      image: "/placeholder.svg",
      email: "jatin.phulwani@student.xaviers.edu",
      linkedin: "jatin-phulwani",
      achievements: [
        "Mr. DPS – Highest School Honour",
        "Certifications from IIM-B, Wharton & BCG",
        "Organiser (OG) – Admin, Malhar 2025",
        "Two-time elected Course Representative",
        "Student Council Member",
        "National Bronze Medalist – Cycle Polo",
        "NCC 'A' Certificate Holder",
        "State Rank #1 – Spell Bee",
        "Intern – Chtrbox",
      ],
      expertise: [
        "Strategic Management",
        "Operations Excellence",
        "Event Administration",
        "Team Leadership",
        "Marketing Strategy",
        "Process Optimization",
      ],
      quote:
        "Collaborative leadership and deep commitment to impact drives changemaking with an eye on the future.",
      isLeadership: true,
    },
  ],
  lastModified: Date.now(),
};

export function useLuminariesData() {
  const [config, setConfig] = useState<LuminariesConfig>(defaultConfig);
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
      const res = await fetchWithTimeout("/api/luminaries");
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
        `/api/luminaries/sync?lastModified=${localLast}`,
        undefined,
        5000,
      );
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.needsUpdate) {
          await loadFromServer();
        }
      }
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      const fromServer = await loadFromServer();
      if (!fromServer) setConfig(defaultConfig);
      setLoading(false);
    };
    init();

    const id = setInterval(checkSync, 30000);
    return () => clearInterval(id);
  }, []);

  const saveConfig = async (next: LuminariesConfig) => {
    next.lastModified = Date.now();
    setConfig(next);
    try {
      await fetchWithTimeout(
        "/api/luminaries",
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
    } catch {}
    window.dispatchEvent(new CustomEvent("tfs-luminaries-updated"));
  };

  useEffect(() => {
    const onCustom = () => loadFromServer();
    window.addEventListener(
      "tfs-luminaries-updated",
      onCustom as EventListener,
    );
    return () =>
      window.removeEventListener(
        "tfs-luminaries-updated",
        onCustom as EventListener,
      );
  }, []);

  const faculty = useMemo(() => config.faculty, [config.faculty]);
  const leadership = useMemo(() => config.leadership, [config.leadership]);

  const addMember = async (group: "faculty" | "leadership", m: TeamMember) => {
    const member = {
      ...m,
      isLeadership: group === "leadership" ? true : m.isLeadership,
    };
    const next: LuminariesConfig = {
      ...config,
      [group]: [...config[group], member],
    } as LuminariesConfig;
    await saveConfig(next);
  };

  const updateMember = async (
    group: "faculty" | "leadership",
    id: string,
    patch: Partial<TeamMember>,
  ) => {
    const next: LuminariesConfig = {
      ...config,
      [group]: config[group].map((tm) =>
        tm.id === id ? { ...tm, ...patch } : tm,
      ),
    } as LuminariesConfig;
    await saveConfig(next);
  };

  const removeMember = async (group: "faculty" | "leadership", id: string) => {
    const next: LuminariesConfig = {
      ...config,
      [group]: config[group].filter((tm) => tm.id !== id),
    } as LuminariesConfig;
    await saveConfig(next);
  };

  return {
    loading,
    faculty,
    leadership,
    addMember,
    updateMember,
    removeMember,
    rawConfig: config,
  };
}
