/* ═══════════════════════════════════════════════════════
   CAPCOM — mission operator agent
   Reads the mission registry, parses intent, retrieves
   relevant assets, computes aggregates, and answers with
   cited telemetry. Runs entirely locally.
   ═══════════════════════════════════════════════════════ */

import { missions, profile, type Mission } from "./data";

export type Citation = { desig: string; name: string };
export type AgentAnswer = {
  heading: string;
  body: string[];
  cites: Citation[];
  metrics?: { value: string; label: string }[];
  follow: string[];
};

const STOP = new Set([
  "what", "is", "are", "the", "a", "an", "of", "in", "on", "with", "and", "or", "about",
  "can", "you", "tell", "me", "which", "how", "do", "does", "did", "project", "projects",
  "app", "apps", "system", "systems", "use", "uses", "using", "work", "works", "worked",
  "built", "build", "my", "i", "we", "they", "it", "its", "for", "to", "as", "at", "be",
  "by", "this", "that", "from", "have", "has", "had", "will", "would", "could", "should",
  "more", "most", "biggest", "largest", "best", "many", "much", "than", "then", "into",
  "mission", "asset", "assets", "station", "there", "here",
]);

const SYNONYMS: Record<string, string[]> = {
  compose: ["compose", "jetpack"],
  kotlin: ["kotlin"],
  offline: ["offline", "sync", "outbox", "queue", "workmanager"],
  architecture: ["architecture", "clean", "mvi", "module", "modular"],
  ai: ["ai", "ml", "tflite", "llm", "claude", "model"],
  security: ["security", "secure", "encrypt", "privacy", "keystore"],
  payment: ["payment", "money", "currency", "commerce", "retail", "pos"],
  media: ["video", "media", "player", "streaming", "exoplayer", "music", "audio"],
  analytics: ["analytics", "dashboard", "metrics", "realtime", "stream", "report"],
  game: ["game", "games", "snake", "arcade"],
  career: ["career", "experience", "history", "worked", "job"],
  contact: ["contact", "email", "hire", "reach", "talk", "connect"],
  about: ["about", "who", "moe", "background"],
  impact: ["impact", "users", "reach", "scale", "growth", "million"],
};

