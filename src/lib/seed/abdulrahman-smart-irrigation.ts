/**
 * Canonical demo data for the Engineer template, sourced from Abdulrahman
 * Alkandari's Graduation Project II report (CE477, Fall 2025).
 *
 * This is the validation seed for the project-detail page schema. It
 * exercises every block kind (paragraph, image, imageGrid, specs, standards,
 * challenge) plus the meta byline, links row, and forward-only Next nav.
 *
 * To use:
 *   1. Import `abdulrahmanPortfolio` into a Convex seed mutation, OR
 *   2. Paste the structure into the dashboard's admin form, OR
 *   3. Copy `abdulrahmanProject` into an existing portfolio's `projects[]`.
 *
 * Image URLs are placeholders — replace `/seed/smart-irrigation/*.jpg` with
 * real Convex storage URLs (or other CDN paths) before publishing.
 */

import type { PortfolioData } from "@/lib/template-engine";

/**
 * Just the project entry — drop into any portfolio's `projects[]` array.
 * Set the portfolio's `templateId` to "engineer" to render the detail page.
 */
export const abdulrahmanProject: NonNullable<PortfolioData["projects"]>[number] = {
  // ── Existing schema fields (also used for the inline projects-list card) ──
  title: "Smart Irrigation System",
  description:
    "Vision-based irrigation controller that identifies plant species and waters at species-specific moisture thresholds. Built for Gulf agriculture where water scarcity is acute.",
  technologies: [
    "Raspberry Pi",
    "Arduino UNO",
    "Python",
    "TensorFlow Lite",
    "YOLOv4-tiny",
    "CNN",
    "Soil Moisture Sensor",
    "OpenCV",
  ],
  metrics: [
    { value: "≥90%", label: "Plant detection accuracy" },
    { value: "<3s", label: "Dry-to-pump response" },
    { value: "55 KWD", label: "Total prototype cost" },
    { value: "21%", label: "Below commercial controller (Hunter X2-401)" },
  ],
  isFeatured: true,

  // ── New detail-page fields ──
  slug: "smart-irrigation",
  tagline:
    "A camera, a soil sensor, and a CNN — plants get the right amount of water without human guesswork.",
  coverUrl: "/seed/smart-irrigation/cover.png",

  meta: {
    type: "academic",
    year: "2025",
    courseCode: "CE477",
    institution: "Graduation Project II — B.Sc. Computer Engineering",
    teamSize: 5,
    role: "Hardware & Integration",
    duration: "Fall 2025",
  },

  // ── Narrative blocks (greglagana.com pattern: ordered, kind-tagged) ──
  blocks: [
    {
      kind: "paragraph",
      body:
        "In Kuwait, plants are watered on guesswork or fixed timers. In a region where water is a limited resource, that wastes liters per cycle and damages plants through over- and under-watering. We set out to build an automatic irrigation system that observes the soil, recognizes the plant, and only waters when both conditions agree.",
    },

    {
      kind: "challenge",
      problem:
        "Existing commercial controllers in the Gulf (e.g. Hunter X2-401 at ~70 KWD) handle scheduling but cannot sense soil moisture and cannot recognize what they are watering. They water on a clock, not on a need.",
      solution:
        "A two-microcontroller design: Arduino UNO reads a soil moisture sensor and drives the pump via a relay; a Raspberry Pi runs a CNN over a USB camera and tells the Arduino which species-specific threshold to apply. Pump only fires when species + soil dryness both vote yes.",
    },

    {
      kind: "paragraph",
      body:
        "The CNN is trained on three plant classes — mango, aloe vera, and pepper — each with its own moisture threshold (40%, 60%, 50% respectively). Images go through filtering and augmentation (rotation, scaling, brightness) so the model holds up under varied outdoor lighting. The two devices talk over serial; the Pi handles vision and decisioning, the Arduino handles the low-level sensor read and pump actuation. The whole loop runs continuously, so changes in soil or lighting are picked up in seconds.",
    },

    {
      kind: "image",
      url: "/seed/smart-irrigation/architecture-high-level.png",
      caption: "High-level architecture: sensor-actuator unit (Arduino) and plant-detection unit (Raspberry Pi)",
    },

    {
      kind: "image",
      url: "/seed/smart-irrigation/flowchart.png",
      caption: "Decision flow: train CNN, classify plant, read moisture, compare to per-species threshold, fire pump",
    },

    {
      kind: "image",
      url: "/seed/smart-irrigation/architecture-low-level.png",
      caption: "Component wiring detail — Raspberry Pi + USB camera, soil moisture sensor to Arduino UNO, relay-driven 12V water pump",
    },

    {
      kind: "specs",
      items: [
        { label: "Plant detection accuracy", value: "≥90% (CNN, three classes)" },
        { label: "CNN validation accuracy", value: "≥85% stable across epochs" },
        { label: "Soil moisture sensor precision", value: "±5%" },
        { label: "End-to-end processing", value: "<2s (capture → classify → decide)" },
        { label: "Dry-to-pump response time", value: "<3s" },
        { label: "Communication", value: "Arduino ↔ Raspberry Pi serial (9600 baud)" },
        { label: "Operating mode", value: "Continuous loop, autonomous outdoor operation" },
      ],
    },

    {
      kind: "paragraph",
      body:
        "Three test plants validated the classifier end-to-end. Each was identified correctly under varied lighting; the relay fired only when the soil reading fell below the matched threshold. Pepper's smaller, sharper leaves were the hardest case — early datasets confused them with mango — and a more balanced training set fixed it.",
    },

    {
      kind: "imageGrid",
      images: [
        { url: "/seed/smart-irrigation/test-aloe-vera.jpg", caption: "Aloe Vera — thick pointed leaves, classified correctly under shifted lighting" },
        { url: "/seed/smart-irrigation/test-mango.jpg", caption: "Mango — broad leaves, classified across multiple shade-of-green variations" },
        { url: "/seed/smart-irrigation/test-pepper.jpg", caption: "Pepper — smaller leaves, required dataset rebalancing to disambiguate" },
      ],
    },

    {
      kind: "specs",
      items: [
        { label: "Raspberry Pi", value: "20 KWD — primary processing + camera input" },
        { label: "Arduino UNO", value: "8 KWD — sensor read + relay control" },
        { label: "USB Camera", value: "10 KWD — real-time image capture" },
        { label: "Soil Moisture Sensor", value: "5 KWD — analog moisture readings to Arduino" },
        { label: "Relay Module", value: "6 KWD — switches the water pump" },
        { label: "Water Pump", value: "6 KWD — irrigation actuator" },
        { label: "Total prototype cost", value: "55 KWD (vs Hunter X2-401 at ~70 KWD with fewer features)" },
      ],
    },

    {
      kind: "challenge",
      problem:
        "Sudden moisture readings caused the pump to chatter on and off — sensor noise was creating false decisions.",
      solution:
        "Moving-average filter on the moisture stream plus a short decision delay before the pump fires. Smoothed unstable readings and prevented rapid switching without sacrificing real-time response.",
    },

    {
      kind: "challenge",
      problem:
        "Two parallel processes on the Raspberry Pi (image capture + decision dispatch) occasionally caused a watering command to lag in real-time tests.",
      solution:
        "Rearranged the message order, dropped non-essential background work, and switched some delays to asynchronous timing so the Pi didn't block waiting for prior tasks.",
    },

    {
      kind: "standards",
      items: [
        { label: "IEEE 802.11", value: "Wireless data transport for sensor readings to cloud/dashboard" },
        { label: "IEEE 1451.0", value: "Smart transducer interface — applied to sensor/actuator wiring" },
        { label: "IEC 61131", value: "Programmable controller standard — applied to Arduino + Pi control logic" },
      ],
    },

    {
      kind: "paragraph",
      body:
        "The system delivered on its goal: water only when both plant type and soil moisture agree. Future work — more plant species, weather-proof enclosure, mobile dashboard, cloud-stored history, and longer outdoor field trials — would harden it for real farms. The 55 KWD bill of materials makes it cost-competitive against off-the-shelf controllers that do less.",
    },
  ],

  links: [
    { kind: "report", label: "Final Report PDF", url: "/seed/smart-irrigation/gp2-final-report.pdf" },
    { kind: "repo", label: "Source Code", url: "https://github.com/abdulrahman-alkandari/smart-irrigation" },
  ],
};

