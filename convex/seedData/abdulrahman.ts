// Canonical portfolio data for Abdulrahman Alkandari.
// Pure data — imported by both convex/seeds.ts (insert/update) and
// scripts/render-abdulrahman.mts (render). No Convex/Node imports.
//
// Corrected to his real CV: Electrical Engineering @ AUM, real skill groups,
// CODED cybersecurity course, high-school diploma intentionally omitted,
// fabricated project links removed. The Smart Irrigation narrative blocks are
// retained (all referenced images exist under public/seed/smart-irrigation/).

export const ABDULRAHMAN_SLUG = "abdulrahman-alkandari";
export const ABDULRAHMAN_EMAIL = "aak22xq8@gmail.com";
export const ABDULRAHMAN_NAME = "Abdulrahman Alkandari";

export const ABDULRAHMAN_PORTFOLIO = {
  templateId: "engineer",
  name: "Abdulrahman Alkandari — Engineer Portfolio",
  locale: "en" as const,
  slug: ABDULRAHMAN_SLUG,

  basics: {
    fullName: "Abdulrahman Alkandari",
    title: "Electrical Engineering Graduate",
    bio: "Electrical Engineering graduate from the American University of the Middle East with hands-on experience in embedded systems, FPGA development, and microcontroller programming. I build practical engineering solutions where hardware meets intelligence — sensors, microcontrollers, and machine learning working together to solve real problems.",
    valueProposition:
      "I build practical engineering solutions where hardware meets intelligence — sensors, microcontrollers, and machine learning working together to solve real problems for Kuwait and the wider Gulf.",
    summary:
      "Electrical Engineering graduate with practical field-training experience and a strong foundation in electrical systems, programming, embedded technologies, FPGA development, and microcontroller programming. Seeking an entry-level engineering role to apply technical knowledge, enhance professional skills, and contribute to real engineering work.",
    location: "Salam, Kuwait",
    nationality: "Kuwaiti",
    email: "aak22xq8@gmail.com",
    phone: "+965 55502344",
  },

  education: [
    {
      degree: "B.Sc. in Electrical Engineering",
      institution: "American University of the Middle East (AUM), Kuwait",
      year: "Expected 2026",
      description: "Senior Project: Smart Irrigation System.",
    },
  ],

  certifications: [
    {
      name: "Cybersecurity Course",
      issuer: "CODED — Kuwait Free Trade Zone",
      year: "2025",
    },
  ],

  skills: [
    {
      category: "Technical",
      items: [
        "Circuit Analysis",
        "Digital Logic Design",
        "FPGA Development",
        "Microcontroller Programming",
        "Technical Documentation",
        "Data Analysis",
      ],
    },
    {
      category: "Software & Tools",
      items: [
        "MATLAB & Simulink",
        "Intel Quartus Prime",
        "Arduino",
        "Python",
        "Google Colab",
        "Microsoft Office",
      ],
    },
    {
      category: "Professional",
      items: [
        "Communication",
        "Problem Solving",
        "Teamwork & Collaboration",
        "Time Management",
        "Adaptability",
        "Quick Learning",
      ],
    },
  ],

  languages: [
    { name: "Arabic", level: "Native" },
    { name: "English", level: "Intermediate" },
  ],

  projects: [
    {
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
        { value: "21%", label: "Below commercial controller" },
      ],
      isFeatured: true,
      slug: "smart-irrigation",
      tagline:
        "A camera, a soil sensor, and a CNN — plants get the right amount of water without human guesswork.",
      coverUrl: "/seed/smart-irrigation/cover.png",
      meta: {
        type: "academic" as const,
        year: "2025",
        institution: "Graduation Project — B.Sc. Electrical Engineering, AUM",
        role: "Hardware & Integration",
      },
      blocks: [
        {
          kind: "paragraph" as const,
          body: "In Kuwait, plants are watered on guesswork or fixed timers. In a region where water is a limited resource, that wastes liters per cycle and damages plants through over- and under-watering. We set out to build an automatic irrigation system that observes the soil, recognizes the plant, and only waters when both conditions agree.",
        },
        {
          kind: "challenge" as const,
          problem:
            "Existing commercial controllers in the Gulf (e.g. Hunter X2-401 at ~70 KWD) handle scheduling but cannot sense soil moisture and cannot recognize what they are watering. They water on a clock, not on a need.",
          solution:
            "A two-microcontroller design: Arduino UNO reads a soil moisture sensor and drives the pump via a relay; a Raspberry Pi runs a CNN over a USB camera and tells the Arduino which species-specific threshold to apply. Pump only fires when species + soil dryness both vote yes.",
        },
        {
          kind: "paragraph" as const,
          body: "The CNN is trained on three plant classes — mango, aloe vera, and pepper — each with its own moisture threshold (40%, 60%, 50% respectively). Images go through filtering and augmentation (rotation, scaling, brightness) so the model holds up under varied outdoor lighting. The two devices talk over serial; the Pi handles vision and decisioning, the Arduino handles the low-level sensor read and pump actuation. The whole loop runs continuously, so changes in soil or lighting are picked up in seconds.",
        },
        {
          kind: "image" as const,
          url: "/seed/smart-irrigation/architecture-high-level.png",
          caption:
            "High-level architecture: sensor-actuator unit (Arduino) and plant-detection unit (Raspberry Pi)",
        },
        {
          kind: "image" as const,
          url: "/seed/smart-irrigation/flowchart.png",
          caption:
            "Decision flow: train CNN, classify plant, read moisture, compare to per-species threshold, fire pump",
        },
        {
          kind: "image" as const,
          url: "/seed/smart-irrigation/architecture-low-level.png",
          caption:
            "Component wiring detail — Raspberry Pi + USB camera, soil moisture sensor to Arduino UNO, relay-driven 12V water pump",
        },
        {
          kind: "specs" as const,
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
          kind: "paragraph" as const,
          body: "Three test plants validated the classifier end-to-end. Each was identified correctly under varied lighting; the relay fired only when the soil reading fell below the matched threshold. Pepper's smaller, sharper leaves were the hardest case — early datasets confused them with mango — and a more balanced training set fixed it.",
        },
        {
          kind: "imageGrid" as const,
          images: [
            {
              url: "/seed/smart-irrigation/test-aloe-vera.jpg",
              caption: "Aloe Vera — thick pointed leaves, classified correctly under shifted lighting",
            },
            {
              url: "/seed/smart-irrigation/test-mango.jpg",
              caption: "Mango — broad leaves, classified across multiple shade-of-green variations",
            },
            {
              url: "/seed/smart-irrigation/test-pepper.jpg",
              caption: "Pepper — smaller leaves, required dataset rebalancing to disambiguate",
            },
          ],
        },
        {
          kind: "specs" as const,
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
          kind: "challenge" as const,
          problem:
            "Sudden moisture readings caused the pump to chatter on and off — sensor noise was creating false decisions.",
          solution:
            "Moving-average filter on the moisture stream plus a short decision delay before the pump fires. Smoothed unstable readings and prevented rapid switching without sacrificing real-time response.",
        },
        {
          kind: "challenge" as const,
          problem:
            "Two parallel processes on the Raspberry Pi (image capture + decision dispatch) occasionally caused a watering command to lag in real-time tests.",
          solution:
            "Rearranged the message order, dropped non-essential background work, and switched some delays to asynchronous timing so the Pi didn't block waiting for prior tasks.",
        },
        {
          kind: "standards" as const,
          items: [
            { label: "IEEE 802.11", value: "Wireless data transport for sensor readings to cloud/dashboard" },
            { label: "IEEE 1451.0", value: "Smart transducer interface — applied to sensor/actuator wiring" },
            { label: "IEC 61131", value: "Programmable controller standard — applied to Arduino + Pi control logic" },
          ],
        },
        {
          kind: "paragraph" as const,
          body: "The system delivered on its goal: water only when both plant type and soil moisture agree. Future work — more plant species, weather-proof enclosure, mobile dashboard, cloud-stored history, and longer outdoor field trials — would harden it for real farms. The 55 KWD bill of materials makes it cost-competitive against off-the-shelf controllers that do less.",
        },
      ],
    },
  ],
} as const;
