import { useEffect, useMemo, useRef, useState } from "react";
import { TypeAnimation } from "react-type-animation";
import {
  FiCopy, FiCheck, FiMail,
  FiGithub, FiX, FiExternalLink,
  FiZap, FiClock,
  FiSearch, FiTerminal, FiLayers, FiCode, FiMaximize2,
  FiGlobe, FiVolume2, FiVolumeX, FiActivity, FiPlay
} from "react-icons/fi";
import {
  profile, missions, skills, experience, achievements, socials,
  emails, githubAccounts, verifiedCertificates, lovableWebApps, mediaShowcase,
} from "./data";
import { CodeRain, Magnetic } from "./components/kinetic";
import { Assistant } from "./components/Assistant";

/* ═══════════════════════════════════════════════════════
   AUDIO SYNTHESIZER — WEB AUDIO API
   ═══════════════════════════════════════════════════════ */
function playCyberSfx(type: "click" | "blip" | "laser" | "teleport" | "copy") {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now); osc.stop(now + 0.05);
    } else if (type === "blip") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(1760, now + 0.06);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now); osc.stop(now + 0.12);
    } else if (type === "laser") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now); osc.stop(now + 0.18);
    } else if (type === "teleport") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(1480, now + 0.28);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === "copy") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now); osc.stop(now + 0.25);
    }
    osc.connect(gain); gain.connect(ctx.destination);
  } catch {
    // audio context before user gesture
  }
}

/* ═══════════════════════════════════════════════════════
   3D TILT CARD WRAPPER WITH SOFT DEPTH
   ═══════════════════════════════════════════════════════ */