/**
 * Full PortfolioData object — drop-in for a complete demo portfolio.
 * Use this with `renderEngineerTemplate(abdulrahmanPortfolio)` to render the
 * full portfolio main page, or with `renderEngineerProjectDetail` against
 * the slug `smart-irrigation` to render the detail page.
 */
export const abdulrahmanPortfolio: PortfolioData = {
  basics: {
    fullName: "Abdulrahman Alkandari",
    title: "Electrical Engineering Student",
    bio: "Motivated Electrical Engineering student with an interest in smart systems, electronics, automation, and practical engineering solutions. Bilingual in Arabic and English, focused on academic development and project-based experience while building a foundation for work in electrical systems, control, and modern technology.",
    valueProposition:
      "I build practical engineering solutions where hardware meets intelligence — sensors, microcontrollers, and machine learning working together to solve real problems for Kuwait and the wider Gulf.",
    location: "Kuwait City, Kuwait",
    nationality: "Kuwaiti National",
    email: "aak22xq8@gmail.com",
    phone: "+965 55502344",
  },

  education: [
    {
      degree: "B.Sc. in Electrical Engineering",
      institution: "Kuwait",
      year: "In Progress",
      description: "Focus areas: smart systems, electronics, automation, power systems.",
    },
  ],

  skills: [
    {
      category: "Engineering",
      items: [
        "Electrical engineering fundamentals",
        "Smart systems and automation",
        "Basic electronics",
        "Problem solving and technical research",
      ],
    },
    {
      category: "Tools",
      items: ["Arduino", "Raspberry Pi", "Microcontroller programming"],
    },
    {
      category: "Soft Skills",
      items: ["Teamwork", "Communication", "Time management"],
    },
  ],

  languages: [
    { name: "Arabic", level: "Native" },
    { name: "English", level: "Good" },
  ],

  projects: [abdulrahmanProject],

  templateId: "engineer",
  locale: "en",
  isRTL: false,
  portfolioUrl: "/p/abdulrahman-alkandari",
};