function tokenize(q: string): string[] {
  return q.toLowerCase().split(/[^a-z0-9+#.\-]+/).filter(Boolean);
}

function expand(tokens: string[]): Set<string> {
  const out = new Set<string>();
  for (const t of tokens) {
    if (STOP.has(t)) continue;
    out.add(t);
    for (const key of Object.keys(SYNONYMS)) {
      if (SYNONYMS[key].some(s => s === t || s.startsWith(t) || (t.length > 4 && s.includes(t)))) out.add(key);
    }
  }
  return out;
}

function scoreMission(m: Mission, terms: Set<string>): number {
  let s = 0;
  const hay: [string, number][] = [
    [m.name, 4], [m.payloadType, 3], [m.summary, 2], [m.solution, 2],
    [m.impact, 2], [m.problem, 1], [m.role, 1], [m.orbit, 1], [m.status, 1],
  ];
  for (const [text, w] of hay) {
    const lower = text.toLowerCase();
    for (const t of terms) if (lower.includes(t)) s += w;
  }
  for (const st of m.stack) for (const t of terms) if (st.toLowerCase().includes(t)) s += 2.5;
  return s;
}

const cite = (m: Mission): Citation => ({ desig: m.desig, name: m.name });

const FOLLOW = [
  "Brief me on the POS system",
  "What's the total reach?",
  "Explain the architecture",
  "How does offline sync work?",
  "Who is Moe Kyaw Aung?",
  "How do I make contact?",
];

function followFrom(seed: string, n = 2): string[] {
  const pool = [...FOLLOW];
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  for (let i = pool.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

function intentOf(q: string): string {
  const s = q.toLowerCase();
  if (/(contact|email|hire|reach|talk|connect|available|open to)/.test(s)) return "contact";
  if (/(about|who are you|yourself|background|story)/.test(s)) return "about";
  if (/(career|experience|history|worked|job|role|cv|resume)/.test(s)) return "career";
  if (/(skill|stack|tech|technology|expertise)/.test(s)) return "skills";
  if (/(total|sum|how many|all (users|apps|assets))/.test(s)) return "aggregate";
  if (/(biggest|most (users|successful)|largest|top|best)/.test(s)) return "biggest";
  if (/(offline|sync|outbox|queue|workmanager)/.test(s)) return "offline";
  if (/(architecture|clean|module|multi-module)/.test(s)) return "architecture";
  if (/(compose|jetpack)/.test(s)) return "compose";
  if (/(ai|ml|tflite|claude|llm|neural|translator)/.test(s)) return "ai";
  if (/(security|encrypt|privacy|keystore)/.test(s)) return "security";
  if (/(video|media|player|exoplayer|music|audio|hls)/.test(s)) return "media";
  if (/(analytics|dashboard|metrics|realtime|stream)/.test(s)) return "analytics";
  if (/(game|snake|arcade)/.test(s)) return "games";
  if (/(pos|retail|merchant|payment|commerce|money|currency)/.test(s)) return "pos";
  if (/(lens|ocr|camera|vision)/.test(s)) return "lens";
  if (/(impact|users|reach|scale|million)/.test(s)) return "impact";
  return "retrieve";
}

export function ask(question: string): AgentAnswer {
  const q = question.trim();
  if (q.length < 2) {
    return {
      heading: "CAPCOM online",
      body: ["Ground Station MKA-1 standing by. Ask about any asset in the constellation, the architecture, or the telemetry."],
      cites: [],
      follow: FOLLOW.slice(0, 3),
    };
  }

  const it = intentOf(q);
  const terms = expand(tokenize(q));
  const ranked = missions.map(m => ({ m, s: scoreMission(m, terms) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
  const FM = followFrom(q, 3);

  switch (it) {
    case "contact":
      return {
        heading: "Comms frequencies open",
        body: [
          `Direct signal to Moe Kyaw Aung: ${profile.email} — replies within 24 hours. Two voice lines on file: ${profile.phone} and ${profile.secondPhone}.`,
          `He operates between ${profile.location}, currently ${profile.availability.toLowerCase()} for senior Android roles, founding-engineer positions, architecture reviews, and focused MVP work.`,
        ],
        cites: [],
        metrics: [
          { value: "< 24h", label: "response window" },
          { value: "2", label: "voice lines" },
        ],
        follow: FM,
      };

    case "about":
      return {
        heading: "Operator profile — Moe Kyaw Aung",
        body: [
          "Moe is a Senior Android Developer from Tachileik, operating between Myanmar and Thailand. Seven years building the systems behind products used by more than ten million people: retail infrastructure, realtime dashboards, media engines, and on-device AI.",
          "His work sits where product ambition meets hard constraints — intermittent networks, two currencies, 2GB handsets. Philosophy on record: \u201C" + profile.philosophy + "\u201D",
        ],
        cites: [{ desig: "MKA-01", name: "POS Ultimate Pro Max" }, { desig: "MKA-02", name: "Social Dashboard" }, { desig: "MKA-16", name: "LEGEND! Fleet" }],
        follow: FM,
      };

    case "career":
      return {
        heading: "Flight record",
        body: [
          "2019 — First Play Store release (Java/XML). 2021 — Compose migration across three production apps. 2022 — Architecture Lead: Clean Architecture, Hilt, 80+ module split cutting build times 68%. 2023 — Delivery & Performance Lead: GitHub Actions, Fastlane, 620ms cold-start P90. 2024 — Technical Founder of POS Ultimate, 1,200 stores. 2026 — Independent senior work plus MoekyawTranslator.",
        ],
        cites: [{ desig: "MKA-01", name: "POS Ultimate" }, { desig: "MKA-16", name: "LEGEND! Fleet" }],
        follow: FM,
      };

    case "skills": {
      const stacks = new Set<string>();
      missions.forEach(m => m.stack.forEach(s => stacks.add(s)));
      return {
        heading: "Capability matrix",
        body: [
          `Across ${missions.length} orbital assets, the core stack is Kotlin + Jetpack Compose + Clean Architecture/MVI + Hilt, with Room and Firebase for data, Coroutines & Flow for async, GitHub Actions + Fastlane for delivery, and TFLite + Claude API for on-device intelligence. Security work uses Keystore, AES-256, certificate pinning, and OWASP MASVS discipline.`,
          `Seven capability groups on file, spanning ${stacks.size} traceable technologies.`,
        ],
        cites: [{ desig: "MKA-01", name: "POS Ultimate Pro Max" }, { desig: "MKA-03", name: "MoekyawTranslator" }],
        follow: FM,
      };
    }

    case "aggregate": {
      const total = missions.reduce((a, m) => a + m.users, 0);
      return {
        heading: "Total constellation reach",
        body: [
          `Summing ${missions.length} tracked assets gives ${total.toLocaleString()} users/stores/plays — consistent with the stated 10M+ lifetime reach.`,
          "Gravity centers: LEGEND! Fleet (5.2M total users), Social Dashboard (1.2M), Game Collection (2.1M plays).",
        ],
        cites: [{ desig: "MKA-16", name: "LEGEND! Fleet" }, { desig: "MKA-02", name: "Social Dashboard" }],
        metrics: [
          { value: "10M+", label: "lifetime reach" },
          { value: "16", label: "assets tracked" },
        ],
        follow: FM,
      };
    }

    case "biggest": {
      const top = [...missions].sort((a, b) => b.users - a.users).slice(0, 3);
      return {
        heading: "Highest-mass assets",
        body: top.map((m, i) => `${i + 1}. ${m.name} — ${m.impact}`),
        cites: top.map(cite),
        follow: FM,
      };
    }

    case "offline": {
      const rel = missions.filter(m => /offline|outbox|queue|sync/i.test(m.solution + m.problem)).slice(0, 3);
      return {
        heading: "Offline-first doctrine",
        body: [
          "The pattern across the constellation: the local database is the ground truth, the network is a gossip channel that might be late. Writes land in Room first, ride a WorkManager outbox with idempotent replay, and reconcile on acknowledgment.",
          "Most visible in POS Ultimate (sales commit with zero connectivity for days) and the Chat App (sent is not delivered — every message earns a receipt).",
        ],
        cites: rel.map(cite),
        follow: FM,
      };
    }

    case "architecture":
      return {
        heading: "Architecture blueprint",
        body: [
          "Strict dependency direction: the domain layer is pure Kotlin and knows nothing about Android. Feature modules (:feature:*) sit over core modules (:core:data, :core:domain, :core:network), wired by Hilt. Room is the ground truth; the network is a reconciler. Every write is idempotent with a device-generated operation ID.",
          "Result: 80+ modules, ~6-second incremental builds, releases that are boring by design.",
        ],
        cites: [{ desig: "MKA-01", name: "POS Ultimate Pro Max" }, { desig: "MKA-16", name: "LEGEND! Fleet" }],
        metrics: [
          { value: "80+", label: "modules" },
          { value: "6s", label: "incremental build" },
          { value: "68%", label: "faster builds" },
        ],
        follow: FM,
      };

    case "compose": {
      const rel = missions.filter(m => m.stack.some(s => /compose/i.test(s)));
      return {
        heading: "Jetpack Compose across the fleet",
        body: [
          `${rel.length} of ${missions.length} assets ship on Compose — including every flagship. Pattern: MVI reducers over StateFlow, so every screen is a pure function of one immutable state. The Compose migration (2021) moved three production apps from XML with zero regressions.`,
        ],
        cites: rel.slice(0, 4).map(cite),
        follow: FM,
      };
    }

    case "ai": {
      const t = missions.find(m => m.id === "translator")!;
      const l = missions.find(m => m.id === "lens")!;
      return {
        heading: "MoekyawTranslator — regional language AI",
        body: [
          t.solution,
          `The business case only closes when the marginal cost of the edge is zero. ${t.users.toLocaleString()} people joined the waitlist before beta.`,
          `The same on-device philosophy powers ${l.name}: capture, OCR, classify, file — entirely on the phone.`,
        ],
        cites: [cite(t), cite(l)],
        metrics: t.metrics.map(m => ({ value: m.value, label: m.label })),
        follow: FM,
      };
    }

    case "security": {
      const rel = missions.filter(m => /encrypt|security|keystore|privacy/i.test(m.solution + m.problem)).slice(0, 4);
      return {
        heading: "Security posture",
        body: [
          "Keystore-backed AES-256 at rest, certificate pinning in transit, biometric gates, R8 hardening, and OWASP MASVS-aligned review. Money Tracker goes further: zero network permission in the manifest, so there is literally no server to breach.",
        ],
        cites: rel.map(cite),
        follow: FM,
      };
    }

    case "media": {
      const rel = missions.filter(m => /video|music|media|audio/i.test(m.payloadType + m.name)).slice(0, 3);
      return { heading: "Media assets", body: rel.map(m => `${m.name} — ${m.summary}`), cites: rel.map(cite), follow: FM };
    }

    case "analytics": {
      const rel = missions.filter(m => /analytics|dashboard|realtime|telemetry/i.test(m.payloadType + m.name)).slice(0, 3);
      return { heading: "Telemetry assets", body: rel.map(m => `${m.name} — ${m.solution}`), cites: rel.map(cite), follow: FM };
    }

    case "games": {
      const rel = missions.filter(m => /game|arcade/i.test(m.payloadType + m.name)).slice(0, 3);
      return {
        heading: "Games as timing benchmarks",
        body: ["The game work is the harshest timing lab in the portfolio: one dropped frame and the snake stutters. The fixed-timestep engine became the template for the whole Game Collection — 2.1M plays at a locked 60 FPS."],
        cites: rel.map(cite),
        follow: FM,
      };
    }

    case "pos": {
      const p = missions.find(m => m.id === "pos")!;
      return { heading: "MKA-01 POS Ultimate Pro Max", body: [p.solution, p.impact], cites: [cite(p)], metrics: p.metrics.map(m => ({ value: m.value, label: m.label })), follow: FM };
    }

    case "lens": {
      const l = missions.find(m => m.id === "lens")!;
      return { heading: "MKA-05 Lens Lite", body: [l.solution, l.impact], cites: [cite(l)], metrics: l.metrics.map(m => ({ value: m.value, label: m.label })), follow: FM };
    }

    case "impact":
      return {
        heading: "Impact, in numbers",
        body: [
          `The constellation reaches 10M+ people across ${missions.length} assets. Crash-free rate holds at 99.98%. Cold-start P90 was optimized to 620ms.`,
          "But the number Moe quotes most: 1,200 merchant stores running on offline infrastructure — businesses that don't stop when the network does.",
        ],
        cites: [{ desig: "MKA-01", name: "POS Ultimate Pro Max" }, { desig: "MKA-16", name: "LEGEND! Fleet" }],
        metrics: [
          { value: "10M+", label: "users reached" },
          { value: "99.98%", label: "crash-free" },
          { value: "620ms", label: "cold-start P90" },
        ],
        follow: FM,
      };

    default: {
      if (ranked.length === 0) {
        return {
          heading: "No matching telemetry",
          body: ["The registry covers 16 assets (POS, Social Dashboard, MoekyawTranslator, Video Player, Lens Lite, and more), plus architecture, skills, and impact telemetry. Try asking about one of those."],
          cites: [],
          follow: FOLLOW.slice(0, 3),
        };
      }
      const top = ranked.slice(0, 3).map(x => x.m);
      return {
        heading: `Telemetry on \u201C${q}\u201D`,
        body: top.map(m => `${m.name} (${m.desig}) — ${m.summary}`),
        cites: top.map(cite),
        follow: FM,
      };
    }
  }
}

export const SUGGESTED = [
  "Brief me on the POS system",
  "What's the total reach?",
  "Explain the architecture",
  "How does offline sync work?",
  "Tell me about MoekyawTranslator",
  "How do I make contact?",
];
