import { NextRequest } from "next/server";
import {
  renderCorporateTemplate,
  renderEngineerTemplate,
  renderCreativeTemplate,
  renderDeveloperTemplate,
} from "@/lib/template-engine";

const DEMO_DATA: Record<string, any> = {
  corporate: {
    templateId: "corporate",
    locale: "en",
    basics: {
      fullName: "Sarah Al-Rashidi",
      title: "Senior Financial Analyst",
      subtitle: "CFA Charterholder | 12 Years in GCC Banking",
      bio: "Results-driven financial analyst with expertise in portfolio management, risk assessment, and strategic investment planning across Kuwait, UAE, and Saudi Arabia. Led analysis teams managing $2B+ in assets.",
      location: "Kuwait City, Kuwait",
      email: "sarah@example.com",
      phone: "+965 9XXX XXXX",
      linkedin: "https://linkedin.com/in/example",
      photoUrl: "",
    },
    metrics: [
      { value: "$2B+", label: "Assets Analyzed" },
      { value: "12", label: "Years Experience" },
      { value: "35%", label: "Portfolio Growth" },
    ],
    experience: [
      {
        title: "Senior Financial Analyst",
        company: "Kuwait National Bank",
        startDate: "2019",
        endDate: "Present",
        description: "Lead analyst for institutional investment portfolio.",
        highlights: ["Grew portfolio value by 35% over 3 years", "Built risk models adopted across 4 departments", "Trained team of 8 junior analysts"],
      },
      {
        title: "Financial Analyst",
        company: "Gulf Investment Corp",
        startDate: "2014",
        endDate: "2019",
        description: "Cross-border investment analysis for GCC markets.",
        highlights: ["Analyzed 200+ investment opportunities", "Published quarterly market outlook reports"],
      },
    ],
    skills: [
      { category: "Financial Analysis", items: ["DCF Modeling", "Risk Assessment", "Portfolio Management", "Derivatives Pricing"] },
      { category: "Tools", items: ["Bloomberg Terminal", "Excel VBA", "Python", "Tableau", "SAP"] },
    ],
    education: [
      { degree: "MBA, Finance", institution: "American University of Kuwait", year: "2014" },
      { degree: "BSc, Accounting", institution: "Kuwait University", year: "2012" },
    ],
    certifications: [
      { name: "CFA Charterholder", issuer: "CFA Institute", year: "2017" },
      { name: "FRM Certified", issuer: "GARP", year: "2015" },
    ],
    endorsements: [
      { quote: "Sarah's analytical rigor is exceptional. She consistently delivers insights that drive real investment decisions.", name: "Dr. Faisal Al-Mutairi", title: "Chief Investment Officer", company: "Kuwait National Bank" },
    ],
    customization: { primaryColor: "#1e3a5f", accentColor: "#c5a55a" },
  },
  engineer: {
    templateId: "engineer",
    locale: "en",
    basics: {
      fullName: "Omar Al-Sabah",
      title: "Mechanical Engineer",
      subtitle: "Oil & Gas | Process Design | 8 Years",
      bio: "Mechanical engineer specializing in downstream process design and plant optimization. Experienced in FEED studies, P&ID development, and commissioning for refineries across the GCC.",
      location: "Ahmadi, Kuwait",
      email: "omar@example.com",
      linkedin: "https://linkedin.com/in/example",
    },
    projects: [
      {
        title: "Clean Fuel Project — KNPC",
        description: "Led mechanical design for the hydrogen recovery unit in Kuwait's $12B clean fuel project.",
        technologies: ["AutoCAD Plant 3D", "CAESAR II", "HTRI"],
        metrics: [{ value: "99.5%", label: "Uptime" }, { value: "$12B", label: "Project Value" }],
        isFeatured: true,
      },
      {
        title: "Gas Compression Station Upgrade",
        description: "Redesigned compressor train to increase throughput by 20% without additional footprint.",
        technologies: ["Aspen HYSYS", "SolidWorks", "Finite Element Analysis"],
        metrics: [{ value: "20%", label: "Throughput Increase" }],
      },
    ],
    skills: [
      { category: "Engineering", items: ["Process Design", "P&ID Development", "Stress Analysis", "FEED Studies"] },
      { category: "Software", items: ["AutoCAD Plant 3D", "CAESAR II", "HTRI", "Aspen HYSYS", "SolidWorks"] },
    ],
    education: [
      { degree: "MSc, Mechanical Engineering", institution: "University of Manchester", year: "2016" },
      { degree: "BSc, Mechanical Engineering", institution: "Kuwait University", year: "2014" },
    ],
    certifications: [
      { name: "Professional Engineer (PE)", issuer: "Kuwait Society of Engineers", year: "2020" },
    ],
    customization: { primaryColor: "#0f172a", accentColor: "#059669" },
  },
  creative: {
    templateId: "creative",
    locale: "en",
    basics: {
      fullName: "Nora Al-Kandari",
      title: "Visual Designer & Art Director",
      subtitle: "Branding | Digital Art | Exhibition Design",
      bio: "Multidisciplinary designer creating visual identities for luxury brands, cultural institutions, and tech startups across the Middle East.",
      location: "Kuwait City",
      email: "nora@example.com",
      instagram: "https://instagram.com/example",
      website: "https://example.com",
    },
    projects: [
      {
        title: "Kuwait Pavilion — Expo 2025",
        description: "Art directed the visual identity and spatial design for Kuwait's national pavilion.",
        technologies: ["Figma", "Cinema 4D", "After Effects"],
        isFeatured: true,
      },
      {
        title: "Sadu House Rebrand",
        description: "Complete visual identity redesign for Kuwait's premier textile heritage museum.",
        technologies: ["Illustrator", "InDesign", "Photography"],
      },
      {
        title: "FinTech Startup Identity",
        description: "Brand system, app UI, and marketing collateral for a Kuwait-based digital banking startup.",
        technologies: ["Figma", "Protopie", "Lottie"],
      },
    ],
    skills: [
      { category: "Design", items: ["Brand Identity", "Art Direction", "Typography", "Motion Graphics"] },
      { category: "Tools", items: ["Figma", "Adobe Creative Suite", "Cinema 4D", "After Effects", "Blender"] },
    ],
    customization: { primaryColor: "#0a0a0a", accentColor: "#ec4899" },
  },
  developer: {
    templateId: "developer",
    locale: "en",
    basics: {
      fullName: "Yusuf Al-Hajri",
      title: "Full-Stack Developer",
      subtitle: "React | Node.js | Cloud Architecture",
      bio: "Building scalable web applications and cloud infrastructure for startups and enterprise clients in Kuwait. Open source contributor and tech community organizer.",
      location: "Hawalli, Kuwait",
      email: "yusuf@example.com",
      github: "https://github.com/example",
      linkedin: "https://linkedin.com/in/example",
    },
    projects: [
      {
        title: "E-Commerce Platform",
        description: "Built a multi-vendor marketplace handling 10K+ daily orders with real-time inventory management.",
        technologies: ["Next.js", "TypeScript", "PostgreSQL", "Redis", "AWS"],
        metrics: [{ value: "10K+", label: "Daily Orders" }, { value: "99.9%", label: "Uptime" }],
        isFeatured: true,
      },
      {
        title: "Government Portal",
        description: "Citizen-facing portal with Arabic/English support, e-payment integration, and document management.",
        technologies: ["React", "Node.js", "MongoDB", "Docker", "Kubernetes"],
      },
    ],
    skills: [
      { category: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "React Native"] },
      { category: "Backend", items: ["Node.js", "Python", "PostgreSQL", "Redis", "GraphQL"] },
      { category: "DevOps", items: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"] },
    ],
    education: [
      { degree: "BSc, Computer Science", institution: "Kuwait University", year: "2018" },
    ],
    customization: { primaryColor: "#0f172a", accentColor: "#3b82f6" },
  },
};

const RENDERERS: Record<string, (data: any) => string> = {
  corporate: renderCorporateTemplate,
  engineer: renderEngineerTemplate,
  creative: renderCreativeTemplate,
  developer: renderDeveloperTemplate,
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params;
  const data = DEMO_DATA[templateId];
  const render = RENDERERS[templateId];

  if (!data || !render) {
    return new Response("Template not found", { status: 404 });
  }

  const html = render(data);

  const banner = `
    <div style="position:fixed;bottom:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,#059669,#047857);color:white;text-align:center;padding:12px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;display:flex;align-items:center;justify-content:center;gap:12px;">
      <span>This is a demo portfolio.</span>
      <a href="/" style="color:white;background:rgba(255,255,255,0.2);padding:6px 16px;border-radius:6px;text-decoration:none;font-weight:600;">Create yours for 4.900 KD &rarr;</a>
    </div>`;

  const htmlWithBanner = html.replace("</body>", `${banner}\n</body>`);

  return new Response(htmlWithBanner, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
