// Canonical portfolio data for Wadhah Almutairi.
// Pure data — imported by the CV renderer (scripts/render-wadhah-cv.mts) now,
// and by the portfolio seed/publish path later (developer template, once the
// iframe keyboard rework lands). No Convex/Node imports.
//
// Source: her real 2026 CV (Cybersecurity Professional & Computer Engineer,
// lead security assessor at Kuwait News Agency / KUNA). Per request: EMAIL ONLY
// as public contact — phone and social links intentionally omitted from the
// live portfolio + CV. Nothing fabricated; links she has no public presence for
// are left out.

export const WADHAH_SLUG = "wadhah-almutairi";
export const WADHAH_EMAIL = "w.baazm@gmail.com";
export const WADHAH_NAME = "Wadhah Almutairi";

export const WADHAH_PORTFOLIO = {
  templateId: "developer",
  name: "Wadhah Almutairi — Developer Portfolio",
  locale: "en" as const,
  slug: WADHAH_SLUG,

  // Developer template hero centerpiece (3D / iframe keyboard) is handled
  // separately by the user; accent + copy below drive everything else.
  customization: { accentColor: "#1e3a8a" },

  basics: {
    fullName: "Wadhah Almutairi",
    title: "Cybersecurity Professional & Computer Engineer",
    subtitle: "Lead Security Assessor — Kuwait News Agency (KUNA)",
    valueProposition:
      "I secure the digital footprint of one of the Arab world's largest news agencies — from offensive penetration testing through enterprise hardening to on-premise AI that keeps sensitive data in-house.",
    bio: "Cybersecurity professional and computer engineer leading end-to-end security for Kuwait News Agency (KUNA) — its public website and every internal enterprise system. I pair offensive security depth with enterprise infrastructure administration and AI-driven tooling.",
    summary:
      "Cybersecurity professional and lead security assessor for Kuwait News Agency (KUNA), one of the largest and most prominent news agencies in the Arab world. I own the end-to-end security of its public-facing website and all internal enterprise systems — from scoping and penetration testing through remediation oversight and policy enforcement. I pair deep offensive security expertise with enterprise infrastructure administration, AI-driven security tooling, and a strong track record of delivering results in high-stakes, multi-stakeholder environments.",
    location: "Kuwait City, Kuwait",
    nationality: "Kuwaiti",
    email: "w.baazm@gmail.com",
    // phone / linkedin / github / website intentionally omitted (email-only).
  },

  // Portfolio hero stat strip — honest, verifiable stats (not used by the CV).
  metrics: [
    { value: "KUNA", label: "Lead security assessor" },
    { value: "CEH", label: "Certified Ethical Hacker" },
    { value: "2024", label: "Securing KUNA since" },
  ],

  experience: [
    {
      title: "Cybersecurity Professional",
      company: "Kuwait News Agency (KUNA)",
      startDate: "2024",
      endDate: "",
      description:
        "Lead security assessor for KUNA's entire digital footprint — the main public website (kuna.net.kw) and all internal enterprise systems; responsible for scoping, executing, and reporting on all security assessments organization-wide.",
      highlights: [
        "Designed and executed full authorized penetration tests of KUNA web infrastructure across multiple engagements using Nuclei, Nikto, OWASP ZAP, sqlmap, and custom Python tooling on Kali Linux — producing confirmed findings with actionable remediation reports.",
        "Led a high-stakes three-party security dispute (KUNA / vendor MESC / assessor BroadBITS) across 5 contested findings — built Python verification scripts and evidence-backed technical reports that achieved a favorable resolution for KUNA.",
        "Administered Active Directory, Group Policy, and OU-level access controls; implemented DC delegation without Domain Admin, reducing privileged-account exposure across the organization.",
        "Operated Trend Micro Vision One SIEM/EDR — brute-force pattern analysis, alert triage, and Winlogbeat log correlation across the enterprise endpoint fleet.",
        "Designed a FortiClient EMS device-restriction architecture using AD + MECM enrollment + machine certificates as a triple-factor VPN access gate.",
        "Authored KUNA-IT-SEC-001 Security Guidelines (primary contributor) and the organization's AI Acceptable Use Policy; delivered a NetScaler/WAF knowledge-transfer briefing to technical staff.",
        "Proposed and architected on-premise LLM deployment (Llama 3 / Mistral via Ollama / vLLM) to eliminate third-party AI data-exposure risk, and built automated multi-scanner assessment + AI-assisted threat-analysis tooling.",
      ],
    },
  ],

  education: [
    {
      degree: "B.Sc. in Computer Engineering",
      institution: "American University of the Middle East (AUM), Kuwait",
      year: "2019 – 2024",
      description:
        "Senior Project: AI-Powered multilingual NLP chatbot — designed the pipeline, UI, and datasets and deployed it as a functional system for students.",
    },
  ],

  skills: [
    {
      category: "Offensive Security",
      items: [
        "Penetration Testing",
        "Vulnerability Assessment",
        "OWASP ZAP",
        "Nuclei",
        "Nikto",
        "sqlmap",
        "Kali Linux",
        "Burp Suite",
      ],
    },
    {
      category: "Network & Perimeter",
      items: [
        "FortiClient EMS",
        "FortiGate",
        "NetScaler / WAF",
        "VPN Architecture",
        "Firewall Policy",
        "IPv6",
      ],
    },
    {
      category: "Identity & Access",
      items: [
        "Active Directory",
        "Group Policy (GPO)",
        "WDAC",
        "MECM",
        "Machine Certificates",
        "AD Delegation",
      ],
    },
    {
      category: "SIEM / EDR",
      items: [
        "Trend Micro Vision One",
        "Winlogbeat",
        "Alert Triage",
        "Log Correlation",
        "Threat Analysis",
      ],
    },
    {
      category: "AI & Security",
      items: [
        "LLM Deployment (Ollama / vLLM)",
        "Llama 3 / Mistral",
        "AI-Assisted Threat Analysis",
        "Security Automation",
        "Python",
      ],
    },
    {
      category: "Dev & Tooling",
      items: ["Python", "PowerShell", "Bash / Linux", "Docker", "Custom Scripting"],
    },
    {
      category: "GRC & Reporting",
      items: [
        "Pentest Reporting",
        "Security Policy Authoring",
        "Dispute Documentation",
        "AI Governance",
        "KT Briefings",
      ],
    },
  ],

  projects: [
    {
      title: "Trend Micro Vision One (XDR) Onboarding",
      description:
        "Integrated KUNA assets into a unified XDR platform for end-to-end threat visibility and automated response workflows across endpoint, network, and server telemetry.",
      technologies: ["Trend Micro Vision One", "XDR", "EDR", "Incident Response"],
    },
    {
      title: "Logging Automation with Elastic Stack",
      description:
        "Built Python automation that extracts Elasticsearch logs into structured local databases via Winlogbeat pipelines — turning raw event streams into queryable, audit-ready records.",
      technologies: ["Elasticsearch", "Winlogbeat", "Python", "SIEM"],
    },
    {
      title: "Wake-on-LAN Enterprise Deployment",
      description:
        "Engineered Wake-on-LAN across multi-VLAN environments to enable remote patching and update operations on the enterprise endpoint fleet.",
      technologies: ["Networking", "Multi-VLAN", "Endpoint Management"],
    },
    {
      title: "Security Reporting & Vulnerability Automation",
      description:
        "Built structured CEH-style penetration-test reports and automated repetitive documentation tasks, accelerating turnaround from finding to actionable remediation.",
      technologies: ["Python", "Pentest Reporting", "Automation"],
    },
    {
      title: "AI-Powered Chatbot — University Senior Project",
      description:
        "Built a multilingual NLP chatbot end-to-end: designed the data pipeline, UI, and datasets, and deployed it as a functional system for students.",
      technologies: ["NLP", "Machine Learning", "Python"],
    },
  ],

  certifications: [
    { name: "Certified Ethical Hacker (CEH)", issuer: "EC-Council", year: "" },
    { name: "Data Science Course", issuer: "CODED Academy", year: "" },
    { name: "Web Development Bootcamp", issuer: "CODED Academy", year: "" },
  ],

  languages: [
    { name: "Arabic", level: "Native" },
    { name: "English", level: "Professional" },
  ],
} as const;