function Tilt3DCard({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((centerY - y) / centerY) * 9;
    const rotateY = ((x - centerX) / centerX) * 9;
    setRotate({ x: parseFloat(rotateX.toFixed(2)), y: parseFloat(rotateY.toFixed(2)) });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`float-card-3d relative cursor-pointer ${className}`}
      style={{
        transform: isHovered 
          ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(-8px)` 
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)",
      }}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   INTERACTIVE GLASS TERMINAL CLI (mka-sh)
   ═══════════════════════════════════════════════════════ */
function TerminalCLI({ onSelectApp, onSound }: { onSelectApp: (id: string) => void; onSound: () => void }) {
  const [history, setHistory] = useState<Array<{ cmd?: string; res: string | React.ReactNode }>>([
    { res: "MKA-SH // KERNEL v2026.4 [CYBER-SYSTEM READY]" },
    { res: 'Type "help" for a list of commands, or "apps" to inspect the production fleet.' }
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const executeCommand = (cmdText?: string) => {
    const raw = (cmdText ?? input).trim();
    if (!raw) return;
    onSound();
    setInput("");

    const parts = raw.split(" ");
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ").toLowerCase();

    let output: string | React.ReactNode = "";

    switch (cmd) {
      case "help":
        output = (
          <div className="space-y-1 font-mono-code text-xs text-sky-300">
            <p className="text-cyan-300 font-bold">AVAILABLE COMMANDS:</p>
            <p>• <b className="text-white">whoami</b> — display architect identification & mission profile</p>
            <p>• <b className="text-white">apps</b> — list all 16 production applications with stats</p>
            <p>• <b className="text-white">arch</b> — display Clean Architecture & multi-module blueprint</p>
            <p>• <b className="text-white">skills</b> — display technical capability matrix</p>
            <p>• <b className="text-white">certs</b> — show verified 82+ Programming Hub credentials</p>
            <p>• <b className="text-white">cat [app_name]</b> — inspect spec for: pos, social, translator, video, lens, etc.</p>
            <p>• <b className="text-white">contact</b> — direct lines, emails, and verified links</p>
            <p>• <b className="text-white">clear</b> — clear the console output</p>
            <p>• <b className="text-white">sudo hire</b> — initiate direct recruiter engagement protocol</p>
          </div>
        );
        break;

      case "whoami":
        output = `Moe Kyaw Aung (မိုးကျော်အောင်) // Senior Android Developer & Full-Stack Architect.\nBase: Tachileik, Myanmar 🇲🇲 ↔ Bangkok, Thailand 🇹🇭.\nPhilosophy: "Code with culture. Build with purpose."\nMetrics: 10M+ users reached, 99.98% crash-free sessions, 1,200 live retail stores.`;
        break;

      case "apps":
        output = (
          <div className="space-y-1 font-mono-code text-xs">
            <p className="text-cyan-300 font-bold">16 PRODUCTION ROMS TRACKED:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-300">
              {missions.map(m => (
                <div key={m.id} className="flex justify-between">
                  <span className="text-cyan-400">{m.desig}</span>
                  <span className="text-white">{m.name}</span>
                  <span className="text-pink-400">{m.metrics[0]?.value}</span>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-[10px] mt-1">Tip: Type "cat pos" or "cat social" to inspect deep architecture.</p>
          </div>
        );
        break;

      case "arch":
        output = (
          <div className="space-y-1 font-mono-code text-xs text-sky-200">
            <p className="text-cyan-300 font-bold">CLEAN ARCHITECTURE / MULTI-MODULE BLUEPRINT:</p>
            <p>• <b className="text-white">Presentation Layer:</b> 100% Jetpack Compose · MVI Unidirectional StateFlow · Zero recomposition leaks</p>
            <p>• <b className="text-white">Domain Layer:</b> Pure Kotlin UseCases · Zero Android framework dependencies · Sub-second JVM tests</p>
            <p>• <b className="text-white">Data Layer:</b> Offline-first Room DB (Ground Truth) · Retrofit HTTP + OkHttp · Firebase Suite</p>
            <p>• <b className="text-white">Scalability:</b> 80+ Gradle modules · Version catalogs · 6-second incremental compile</p>
            <p>• <b className="text-white">Security:</b> Android Keystore AES-256 GCM · Certificate Pinning · TLS 1.3 · BiometricPrompt</p>
          </div>
        );
        break;

      case "skills":
        output = (
          <div className="space-y-1 font-mono-code text-xs">
            <p className="text-cyan-300 font-bold">TECHNICAL CAPABILITY MATRIX:</p>
            {skills.map(s => (
              <p key={s.code}>
                <span className="text-pink-400 font-bold">{s.code} [{s.group}]:</span>{" "}
                <span className="text-gray-300">{s.items.join(" · ")}</span>
              </p>
            ))}
          </div>
        );
        break;

      case "certs":
        output = `Verified 82+ Credentials from Programming Hub across 9 engineering domains: Programming, Mobile & App Dev, Web Dev, Databases, AI/ML, Security, Blockchain, Software Engineering, Business. Plus Google Developers Launchpad alumnus.`;
        break;

      case "cat":
        if (!arg) {
          output = `Usage: cat [app_name]. Examples: cat pos, cat social, cat translator, cat video, cat lens`;
        } else {
          const found = missions.find(m => m.id.toLowerCase() === arg || m.name.toLowerCase().includes(arg) || m.desig.toLowerCase() === arg);
          if (found) {
            onSelectApp(found.id);
            output = `Dispatched spec for ${found.name} [${found.desig}]. Modal open.`;
          } else {
            output = `Asset not found for "${arg}". Type "apps" for valid designations.`;
          }
        }
        break;

      case "contact":
        output = (
          <div className="space-y-1 font-mono-code text-xs">
            <p className="text-cyan-300 font-bold">COMMUNICATION FREQUENCIES:</p>
            <p>• Primary Inbox: <b className="text-white">{profile.email}</b></p>
            <p>• Direct Hotline: <b className="text-white">{profile.phone}</b></p>
            <p>• Secondary Hotline: <b className="text-white">{profile.secondPhone}</b></p>
            <p>• GitHub: <b className="text-white">{profile.github}</b></p>
            <p>• LinkedIn: <b className="text-white">{profile.linkedin}</b></p>
          </div>
        );
        break;

      case "clear":
        setHistory([]);
        return;

      case "sudo":
        if (arg === "hire" || arg.includes("hire")) {
          output = (
            <div className="space-y-1 text-emerald-400 font-bold font-mono-code text-xs animate-pulse">
              <p>PERMISSION GRANTED. CHIEF ENGINEER MOE KYAW AUNG HAS BEEN NOTIFIED.</p>
              <p>Routing to dispatch mail client now...</p>
              <a href={`mailto:${profile.email}`} className="text-cyan-300 underline block mt-1">Click here to send direct hiring inquiry →</a>
            </div>
          );
        } else {
          output = `sudo: ${arg}: command acknowledged with root privilege.`;
        }
        break;

      default:
        output = `Command not recognized: "${cmd}". Type "help" for a list of commands.`;
    }

    setHistory(prev => [...prev, { cmd: raw, res: output }]);
  };

  return (
    <div className="glass-terminal my-8">
      <div className="glass-terminal-bar">
        <div className="terminal-dots">
          <span className="terminal-dot-red" />
          <span className="terminal-dot-amber" />
          <span className="terminal-dot-cyan" />
          <span className="text-xs font-mono-code text-gray-400 ml-2">mka-sh // terminal console</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono-code text-cyan-400">STATUS: INTERACTIVE</span>
        </div>
      </div>

      <div className="p-4 bg-[#030612]/95 min-h-[220px] max-h-[360px] overflow-y-auto space-y-2 font-mono-code text-xs">
        {history.map((h, i) => (
          <div key={i} className="space-y-0.5">
            {h.cmd && (
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="text-pink-500 font-bold">mka@neon-deck:~$</span>
                <span className="text-white">{h.cmd}</span>
              </div>
            )}
            <div className="text-gray-300 leading-relaxed">{h.res}</div>
          </div>
        ))}

        <form onSubmit={(e) => { e.preventDefault(); executeCommand(); }} className="flex items-center gap-1.5 pt-1">
          <span className="text-pink-500 font-bold shrink-0">mka@neon-deck:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="type 'help', 'apps', 'arch', 'whoami'..."
            className="flex-1 bg-transparent text-cyan-300 focus:outline-none font-mono-code text-xs"
          />
        </form>
      </div>

      {/* Quick Clickable Command Pills */}
      <div className="p-2.5 bg-[#060c1e] border-t border-cyan-500/20 flex flex-wrap gap-1.5 font-mono-code text-[10px]">
        {["help", "whoami", "apps", "arch", "skills", "certs", "cat pos", "sudo hire"].map(c => (
          <button
            key={c}
            onClick={() => executeCommand(c)}
            className="px-2.5 py-1 rounded bg-[#0b1633] text-gray-300 hover:text-cyan-300 hover:border-cyan-400 border border-slate-700 transition-colors"
          >
            ${c}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CODE SNIPPETS TERMINAL COMPONENT
   ═══════════════════════════════════════════════════════ */
function CodeSnippetShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const snippets = [
    {
      title: "CleanArchitecture.kt",
      badge: "DOMAIN USE CASE",
      code: `// Domain Layer: Pure Kotlin UseCase with Zero Android Framework Imports
package com.moekyawaung.domain.usecase

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class SyncMerchantLedgerUseCase @Inject constructor(
    private val localRepository: TransactionRepository,
    private val remoteCloudGateway: CloudReconciliationGateway,
    private val cryptoSigner: SecurityKeySigner
) {
    operator fun invoke(storeId: String): Flow<SyncResult> = flow {
        emit(SyncResult.Processing)
        
        // 1. Fetch pending offline writes from local Room database
        val pendingSales = localRepository.getPendingSales(storeId)
        if (pendingSales.isEmpty()) {
            emit(SyncResult.Complete(reconciledCount = 0))
            return@flow
        }
        
        // 2. Cryptographically sign payload with Android Keystore key
        val signedPayload = cryptoSigner.signBatch(pendingSales)
        
        // 3. Atomically transmit batch with server idempotency key
        val response = remoteCloudGateway.reconcileBatch(signedPayload)
        
        // 4. Update local Room DB status as acknowledged
        localRepository.markAsSynchronized(response.acknowledgedIds)
        emit(SyncResult.Complete(reconciledCount = response.acknowledgedIds.size))
    }
}`
    },
    {
      title: "MviStateReducer.kt",
      badge: "JETPACK COMPOSE",
      code: `// Presentation: MVI Unidirectional State Flow Reducer
package com.moekyawaung.presentation.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.*
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class SocialDashboardViewModel @Inject constructor(
    private val observeLiveFeedUseCase: ObserveLiveFeedUseCase,
    private val dispatchMetricActionUseCase: DispatchActionUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<DashboardUiState>(DashboardUiState.Loading)
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        observeLiveFeedUseCase()
            .onEach { telemetry ->
                _uiState.update { 
                    DashboardUiState.Success(
                        telemetryData = telemetry,
                        lastReconciled = System.currentTimeMillis()
                    )
                }
            }
            .catch { error -> _uiState.update { DashboardUiState.Error(error.message) } }
            .launchIn(viewModelScope)
    }

    fun onIntent(intent: DashboardIntent) {
        when (intent) {
            is DashboardIntent.RefreshStream -> refreshFeed()
            is DashboardIntent.FilterChannel -> applyChannelFilter(intent.channelId)
            is DashboardIntent.ExportReport -> exportAuditData()
        }
    }
}`
    },
    {
      title: "HiltDependencyInjection.kt",
      badge: "DAGGER / HILT",
      code: `// Multi-Module Component Wiring with Scoped Bindings
package com.moekyawaung.core.di

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.CertificatePinner
import okhttp3.OkHttpClient
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkSecurityModule {

    @Provides
    @Singleton
    fun provideCertificatePinner(): CertificatePinner = CertificatePinner.Builder()
        .add("api.moekyawaung.com", "sha256/k2oTQLjUVjhTQgoXqMWG8q50V0UECQEK2GxPEdaGWE=")
        .add("*.cloud.firebase.com", "sha256/WoiWRyIOVNa9ihaBciRSC7XHjliYS9VwUGOIud4PB18=")
        .build()

    @Provides
    @Singleton
    fun provideHardenedOkHttpClient(pinner: CertificatePinner): OkHttpClient =
        OkHttpClient.Builder()
            .certificatePinner(pinner)
            .followRedirects(false)
            .build()
}`
    },
    {
      title: "OfflineFirstSync.kt",
      badge: "ROOM + WORKMANAGER",
      code: `// Offline-First Synchronization Engine with Room as Single Source of Truth
package com.moekyawaung.data.sync

import androidx.work.*
import java.util.concurrent.TimeUnit
import javax.inject.Inject

class OfflineSyncManager @Inject constructor(
    private val workManager: WorkManager
) {
    fun schedulePeriodicReconciliation() {
        val networkConstraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .setRequiresBatteryNotLow(true)
            .build()

        val periodicSyncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
            repeatInterval = 15,
            repeatIntervalTimeUnit = TimeUnit.MINUTES
        )
        .setConstraints(networkConstraints)
        .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
        .build()

        workManager.enqueueUniquePeriodicWork(
            "mka_offline_sync",
            ExistingPeriodicWorkPolicy.KEEP,
            periodicSyncRequest
        )
    }
}`
    }
  ];

  const current = snippets[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    playCyberSfx("copy");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-terminal my-8">
      {/* Tab Header Bar */}
      <div className="glass-terminal-bar flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {snippets.map((s, idx) => (
            <button
              key={s.title}
              onClick={() => {
                playCyberSfx("click");
                setActiveTab(idx);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition-all flex items-center gap-2 ${
                activeTab === idx
                  ? "bg-[#00f0ff] text-[#040711] font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  : "bg-[#0b1633] text-gray-400 hover:text-white"
              }`}
            >
              <FiCode className="text-xs" />
              <span>{s.title}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/40">
            {current.badge}
          </span>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 rounded bg-[#0b1633] hover:bg-[#00f0ff]/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono-code flex items-center gap-1.5"
          >
            {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
            <span>{copied ? "COPIED" : "COPY"}</span>
          </button>
        </div>
      </div>

      {/* Code Display */}
      <div className="p-4 bg-[#02050e] overflow-x-auto">
        <pre className="font-mono-code text-xs text-sky-200 leading-relaxed">
          <code>{current.code}</code>
        </pre>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PORTFOLIO APPLICATION
   ═══════════════════════════════════════════════════════ */
export default function App() {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState("hero");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [certSearch, setCertSearch] = useState("");
  const [certCategory, setCertCategory] = useState("All Sectors");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [soundMuted, setSoundMuted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Time Telemetry
  const [clockTime, setClockTime] = useState("");
  useEffect(() => {
    const update = () => setClockTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll Spy & Progress
  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const progress = doc.scrollTop / Math.max(1, doc.scrollHeight - doc.clientHeight);
      setScrollProgress(progress);

      const sections = ["hero", "terminal", "projects", "architecture", "skills", "experience", "founder", "certs", "contact"];
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.top <= 120 && r.bottom >= 120) {
            setActiveNav(s);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const triggerSound = (type: "click" | "blip" | "laser" | "teleport" | "copy" = "click") => {
    if (!soundMuted) playCyberSfx(type);
  };

  const scrollTo = (id: string) => {
    triggerSound("click");
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerSound("copy");
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2400);
  };

  // Selected Modal Project
  const activeProject = useMemo(() => {
    return missions.find(m => m.id === selectedAppId);
  }, [selectedAppId]);

  // Categories for 16-app grid filter
  const categories = ["ALL", "MOBILE", "ENTERPRISE", "FINTECH", "MEDIA", "COMMERCE", "ARCADE"];
  const filteredApps = useMemo(() => {
    if (categoryFilter === "ALL") return missions;
    return missions.filter(m => {
      const cat = m.payloadType.toUpperCase();
      if (categoryFilter === "MOBILE") return cat.includes("MODULE") || cat.includes("TELEMETRY") || cat.includes("P2P");
      if (categoryFilter === "ENTERPRISE") return cat.includes("COMMAND") || cat.includes("TELEMETRY HUB") || cat.includes("RELAY");
      if (categoryFilter === "FINTECH") return cat.includes("MARKET") || cat.includes("LEDGER");
      if (categoryFilter === "MEDIA") return cat.includes("DSP") || cat.includes("IMAGING");
      if (categoryFilter === "COMMERCE") return cat.includes("COMMERCE") || cat.includes("MERCHANT");
      if (categoryFilter === "ARCADE") return cat.includes("RECREATION") || cat.includes("TOURNAMENT");
      return true;
    });
  }, [categoryFilter]);

  // Certifications filter
  const certSectors = ["All Sectors", ...achievements.certifications.groups.map(g => g.name)];
  const filteredCerts = useMemo(() => {
    return verifiedCertificates.filter(c => {
      const matchCat = certCategory === "All Sectors" || c.cat === certCategory;
      const matchSearch = c.name.toLowerCase().includes(certSearch.toLowerCase()) || c.id.includes(certSearch);
      return matchCat && matchSearch;
    });
  }, [certCategory, certSearch]);

  return (
    <div className="min-h-screen bg-[#040711] text-[#e2f1ff] relative overflow-x-hidden cyber-grid-ambient">
      {/* Background Code Rain Layer */}
      <CodeRain opacity={0.38} />

      {/* Perspective Neon Grid Floor & Horizon Flare */}
      <div className="neon-grid-floor" aria-hidden />
      <div className="neon-grid-horizon" aria-hidden />

      {/* Cyber Laser Scanner */}
      <div className="cyber-scan-laser" aria-hidden />

      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-[#00f0ff] via-[#a855f7] to-[#ff2d95] z-[100] transition-all duration-150"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      {/* Floating AI Assistant Copilot */}
      <Assistant />

      {/* ═══════════════════════════════════════════════════════
          NAVBAR: CYBER DECK HEADER
          ═══════════════════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#040711]/90 backdrop-blur-xl border-b border-cyan-500/25 px-4 py-3 shadow-[0_4px_30px_rgba(0,240,255,0.15)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollTo("hero")}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-pink-500 p-0.5 shadow-[0_0_15px_#00f0ff] group-hover:shadow-[0_0_25px_#00f0ff] transition-all">
              <div className="w-full h-full bg-[#040711] rounded-[7px] flex items-center justify-center font-orbitron font-black text-xs text-cyan-300">
                MKA
              </div>
            </div>
            <div>
              <div className="font-orbitron font-black text-xs text-white tracking-wider flex items-center gap-1.5">
                <span>MOE KYAW AUNG</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400 font-mono-code">
                  NEON-GRID
                </span>
              </div>
              <p className="text-[10px] text-pink-400 font-mono-code tracking-tight">
                SENIOR ANDROID & FULL-STACK ARCHITECT
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 font-chakra font-semibold text-xs tracking-wider">
            {[
              { id: "hero", label: "DECK" },
              { id: "terminal", label: "CLI TERMINAL" },
              { id: "projects", label: "16 APPS" },
              { id: "architecture", label: "ARCHITECTURE" },
              { id: "skills", label: "SKILL MATRIX" },
              { id: "founder", label: "FOUNDER" },
              { id: "certs", label: "82+ CERTS" },
              { id: "contact", label: "COMMS" }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  activeNav === item.id
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                    : "border-transparent text-gray-300 hover:text-cyan-300 hover:bg-cyan-500/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Audio & Status Badges */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-mono-code text-cyan-300 px-2.5 py-1 rounded bg-[#0b1633] border border-cyan-500/30">
              <FiClock className="text-xs text-pink-400" />
              <span>{clockTime}</span>
            </span>

            <button
              onClick={() => {
                setSoundMuted(!soundMuted);
                if (soundMuted) playCyberSfx("blip");
              }}
              className={`p-2 rounded-lg border transition-all ${
                !soundMuted
                  ? "border-cyan-400 text-cyan-300 bg-cyan-500/10 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                  : "border-slate-800 text-gray-500"
              }`}
              title="Toggle Audio Feedback"
            >
              {!soundMuted ? <FiVolume2 /> : <FiVolumeX />}
            </button>

            <button
              onClick={() => scrollTo("contact")}
              className="btn-neon-blue px-4 py-1.5 text-xs font-orbitron font-bold hidden sm:inline-flex"
            >
              HIRE ARCHITECT
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-cyan-400 border border-cyan-500/40 rounded-lg"
            >
              {mobileMenuOpen ? <FiX /> : <FiTerminal />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#070d1e] border-t border-cyan-500/30 p-4 mt-3 grid grid-cols-2 gap-2 font-chakra text-xs">
            {[
              { id: "hero", label: "DECK" },
              { id: "terminal", label: "CLI TERMINAL" },
              { id: "projects", label: "16 PRODUCTION APPS" },
              { id: "architecture", label: "ARCHITECTURE & CODE" },
              { id: "skills", label: "SKILL MATRIX" },
              { id: "founder", label: "STARTUP LAB" },
              { id: "certs", label: "82+ CERTIFICATES" },
              { id: "contact", label: "DIRECT COMMS" }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="p-2.5 rounded bg-[#0b1633] text-left text-cyan-300 border border-slate-700"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════
          HERO SECTION: 3D PARALLAX & NEON-GRID COCKPIT
          ═══════════════════════════════════════════════════════ */}
      <section id="hero" className="relative min-h-screen pt-32 pb-24 px-4 flex flex-col justify-center z-10">
        <div className="max-w-6xl mx-auto w-full">
          {/* Top Status Capsule */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b1633]/80 border border-cyan-400 text-xs font-mono-code shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-cyan-300 font-bold">STATUS: AVAILABLE FOR SENIOR & FOUNDING ROLES</span>
            </div>

            <div className="text-xs font-mono-code text-pink-400">
              LOCATION: Tachileik, Myanmar 🇲🇲 ↔ Bangkok, Thailand 🇹🇭
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Copy Column */}
            <div className="lg:col-span-7 space-y-6">
              <p className="text-pink-400 font-mono-code text-xs tracking-widest font-bold">
                {profile.nameMM} // မိုးကျော်အောင် · KOTLIN & JETPACK COMPOSE ARCHITECT
              </p>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-orbitron font-black text-white leading-tight">
                <span>NEON-GRID</span><br />
                <span className="glow-blue text-cyan-300">ENTERPRISE</span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-400 to-purple-400">
                  DEVELOPER
                </span>
              </h1>

              <div className="h-8 text-base sm:text-lg font-mono-code text-cyan-300 font-bold flex items-center gap-2">
                <span className="text-pink-500 font-bold">&gt;&gt;</span>
                <TypeAnimation
                  sequence={[
                    '"THIS ENGINEER BUILDS APPS USED BY MILLIONS."',
                    2500,
                    'KOTLIN 2.0 · JETPACK COMPOSE · CLEAN ARCHITECTURE.',
                    2500,
                    '80+ MULTI-MODULE BUILDS · SUB-SECOND COMPILE.',
                    2500,
                    'TECHNICAL FOUNDER · 1M+ LIFETIME USERS ACROSS SE ASIA.',
                    2500,
                  ]}
                  speed={55}
                  repeat={Infinity}
                />
              </div>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-rajdhani max-w-xl">
                Senior Mobile Architect with 7+ years designing high-throughput, offline-first Android systems. From 1,200 retail stores running mission-critical POS terminals across Myanmar and Thailand to sub-second reactive analytics, I build architectures that thrive under pressure.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Magnetic>
                  <button
                    onClick={() => scrollTo("projects")}
                    className="btn-neon-blue cursor-pointer"
                  >
                    <FiLayers />
                    <span>EXPLORE 16 3D APPS</span>
                  </button>
                </Magnetic>

                <Magnetic>
                  <button
                    onClick={() => scrollTo("terminal")}
                    className="btn-neon-pink cursor-pointer"
                  >
                    <FiTerminal />
                    <span>LAUNCH CLI TERMINAL</span>
                  </button>
                </Magnetic>

                <a
                  href="https://github.com/Dev-moe-kyawaung/pulsesync-android"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-glass-subtle"
                >
                  <FiZap className="text-yellow-400" />
                  <span>FLAGSHIP: PULSESYNC</span>
                </a>
              </div>
            </div>

            {/* Right 3D Floating Hologram Avatar Card */}
            <div className="lg:col-span-5 flex justify-center">
              <Tilt3DCard className="w-full max-w-[380px] p-4 float-panel-deep">
                {/* Neon Header Header */}
                <div className="flex items-center justify-between text-xs font-mono-code mb-3 pb-2 border-b border-cyan-500/25">
                  <span className="text-cyan-400 font-bold">PROFILE_RIG.OBJ</span>
                  <span className="text-pink-400 font-bold">100% VERIFIED</span>
                </div>

                {/* Profile Image with Holographic Glow */}
                <div className="relative rounded-xl overflow-hidden aspect-[4/4.8] border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                  <img
                    src="https://res.cloudinary.com/dye5qpwii/image/upload/v1778527878/IMG_20260430_053105_uef0yr.png"
                    alt="Moe Kyaw Aung - Senior Android Developer"
                    className="w-full h-full object-cover filter contrast-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040711] via-transparent to-transparent opacity-80" />

                  {/* Corner Target Marks */}
                  <div className="absolute top-2 left-2 text-cyan-400 text-xs font-mono-code font-bold">┌</div>
                  <div className="absolute top-2 right-2 text-cyan-400 text-xs font-mono-code font-bold">┐</div>
                  <div className="absolute bottom-2 left-2 text-cyan-400 text-xs font-mono-code font-bold">└</div>
                  <div className="absolute bottom-2 right-2 text-cyan-400 text-xs font-mono-code font-bold">┘</div>

                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <p className="font-orbitron font-extrabold text-sm text-white">Moe Kyaw Aung</p>
                    <p className="text-[11px] font-mono-code text-cyan-300">Tachileik 🇲🇲 ↔ Bangkok 🇹🇭</p>
                  </div>
                </div>

                {/* Micro Stat Badges */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-center font-mono-code text-xs">
                  <div className="p-2 rounded-lg bg-[#040711] border border-cyan-500/30">
                    <span className="text-[10px] text-gray-400 block">REACH</span>
                    <span className="font-orbitron font-bold text-cyan-300">10M+ USERS</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#040711] border border-pink-500/30">
                    <span className="text-[10px] text-gray-400 block">RELIABILITY</span>
                    <span className="font-orbitron font-bold text-pink-400">99.98% CRASH-FREE</span>
                  </div>
                </div>
              </Tilt3DCard>
            </div>
          </div>

          {/* 4 Floating Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { val: "10M+", label: "USERS REACHED", sub: "Global deployments", color: "text-cyan-300", border: "border-cyan-500/30" },
              { val: "1,200", label: "RETAIL STORES", sub: "Running POS Ultimate", color: "text-pink-400", border: "border-pink-500/30" },
              { val: "82+", label: "CERTIFICATIONS", sub: "Verified Programming Hub", color: "text-yellow-400", border: "border-yellow-400/30" },
              { val: "99.98%", label: "CRASH-FREE RATE", sub: "Production stability SLA", color: "text-emerald-400", border: "border-emerald-400/30" }
            ].map((m, i) => (
              <div key={i} className={`p-4 rounded-xl bg-[#091125]/80 border ${m.border} backdrop-blur-md text-center`}>
                <p className={`font-orbitron font-black text-2xl sm:text-3xl ${m.color} mb-1`}>{m.val}</p>
                <p className="font-chakra font-bold text-xs text-white">{m.label}</p>
                <p className="text-[11px] font-mono-code text-gray-400 mt-0.5">{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: INTERACTIVE GLASS TERMINAL (CLI)
          ═══════════════════════════════════════════════════════ */}
      <section id="terminal" className="py-24 px-4 relative z-10 bg-[#070d1e]/80 border-t border-cyan-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[10px] font-mono-code uppercase px-3 py-1 rounded bg-cyan-500/10 border border-cyan-400 text-cyan-300">
              COMMAND LINE INTERFACE // GLASS-TERMINAL v2026
            </span>
            <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white mt-3">
              INTERACTIVE <span className="glow-blue text-cyan-300">CLI TERMINAL</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-2 font-rajdhani">
              Execute live commands directly into the terminal below. Type <code className="text-cyan-300 font-mono-code">"help"</code> to view available commands, or click the quick execution buttons.
            </p>
          </div>

          <TerminalCLI
            onSelectApp={(id) => setSelectedAppId(id)}
            onSound={() => triggerSound("click")}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: 16 PRODUCTION APPS (3D FLOATING CARDS)
          ═══════════════════════════════════════════════════════ */}
      <section id="projects" className="py-24 px-4 relative z-10 bg-[#040711]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono-code uppercase px-3 py-1 rounded bg-pink-500/10 border border-pink-400 text-pink-300">
              PRODUCTION ROSTER // 16 APPLICATIONS
            </span>
            <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white mt-3">
              FLOATING <span className="glow-blue text-cyan-300">3D PROJECT CARDS</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-2 font-rajdhani">
              Hover over cards to activate smooth 3D depth tilt and layered shadows. Click any project to open the full technical case study modal.
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  triggerSound("click");
                  setCategoryFilter(cat);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-chakra font-bold tracking-wider transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-[#00f0ff] text-[#040711] shadow-[0_0_15px_rgba(0,240,255,0.6)]"
                    : "bg-[#091228] text-gray-400 hover:text-white border border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 16 Floating 3D Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredApps.map((app) => (
              <Tilt3DCard
                key={app.id}
                onClick={() => {
                  triggerSound("teleport");
                  setSelectedAppId(app.id);
                }}
                className="p-5 rounded-2xl bg-[#081024]/85 border border-cyan-500/25 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono-code text-gray-400 mb-3">
                    <span className="text-cyan-400 font-bold">#{app.desig}</span>
                    <span className="px-2 py-0.5 rounded bg-[#040711] text-pink-400 border border-pink-500/30">
                      {app.status}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl filter drop-shadow-[0_0_8px_#00f0ff] group-hover:scale-125 transition-transform">
                      {app.icon === "POS" ? "🛒" : app.icon === "SOC" ? "📱" : app.icon === "AI" ? "🤖" : app.icon === "VID" ? "🎯" : app.icon === "OCR" ? "📷" : "💻"}
                    </div>
                    <div>
                      <h3 className="font-orbitron font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {app.name}
                      </h3>
                      <p className="text-[11px] font-mono-code text-cyan-400">{app.payloadType}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed font-rajdhani mb-3">
                    {app.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {app.stack.slice(0, 3).map(s => (
                      <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-mono-code bg-[#040711] text-gray-300 border border-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs font-mono-code">
                  <span className="text-cyan-400 flex items-center gap-1 group-hover:underline">
                    <FiMaximize2 /> SPEC & CODE
                  </span>
                  <span className="text-pink-400 font-bold">{app.metrics[0]?.value}</span>
                </div>
              </Tilt3DCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4: ARCHITECTURE & CODE SNIPPET TERMINAL
          ═══════════════════════════════════════════════════════ */}
      <section id="architecture" className="py-24 px-4 relative z-10 bg-[#070d1e]/85 border-t border-cyan-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono-code uppercase px-3 py-1 rounded bg-cyan-500/10 border border-cyan-400 text-cyan-300">
              SYSTEM DESIGN // PRODUCTION CODE ARTIFACTS
            </span>
            <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white mt-3">
              ARCHITECTURE & <span className="glow-blue text-cyan-300">KOTLIN CODE SNIPPETS</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-2 font-rajdhani">
              Inspect verified production code structures powering multi-module Android apps, Clean Architecture use-cases, and offline-first Room synchronization.
            </p>
          </div>

          <CodeSnippetShowcase />

          {/* 6 Modularization Strategy Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {[
              {
                title: "MODULARIZATION STRATEGY",
                badge: "ISOLATION 100%",
                desc: "Strict layer isolation: Domain layer has zero Android framework imports. Feature modules depend only on domain and core modules for instantaneous unit testing.",
                tech: ":feature:* ➜ :core:domain ➜ :core:data"
              },
              {
                title: "MULTI-MODULE BUILDS",
                badge: "80+ MODULES",
                desc: "Gradle build cache optimization, version catalogs, and on-demand dynamic feature delivery maintain sub-6 second incremental build cycles.",
                tech: "settings.gradle.kts // 80+ modules"
              },
              {
                title: "DEPENDENCY INJECTION",
                badge: "HILT / DAGGER",
                desc: "Compile-time safety with Dagger/Hilt. Scoped lifetimes (@Singleton, @ViewModelScoped) with custom assisted factories for SavedStateHandle.",
                tech: "@Inject constructor(private val repo: Repo)"
              },
              {
                title: "CI/CD CONDUIT",
                badge: "ZERO-TOUCH DEPLOY",
                desc: "GitHub Actions & Azure DevOps pipelines: detekt, ktlint, Jacoco 90%+ code coverage gates, automated emulator screenshot regression, and Fastlane signing.",
                tech: "actions/checkout ➜ gradlew test ➜ fastlane"
              },
              {
                title: "SECURITY WARDS",
                badge: "HARDENED AES-256",
                desc: "EncryptedSharedPreferences backed by Android Keystore (AES-256 GCM). Certificate pinning with SHA-256 public key hashes and TLS 1.3.",
                tech: "MasterKey.Builder ➜ EncryptedSharedPreferences"
              },
              {
                title: "PLANETARY SCALABILITY",
                badge: "10M+ USERS TESTED",
                desc: "Memory budgeting for 2GB low-end hardware, offline-first Room DB synchronization with WorkManager, and battery-friendly background pipelines.",
                tech: "Room DB + Flow + WorkManager"
              }
            ].map((card, i) => (
              <div key={i} className="p-5 rounded-xl bg-[#091228] border border-cyan-500/25 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-mono-code">
                    <span className="text-cyan-400 font-bold">{card.title}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px]">
                      {card.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-rajdhani mb-3">
                    {card.desc}
                  </p>
                </div>
                <div className="p-2 rounded bg-[#040711] border border-slate-800 text-[10px] font-mono-code text-pink-400 truncate">
                  &gt; {card.tech}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5: SKILLS & TECHNICAL CAPABILITY MATRIX
          ═══════════════════════════════════════════════════════ */}
      <section id="skills" className="py-24 px-4 relative z-10 bg-[#040711]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono-code uppercase px-3 py-1 rounded bg-pink-500/10 border border-pink-400 text-pink-300">
              CAPABILITY MATRIX // 7 DOMAINS
            </span>
            <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white mt-3">
              SKILLS & <span className="glow-blue text-cyan-300">TECHNOLOGIES</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-2 font-rajdhani">
              Comprehensive proficiency across mobile, architecture, cloud backend, security, on-device AI, and DevOps.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((s) => (
              <div key={s.code} className="p-6 rounded-2xl bg-[#091228]/80 border border-cyan-500/25 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400">
                      {s.code}
                    </span>
                    <span className="text-[10px] font-mono-code text-gray-400">{s.note}</span>
                  </div>
                  <h3 className="font-orbitron font-bold text-base text-white mb-3">{s.group}</h3>
                  <div className="flex flex-wrap gap-2">
                    {s.items.map(item => (
                      <span key={item} className="px-2.5 py-1 rounded-lg text-xs font-mono-code bg-[#040711] text-gray-300 border border-slate-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 6: EXPERIENCE & FOUNDER LAB
          ═══════════════════════════════════════════════════════ */}
      <section id="founder" className="py-24 px-4 relative z-10 bg-[#070d1e]/85 border-t border-cyan-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono-code uppercase px-3 py-1 rounded bg-yellow-500/10 border border-yellow-400 text-yellow-300">
              VENTURE VENTURES // STARTUP EXPERIMENTS
            </span>
            <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white mt-3">
              TECHNICAL FOUNDER & <span className="glow-blue text-cyan-300">CAREER ROADMAP</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-2 font-rajdhani">
              A 7-year engineering timeline of commercial products, performance turnarounds, and architectural leadership.
            </p>
          </div>

          <div className="space-y-4">
            {experience.map((e) => (
              <div key={e.year} className="p-5 rounded-2xl bg-[#091228] border border-cyan-500/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-orbitron font-black text-lg text-cyan-300">{e.year}</span>
                    <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/40">
                      {e.ach}
                    </span>
                  </div>
                  <h3 className="font-orbitron font-bold text-base text-white">{e.title}</h3>
                  <p className="text-xs text-cyan-400 font-mono-code">{e.org}</p>
                  <p className="text-xs text-gray-300 leading-relaxed font-rajdhani max-w-2xl">{e.text}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 md:flex-col md:items-end">
                  {e.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-[#040711] text-gray-400 border border-slate-800">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 7: 82+ CERTIFICATIONS ARCHIVE
          ═══════════════════════════════════════════════════════ */}
      <section id="certs" className="py-24 px-4 relative z-10 bg-[#040711] border-t border-cyan-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[10px] font-mono-code uppercase px-3 py-1 rounded bg-cyan-500/10 border border-cyan-400 text-cyan-300">
              VERIFIED CREDENTIALS // 82+ ACCREDITATIONS
            </span>
            <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white mt-3">
              CERTIFICATION <span className="glow-blue text-cyan-300">ARCHIVE</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-2 font-rajdhani">
              Comprehensive credentials from Programming Hub and Google Developers Launchpad across 9 technical sectors.
            </p>
          </div>

          {/* Search & Sector Filters */}
          <div className="space-y-4 mb-8">
            <div className="relative max-w-md mx-auto">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                placeholder="SEARCH 82+ CERTIFICATES BY NAME..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#091228] border border-cyan-500/40 text-xs font-mono-code text-cyan-300 focus:outline-none focus:border-cyan-300"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {certSectors.map(s => (
                <button
                  key={s}
                  onClick={() => {
                    triggerSound("click");
                    setCertCategory(s);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition-all cursor-pointer ${
                    certCategory === s
                      ? "bg-cyan-500 text-[#040711] font-bold"
                      : "bg-[#091228] text-gray-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredCerts.map((c, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#091228]/80 border border-cyan-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono-code text-gray-400 mb-2">
                    <span className="text-yellow-400 font-bold">{c.date}</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#040711] text-cyan-300 border border-cyan-500/30">
                      #{c.id.slice(-6)}
                    </span>
                  </div>
                  <h4 className="font-orbitron font-bold text-xs text-white mb-1">{c.name}</h4>
                  <p className="text-[11px] font-mono-code text-cyan-400">{c.cat}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-xs font-mono-code">
                  <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                    <FiCheck /> VERIFIED
                  </span>
                  <a
                    href={`https://www.programminghub.io/certificate?id=${c.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-300 hover:underline text-[10px]"
                  >
                    VERIFY ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 8: 43 GITHUB PORTALS & 38 WEBSITES
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 relative z-10 bg-[#070d1e]/85 border-t border-cyan-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[10px] font-mono-code uppercase px-3 py-1 rounded bg-cyan-500/10 border border-cyan-400 text-cyan-300">
              PORTAL NETWORK // GLOBAL REPOSITORY MESH
            </span>
            <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white mt-3">
              43 GITHUB ACCOUNTS & 38 WEB PROBES
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-2 font-rajdhani">
              Domain-specific repositories spanning mobile architectures, ethical hacking, artificial intelligence, and cloud frameworks.
            </p>
          </div>

          <div className="mb-12">
            <h3 className="font-orbitron font-bold text-xs text-cyan-300 mb-3 flex items-center gap-2">
              <FiGithub /> 43 GITHUB DEVELOPER REPOSITORIES
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 font-mono-code text-xs">
              {githubAccounts.map(g => (
                <a
                  key={g}
                  href={`https://github.com/${g}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded bg-[#091228] border border-cyan-500/20 hover:border-cyan-400 text-gray-300 hover:text-white truncate flex items-center justify-between transition-colors"
                >
                  <span className="truncate">{g}</span>
                  <FiExternalLink className="text-[10px] text-cyan-400 shrink-0 ml-1" />
                </a>
              ))}
            </div>
          </div>

          {/* 38 Lovable Deployed Applications */}
          <div className="mb-12">
            <h3 className="font-orbitron font-bold text-xs text-pink-400 mb-3 flex items-center gap-2">
              <FiGlobe /> 38 DEPLOYED WEB APPLICATIONS (LOVABLE WPA SUITE)
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono-code text-xs">
              {lovableWebApps.map(app => (
                <a
                  key={app.name}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-[#091228] border border-pink-500/30 hover:border-cyan-400 hover:bg-[#00f0ff]/10 flex items-center justify-between transition-all group"
                >
                  <div className="truncate">
                    <span className="text-white font-bold group-hover:text-cyan-300 truncate block">{app.name}</span>
                    <span className="text-[10px] text-gray-500 truncate block">{app.url.replace("https://", "")}</span>
                  </div>
                  <FiExternalLink className="text-pink-400 group-hover:text-cyan-300 shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>

          {/* Studio & Media Telemetry Showcase */}
          <div>
            <h3 className="font-orbitron font-bold text-xs text-yellow-300 mb-3 flex items-center gap-2">
              <FiActivity /> STUDIO RIGS & VISUAL LAB ARCHIVE
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {mediaShowcase.map((media, idx) => (
                <a
                  key={idx}
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-xl overflow-hidden aspect-video border border-cyan-500/30 hover:border-pink-500 transition-all shadow-md block bg-[#091228]"
                >
                  {media.type === "video" ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-pink-500/20 to-purple-600/30">
                      <FiPlay className="text-3xl text-pink-400 mb-1 group-hover:scale-125 transition-transform" />
                      <span className="text-[10px] font-mono-code text-cyan-300 font-bold">{media.title}</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={media.url}
                        alt={media.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-1.5 left-2 right-2 flex justify-between text-[9px] font-mono-code text-cyan-300">
                        <span className="truncate">{media.title}</span>
                        <span className="text-pink-400 shrink-0">[{media.tag}]</span>
                      </div>
                    </>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 9: CONTACT & COMMUNICATIONS ARRAY
          ═══════════════════════════════════════════════════════ */}
      <section id="contact" className="py-24 px-4 relative z-10 bg-[#040711] border-t border-cyan-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono-code uppercase px-3 py-1 rounded bg-pink-500/10 border border-pink-400 text-pink-300">
              DISPATCH TERMINAL // DIRECT LINES
            </span>
            <h2 className="text-3xl sm:text-5xl font-orbitron font-black text-white mt-3">
              ESTABLISH <span className="glow-blue text-cyan-300">COMMUNICATION</span>
            </h2>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto mt-2 font-rajdhani">
              Direct emergency voice hotlines and encrypted email channels to engage Moe Kyaw Aung for senior mobile architect roles, founding engineer positions, and consulting contracts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            <div className="p-5 rounded-2xl bg-[#091228] border border-cyan-400 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-code text-yellow-400">HOTLINE 01</span>
                <p className="font-orbitron font-bold text-lg text-white">{profile.phone}</p>
              </div>
              <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="btn-neon-blue px-4 py-2 text-xs">
                CALL
              </a>
            </div>

            <div className="p-5 rounded-2xl bg-[#091228] border border-pink-500 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono-code text-pink-400">HOTLINE 02</span>
                <p className="font-orbitron font-bold text-lg text-white">{profile.secondPhone}</p>
              </div>
              <a href={`tel:${profile.secondPhone.replace(/\s/g, "")}`} className="btn-neon-pink px-4 py-2 text-xs">
                CALL
              </a>
            </div>
          </div>

          {/* 20+ Emails Directory */}
          <div className="p-6 rounded-2xl bg-[#091228] border border-cyan-500/25 mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-orbitron font-bold text-xs text-cyan-300 flex items-center gap-2">
                <FiMail /> 20+ EMAIL INBOXES (CLICK TO COPY TO CLIPBOARD)
              </h3>
              {copiedEmail && (
                <span className="text-xs font-mono-code text-emerald-400 font-bold animate-bounce">
                  COPIED: {copiedEmail}
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 font-mono-code text-xs">
              {emails.map(em => (
                <button
                  key={em}
                  onClick={() => copyToClipboard(em)}
                  className="p-2.5 rounded bg-[#040711] border border-slate-800 hover:border-cyan-400 text-gray-300 hover:text-white truncate flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{em}</span>
                  <FiCopy className="text-gray-500 text-[10px] shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          {/* 16 Gravatar Social Platforms */}
          <div className="p-6 rounded-2xl bg-[#091228] border border-cyan-500/25">
            <h3 className="font-orbitron font-bold text-xs text-yellow-300 mb-4 flex items-center gap-2">
              <FiGlobe /> 16 VERIFIED SOCIAL CHANNELS
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 font-mono-code text-xs">
              {socials.map(s => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded bg-[#040711] border border-slate-800 hover:border-cyan-400 text-gray-300 hover:text-white flex items-center justify-between"
                >
                  <span>{s.name}</span>
                  <FiExternalLink className="text-cyan-400 text-xs" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════ */}
      <footer className="py-12 px-4 bg-[#02050e] border-t border-cyan-500/20 font-mono-code text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-orbitron font-bold text-sm text-white">
              MOE KYAW AUNG (မိုးကျော်အောင်) // SENIOR ANDROID DEVELOPER
            </p>
            <p className="text-gray-400 text-[11px] mt-1">
              Tachileik, Myanmar 🇲🇲 ↔ Bangkok, Thailand 🇹🇭
            </p>
          </div>
          <div className="text-right text-gray-400 text-[11px]">
            <p className="text-cyan-300 font-bold">"{profile.philosophy}"</p>
            <p className="mt-1">© 2026 MOE KYAW AUNG. ALL CYBER SYSTEMS OPERATIONAL.</p>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════════════════
          PROJECT SPEC MODAL
          ═══════════════════════════════════════════════════════ */}
      {activeProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="glass-terminal w-[95vw] sm:w-[740px] max-h-[85vh] overflow-hidden flex flex-col border-2 border-cyan-400 shadow-[0_0_50px_rgba(0,240,255,0.4)]">
            <div className="glass-terminal-bar">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeProject.icon === "POS" ? "🛒" : activeProject.icon === "SOC" ? "📱" : activeProject.icon === "AI" ? "🤖" : activeProject.icon === "VID" ? "🎯" : "💻"}</span>
                <div>
                  <h3 className="font-orbitron font-black text-sm text-white">{activeProject.name}</h3>
                  <span className="text-[10px] font-mono-code text-cyan-400">DESIG #{activeProject.desig} // {activeProject.payloadType}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAppId(null)}
                className="w-8 h-8 rounded-lg bg-[#0b1633] border border-cyan-500/30 text-gray-400 hover:text-white flex items-center justify-center"
              >
                <FiX />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 font-mono-code text-xs">
              <div className="p-3.5 rounded-xl bg-[#02050e] border border-cyan-500/20 text-gray-300 leading-relaxed font-rajdhani text-sm">
                <span className="text-cyan-400 font-bold block mb-1 font-mono-code text-xs">&gt; SYSTEM OVERVIEW:</span>
                {activeProject.summary}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[#091228] border border-slate-800">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">SCALE & METRICS</span>
                  <span className="text-sm font-bold text-emerald-400 block mt-1">{activeProject.telemetry}</span>
                  <span className="text-[10px] text-gray-400 block mt-1">Users: {activeProject.users.toLocaleString()}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#091228] border border-slate-800">
                  <span className="text-[10px] text-gray-400 block font-bold uppercase">ORBITAL CLASSIFICATION</span>
                  <span className="text-sm font-bold text-pink-400 block mt-1">{activeProject.orbit} — {activeProject.altitude}</span>
                  <span className="text-[10px] text-gray-400 block mt-1">Period: {activeProject.period}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#091228] border border-slate-800">
                <span className="text-[10px] text-gray-400 block font-bold uppercase mb-1">ARCHITECTURAL SOLUTION</span>
                <p className="text-xs text-sky-200 font-rajdhani">{activeProject.solution}</p>
              </div>

              <div>
                <span className="text-[10px] text-gray-400 block font-bold uppercase mb-1">CODE SNIPPET</span>
                <pre className="p-3.5 rounded-xl bg-[#02050e] border border-cyan-500/30 text-cyan-300 overflow-x-auto text-xs leading-relaxed">
                  <code>{activeProject.snippet}</code>
                </pre>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {activeProject.stack.map(s => (
                  <span key={s} className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px]">
                    {s}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedAppId(null)}
                  className="px-4 py-2 bg-[#091228] text-gray-300 rounded-lg text-xs font-bold"
                >
                  DISMISS
                </button>
                <div className="flex gap-2">
                  <a
                    href={activeProject.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glass-subtle text-xs"
                  >
                    <span>LIVE DEMO</span>
                    <FiExternalLink />
                  </a>
                  <a
                    href={activeProject.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-neon-blue text-xs"
                  >
                    <span>GITHUB REPO</span>
                    <FiGithub />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
