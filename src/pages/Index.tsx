import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const MODELS_LIBRARY = [
  { id: 1, name: "Рыцарский меч", eng: "Knight Sword", polygons: "2.4K", format: "OBJ", engine: "Roblox", category: "weapon", color: "#00e5ff" },
  { id: 2, name: "Боевой дракон", eng: "Battle Dragon", polygons: "18.2K", format: "FBX", engine: "Unity", category: "creature", color: "#a855f7" },
  { id: 3, name: "Средневековый замок", eng: "Medieval Castle", polygons: "45K", format: "GLB", engine: "Unreal", category: "building", color: "#39ff14" },
  { id: 4, name: "Магический посох", eng: "Magic Staff", polygons: "1.8K", format: "OBJ", engine: "Roblox", category: "weapon", color: "#ff6b35" },
  { id: 5, name: "Космический корабль", eng: "Spaceship", polygons: "12.5K", format: "FBX", engine: "Unity", category: "vehicle", color: "#00e5ff" },
  { id: 6, name: "Дуб лесной", eng: "Oak Tree", polygons: "3.2K", format: "GLB", engine: "Unreal", category: "nature", color: "#39ff14" },
];

const ENGINES = [
  { id: "roblox", name: "Roblox Studio", icon: "Gamepad2", format: "OBJ / FBX", color: "#ff6b35", desc: "Авто-интеграция через HttpService" },
  { id: "unity", name: "Unity", icon: "Box", format: "FBX / GLB", color: "#00e5ff", desc: "Готовые пакеты для импорта" },
  { id: "unreal", name: "Unreal Engine", icon: "Cpu", format: "FBX / OBJ", color: "#a855f7", desc: "Высокополигональные модели" },
];

const BATCH_EXAMPLES = [
  "Рыцарский меч с гравировкой",
  "Деревянный щит с металлическим ободом",
  "Волшебная палочка со звездой",
  "Боевой топор орка",
];

type Tab = "generator" | "library" | "export" | "batch";

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("generator");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedModel, setGeneratedModel] = useState<null | { name: string; polygons: string; time: string }>(null);
  const [selectedEngine, setSelectedEngine] = useState("roblox");
  const [qualityLevel, setQualityLevel] = useState(70);
  const [batchList, setBatchList] = useState(BATCH_EXAMPLES.join("\n"));
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchDone, setBatchDone] = useState(0);
  const [selectedModel, setSelectedModel] = useState<typeof MODELS_LIBRARY[0] | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const vertices = [
        { x: 0, y: -1, z: 0 },
        { x: 0.9, y: 0.4, z: 0.3 },
        { x: -0.9, y: 0.4, z: 0.3 },
        { x: 0, y: 0.4, z: -0.9 },
      ];

      const rotY = t * 0.8;
      const rotX = Math.sin(t * 0.3) * 0.25;

      const project = (v: { x: number; y: number; z: number }) => {
        const cy = Math.cos(rotY), sy = Math.sin(rotY);
        const cx = Math.cos(rotX), sx = Math.sin(rotX);
        const x1 = v.x * cy - v.z * sy;
        const z1 = v.x * sy + v.z * cy;
        const y1 = v.y * cx - z1 * sx;
        const z2 = v.y * sx + z1 * cx;
        const scale = 180 / (z2 + 3);
        return { x: x1 * scale + w / 2, y: y1 * scale + h / 2, z: z2 };
      };

      const pts = vertices.map(project);
      const faces = [[0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 2, 3]];
      const colors = ["#00e5ff", "#0088cc", "#00b8d9", "#006699"];

      faces.forEach((face, i) => {
        const [a, b, c] = face.map(idx => pts[idx]);
        const alpha = Math.max(0.15, Math.min(0.7, (a.z + b.z + c.z) / 9 + 0.45));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.closePath();
        ctx.fillStyle = colors[i] + Math.floor(alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha * 0.7})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#00e5ff";
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      t += 0.014;
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setProgress(0);
    setGeneratedModel(null);
    const steps = [8, 22, 38, 55, 70, 84, 95, 100];
    let i = 0;
    const timer = setInterval(() => {
      if (i < steps.length) { setProgress(steps[i]); i++; }
      else {
        clearInterval(timer);
        setIsGenerating(false);
        setGeneratedModel({ name: prompt, polygons: `${(Math.random() * 14 + 2).toFixed(1)}K`, time: `${(Math.random() * 3 + 1.5).toFixed(1)}с` });
      }
    }, 360);
  };

  const handleBatchRun = () => {
    const lines = batchList.split("\n").filter(l => l.trim()).length;
    setBatchRunning(true); setBatchDone(0);
    let done = 0;
    const t = setInterval(() => {
      done++;
      setBatchDone(done);
      if (done >= lines) { clearInterval(t); setBatchRunning(false); }
    }, 900);
  };

  const filteredModels = filterCategory === "all" ? MODELS_LIBRARY : MODELS_LIBRARY.filter(m => m.category === filterCategory);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "generator", label: "Генератор", icon: "Wand2" },
    { id: "library", label: "Библиотека", icon: "Archive" },
    { id: "export", label: "Экспорт", icon: "Download" },
    { id: "batch", label: "Массовый", icon: "Layers" },
  ];

  return (
    <div className="min-h-screen relative" style={{ background: "#050a0f", backgroundImage: "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }}>
      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 0 }} />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)", filter: "blur(60px)", zIndex: 0 }} />

      {/* Header */}
      <header className="relative z-10 border-b" style={{ borderColor: "rgba(0,229,255,0.1)", background: "rgba(5,10,15,0.92)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00e5ff, #a855f7)" }}>
              <Icon name="Box" size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-widest" style={{ color: "#00e5ff", textShadow: "0 0 20px rgba(0,229,255,0.5)", fontFamily: "'Rajdhani', sans-serif" }}>
                FORGE<span style={{ color: "#a855f7" }}>3D</span>
              </h1>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.28)" }}>AI ASSET GENERATOR v1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(57,255,20,0.08)", border: "1px solid rgba(57,255,20,0.25)" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#39ff14", boxShadow: "0 0 6px #39ff14", animation: "pulse-glow 2s infinite" }} />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#39ff14" }}>ONLINE</span>
            </div>
            <div className="px-3 py-1.5 rounded-full" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.15)", color: "rgba(255,255,255,0.4)" }}>
              {MODELS_LIBRARY.length} моделей
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="relative z-10 border-b" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(5,10,15,0.7)", backdropFilter: "blur(10px)" }}>
        <div className="max-w-7xl mx-auto px-6 flex">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="relative flex items-center gap-2 px-6 py-4 transition-all duration-300"
              style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: "13px", letterSpacing: "0.1em", color: activeTab === tab.id ? "#00e5ff" : "rgba(255,255,255,0.3)", borderBottom: activeTab === tab.id ? "2px solid #00e5ff" : "2px solid transparent", background: activeTab === tab.id ? "rgba(0,229,255,0.04)" : "transparent" }}>
              <Icon name={tab.icon} size={15} />
              {tab.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">

        {/* ── GENERATOR ── */}
        {activeTab === "generator" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-up">
            <div className="lg:col-span-3 space-y-5">
              <div>
                <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Rajdhani', sans-serif", color: "rgba(255,255,255,0.95)" }}>
                  Генерация <span style={{ color: "#00e5ff", textShadow: "0 0 15px rgba(0,229,255,0.5)" }}>3D-модели</span>
                </h2>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>Опишите объект на русском — ИИ создаст 3D-меш за секунды</p>
              </div>

              <div className="relative">
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                  placeholder="Например: Рыцарский меч с золотой гравировкой на лезвии..." rows={4}
                  className="w-full rounded-xl px-5 py-4 text-sm resize-none outline-none transition-all duration-300"
                  style={{ fontFamily: "'Golos Text', sans-serif", background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.18)", color: "rgba(255,255,255,0.88)", caretColor: "#00e5ff" }}
                  onFocus={e => (e.target.style.borderColor = "rgba(0,229,255,0.5)")}
                  onBlur={e => (e.target.style.borderColor = "rgba(0,229,255,0.18)")} />
              </div>

              <div className="flex flex-wrap gap-2">
                {["Меч", "Замок", "Дракон", "Броня", "Посох", "Дерево", "Щит", "Корабль"].map(tag => (
                  <button key={tag} onClick={() => setPrompt(p => p ? `${p}, ${tag.toLowerCase()}` : tag)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all duration-200 hover:scale-105"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.15)", color: "rgba(255,255,255,0.55)" }}>
                    {tag}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[{ label: "Качество", options: ["Низкое", "Среднее", "Высокое"] }, { label: "Движок", options: ["Roblox", "Unity", "Unreal"] }, { label: "Формат", options: ["OBJ", "FBX", "GLB"] }].map(s => (
                  <div key={s.label}>
                    <label className="block mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.38)" }}>{s.label}</label>
                    <select className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                      style={{ fontFamily: "'IBM Plex Mono', monospace", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.75)" }}>
                      {s.options.map(o => <option key={o} style={{ background: "#0a1020" }}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.38)" }}>Полигонаж</label>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "#00e5ff" }}>{qualityLevel}% · {Math.round(qualityLevel * 0.5)}K poly</span>
                </div>
                <input type="range" min={10} max={100} value={qualityLevel} onChange={e => setQualityLevel(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #00e5ff ${qualityLevel}%, rgba(255,255,255,0.08) ${qualityLevel}%)` }} />
              </div>

              <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating}
                className="w-full py-4 rounded-xl font-bold text-lg tracking-widest transition-all duration-300 disabled:opacity-50"
                style={{ fontFamily: "'Rajdhani', sans-serif", background: isGenerating ? "rgba(0,229,255,0.08)" : "linear-gradient(135deg, #00e5ff, #0088cc)", color: isGenerating ? "#00e5ff" : "#050a0f", border: isGenerating ? "1px solid rgba(0,229,255,0.25)" : "none", boxShadow: isGenerating ? "none" : "0 0 30px rgba(0,229,255,0.38)" }}>
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent" style={{ animation: "spin 0.9s linear infinite" }} />
                    ГЕНЕРАЦИЯ... {progress}%
                  </span>
                ) : "⚡ СГЕНЕРИРОВАТЬ МОДЕЛЬ"}
              </button>

              {isGenerating && (
                <div className="p-4 rounded-xl space-y-3" style={{ background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.1)" }}>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #00e5ff, #a855f7)", boxShadow: "0 0 10px rgba(0,229,255,0.5)" }} />
                  </div>
                  {[{ p: 20, label: "Анализ промпта" }, { p: 45, label: "Генерация меша (TripoSR)" }, { p: 72, label: "Оптимизация полигонов" }, { p: 92, label: "Конвертация формата" }].map(step => (
                    <div key={step.label} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: progress > step.p ? "rgba(57,255,20,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${progress > step.p ? "#39ff14" : "rgba(255,255,255,0.08)"}` }}>
                        {progress > step.p && <Icon name="Check" size={10} style={{ color: "#39ff14" }} />}
                      </div>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: progress > step.p ? "#39ff14" : "rgba(255,255,255,0.28)" }}>{step.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {generatedModel && (
                <div className="p-5 rounded-xl animate-fade-up" style={{ background: "rgba(57,255,20,0.04)", border: "1px solid rgba(57,255,20,0.22)" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-lg" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#39ff14" }}>✓ Модель готова!</p>
                      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{generatedModel.name}</p>
                    </div>
                    <div className="text-right">
                      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>Полигонов</p>
                      <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "18px", color: "#00e5ff" }}>{generatedModel.polygons}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["↓ OBJ", "↓ FBX", "В библиотеку"].map((btn, i) => (
                      <button key={btn} className="py-2 rounded-lg text-xs transition-all hover:scale-105"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", background: i === 2 ? "rgba(168,85,247,0.12)" : "rgba(0,229,255,0.1)", border: `1px solid ${i === 2 ? "rgba(168,85,247,0.35)" : "rgba(0,229,255,0.28)"}`, color: i === 2 ? "#a855f7" : "#00e5ff" }}>
                        {btn}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3D Preview */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(0,229,255,0.02)", border: "1px solid rgba(0,229,255,0.13)" }}>
                <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: "rgba(0,229,255,0.08)" }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>3D PREVIEW — REAL-TIME</span>
                  <div className="flex gap-1.5">
                    {["#ff5f57", "#febc2e", "#28c840"].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
                  </div>
                </div>
                <div className="relative flex items-center justify-center" style={{ height: 320 }}>
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.4), transparent)", animation: "scanline 2.5s linear infinite" }} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(0,229,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                  <canvas ref={canvasRef} width={280} height={280} className="relative z-10" />
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between pointer-events-none">
                    <div className="space-y-1">
                      {generatedModel ? (
                        <>
                          <div className="px-2 py-0.5 rounded" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", background: "rgba(0,0,0,0.7)", color: "#00e5ff" }}>{generatedModel.polygons} poly</div>
                          <div className="px-2 py-0.5 rounded" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", background: "rgba(0,0,0,0.7)", color: "#39ff14" }}>{generatedModel.time}</div>
                        </>
                      ) : (
                        <div className="px-2 py-0.5 rounded" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", background: "rgba(0,0,0,0.7)", color: "rgba(255,255,255,0.25)" }}>демо-меш</div>
                      )}
                    </div>
                    <div className="px-2 py-0.5 rounded" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", background: "rgba(0,0,0,0.7)", color: "rgba(255,255,255,0.25)" }}>⟳ AUTO</div>
                  </div>
                </div>
                <div className="px-4 py-3 border-t grid grid-cols-3 gap-3" style={{ borderColor: "rgba(0,229,255,0.08)" }}>
                  {[{ label: "Вершины", value: generatedModel ? "1.2K" : "—" }, { label: "UV-маппинг", value: generatedModel ? "✓" : "—" }, { label: "Normal map", value: generatedModel ? "✓" : "—" }].map(s => (
                    <div key={s.label} className="text-center">
                      <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: generatedModel ? "#00e5ff" : "rgba(255,255,255,0.18)" }}>{s.value}</p>
                      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {[{ label: "Моделей создано", value: "1,847", color: "#00e5ff" }, { label: "Среднее время", value: "3.2с", color: "#a855f7" }, { label: "Успешных", value: "98.4%", color: "#39ff14" }, { label: "Активных сессий", value: "12", color: "#ff6b35" }].map(s => (
                  <div key={s.label} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="font-bold text-xl" style={{ fontFamily: "'Rajdhani', sans-serif", color: s.color, textShadow: `0 0 10px ${s.color}50` }}>{s.value}</p>
                    <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LIBRARY ── */}
        {activeTab === "library" && (
          <div className="animate-fade-up space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: "rgba(255,255,255,0.95)" }}>
                  Библиотека <span style={{ color: "#a855f7", textShadow: "0 0 15px rgba(168,85,247,0.5)" }}>моделей</span>
                </h2>
                <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.38)" }}>Готовые ассеты для экспорта в любой движок</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[{ id: "all", label: "Все" }, { id: "weapon", label: "Оружие" }, { id: "creature", label: "Существа" }, { id: "building", label: "Здания" }, { id: "vehicle", label: "Транспорт" }, { id: "nature", label: "Природа" }].map(cat => (
                  <button key={cat.id} onClick={() => setFilterCategory(cat.id)}
                    className="px-3 py-1.5 rounded-lg text-xs transition-all"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", background: filterCategory === cat.id ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${filterCategory === cat.id ? "rgba(168,85,247,0.45)" : "rgba(255,255,255,0.07)"}`, color: filterCategory === cat.id ? "#a855f7" : "rgba(255,255,255,0.4)" }}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModels.map((model, i) => (
                <div key={model.id} onClick={() => setSelectedModel(selectedModel?.id === model.id ? null : model)}
                  className="p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  style={{ background: selectedModel?.id === model.id ? `${model.color}0d` : "rgba(255,255,255,0.02)", border: `1px solid ${selectedModel?.id === model.id ? model.color + "45" : "rgba(255,255,255,0.06)"}`, animationDelay: `${i * 0.07}s` }}>
                  <div className="h-32 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center" style={{ background: `radial-gradient(circle at 50% 40%, ${model.color}12, rgba(0,0,0,0.25))`, border: `1px solid ${model.color}18` }}>
                    <div className="text-5xl" style={{ filter: `drop-shadow(0 0 18px ${model.color})`, animation: "float 6s ease-in-out infinite" }}>
                      {model.category === "weapon" ? "⚔️" : model.category === "creature" ? "🐉" : model.category === "building" ? "🏰" : model.category === "vehicle" ? "🚀" : "🌳"}
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", background: "rgba(0,0,0,0.65)", color: model.color, border: `1px solid ${model.color}28` }}>{model.format}</div>
                  </div>
                  <h3 className="font-bold text-lg mb-0.5" style={{ fontFamily: "'Rajdhani', sans-serif", color: "rgba(255,255,255,0.9)" }}>{model.name}</h3>
                  <p className="mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.32)" }}>{model.eng}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", background: `${model.color}12`, color: model.color, border: `1px solid ${model.color}28` }}>{model.polygons} poly</span>
                      <span className="px-2 py-0.5 rounded" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)" }}>{model.engine}</span>
                    </div>
                    <button className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ background: `${model.color}12`, color: model.color }}>
                      <Icon name="Download" size={14} />
                    </button>
                  </div>
                  {selectedModel?.id === model.id && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-2" style={{ borderColor: `${model.color}18` }}>
                      {["OBJ", "FBX", "GLB", "DAE"].map(fmt => (
                        <button key={fmt} className="py-2 rounded-lg text-xs font-bold transition-all hover:scale-105"
                          style={{ fontFamily: "'IBM Plex Mono', monospace", background: `${model.color}12`, border: `1px solid ${model.color}28`, color: model.color }}>
                          ↓ {fmt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EXPORT ── */}
        {activeTab === "export" && (
          <div className="animate-fade-up space-y-6">
            <div>
              <h2 className="text-3xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: "rgba(255,255,255,0.95)" }}>
                Экспорт в <span style={{ color: "#00e5ff", textShadow: "0 0 15px rgba(0,229,255,0.5)" }}>движок</span>
              </h2>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.38)" }}>Выберите платформу — модели оптимизируются автоматически</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {ENGINES.map(engine => (
                <div key={engine.id} onClick={() => setSelectedEngine(engine.id)}
                  className="p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  style={{ background: selectedEngine === engine.id ? `${engine.color}08` : "rgba(255,255,255,0.02)", border: `2px solid ${selectedEngine === engine.id ? engine.color : "rgba(255,255,255,0.06)"}`, boxShadow: selectedEngine === engine.id ? `0 0 30px ${engine.color}18` : "none" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${engine.color}12`, border: `1px solid ${engine.color}28` }}>
                    <Icon name={engine.icon} size={22} style={{ color: engine.color }} />
                  </div>
                  <h3 className="font-bold text-xl mb-1" style={{ fontFamily: "'Rajdhani', sans-serif", color: "rgba(255,255,255,0.9)" }}>{engine.name}</h3>
                  <p className="mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: engine.color }}>{engine.format}</p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>{engine.desc}</p>
                  {selectedEngine === engine.id && (
                    <div className="mt-3 flex items-center gap-1.5" style={{ color: engine.color }}>
                      <Icon name="CheckCircle" size={13} />
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px" }}>ВЫБРАНО</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedEngine === "roblox" && (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,107,53,0.22)" }}>
                <div className="px-5 py-3 flex items-center justify-between" style={{ background: "rgba(255,107,53,0.07)", borderBottom: "1px solid rgba(255,107,53,0.14)" }}>
                  <div className="flex items-center gap-2">
                    <Icon name="Code2" size={13} style={{ color: "#ff6b35" }} />
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "12px", fontWeight: 600, color: "#ff6b35" }}>Roblox Studio — LocalScript</span>
                  </div>
                  <button className="px-3 py-1 rounded text-xs transition-all hover:scale-105"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", background: "rgba(255,107,53,0.12)", color: "#ff6b35", border: "1px solid rgba(255,107,53,0.28)" }}>
                    КОПИРОВАТЬ
                  </button>
                </div>
                <pre className="p-5 text-xs overflow-x-auto" style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.72)", fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.75 }}>
{`-- FORGE3D Auto-Import Script
local HttpService  = game:GetService("HttpService")
local Workspace    = game:GetService("Workspace")

local API_URL  = "https://your-forge3d-api.com"
local MODEL_ID = "sword_001"

local function importModel(modelId)
  local url  = API_URL .. "/export/roblox/" .. modelId
  local res  = HttpService:GetAsync(url)
  local data = HttpService:JSONDecode(res)

  local mesh = Instance.new("MeshPart")
  mesh.MeshId    = data.meshId
  mesh.TextureID = data.textureId
  mesh.Size = Vector3.new(
    data.size.x, data.size.y, data.size.z
  )
  mesh.Position = Workspace.SpawnLocation.Position
                + Vector3.new(0, 5, 0)
  mesh.Parent = Workspace

  print("✓ Загружено: " .. data.name)
  return mesh
end

importModel(MODEL_ID)`}
                </pre>
              </div>
            )}

            {selectedEngine === "unity" && (
              <div className="grid grid-cols-2 gap-4">
                {[{ step: "01", title: "Скачайте FBX-пакет", desc: "Нажмите Export → Unity Bundle для загрузки архива" }, { step: "02", title: "Импортируйте в Assets", desc: "Перетащите .fbx в папку Assets/Models в Unity Editor" }, { step: "03", title: "Настройте материалы", desc: "Примените PBR-материалы — текстуры уже в архиве" }, { step: "04", title: "Добавьте на сцену", desc: "Перетащите префаб или используйте Instantiate в коде" }].map(item => (
                  <div key={item.step} className="p-5 rounded-xl" style={{ background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.1)" }}>
                    <div className="font-bold mb-2" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "40px", color: "rgba(0,229,255,0.12)" }}>{item.step}</div>
                    <h4 className="font-bold mb-1" style={{ fontFamily: "'Rajdhani', sans-serif", color: "rgba(255,255,255,0.85)" }}>{item.title}</h4>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedEngine === "unreal" && (
              <div className="p-5 rounded-2xl" style={{ background: "rgba(168,85,247,0.04)", border: "1px solid rgba(168,85,247,0.18)" }}>
                <h4 className="font-bold text-lg mb-3" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#a855f7" }}>Unreal Engine — высокополигональный pipeline</h4>
                <div className="space-y-2">
                  {["Экспорт в FBX с высоким LOD (LOD0)", "Nanite автоматически оптимизирует полигонаж в рантайме", "Lumen освещение работает с нашими normal maps", "Blueprint-компонент для процедурного спавна ассетов"].map(item => (
                    <div key={item} className="flex items-center gap-2">
                      <Icon name="ChevronRight" size={13} style={{ color: "#a855f7" }} />
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="w-full py-4 rounded-xl font-bold text-lg tracking-wider transition-all duration-300 hover:scale-[1.01]"
              style={{ fontFamily: "'Rajdhani', sans-serif", background: `linear-gradient(135deg, ${ENGINES.find(e => e.id === selectedEngine)?.color}, ${ENGINES.find(e => e.id === selectedEngine)?.color}99)`, color: selectedEngine === "roblox" ? "#fff" : "#050a0f", boxShadow: `0 0 30px ${ENGINES.find(e => e.id === selectedEngine)?.color}35` }}>
              ↓ ЭКСПОРТИРОВАТЬ ДЛЯ {ENGINES.find(e => e.id === selectedEngine)?.name.toUpperCase()}
            </button>
          </div>
        )}

        {/* ── BATCH ── */}
        {activeTab === "batch" && (
          <div className="animate-fade-up space-y-6">
            <div>
              <h2 className="text-3xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: "rgba(255,255,255,0.95)" }}>
                Массовая <span style={{ color: "#39ff14", textShadow: "0 0 15px rgba(57,255,20,0.5)" }}>генерация</span>
              </h2>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.38)" }}>Вставьте список промптов — каждый с новой строки. Система обработает всё автоматически</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", background: "rgba(57,255,20,0.08)", color: "#39ff14", border: "1px solid rgba(57,255,20,0.25)" }}>
                    {batchList.split("\n").filter(l => l.trim()).length} промптов
                  </div>
                  <textarea value={batchList} onChange={e => setBatchList(e.target.value)} rows={12}
                    className="w-full rounded-xl px-5 py-4 text-sm resize-none outline-none"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", background: "rgba(57,255,20,0.02)", border: "1px solid rgba(57,255,20,0.12)", color: "rgba(255,255,255,0.78)", caretColor: "#39ff14", lineHeight: 2 }}
                    placeholder={"Рыцарский меч\nОгненный дракон\nСредневековый замок\n..."}
                    onFocus={e => (e.target.style.borderColor = "rgba(57,255,20,0.35)")}
                    onBlur={e => (e.target.style.borderColor = "rgba(57,255,20,0.12)")} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[{ label: "Формат", options: ["OBJ", "FBX", "GLB"] }, { label: "Движок", options: ["Roblox", "Unity", "Unreal"] }].map(s => (
                    <div key={s.label}>
                      <label className="block mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.38)" }}>{s.label}</label>
                      <select className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                        style={{ fontFamily: "'IBM Plex Mono', monospace", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.72)" }}>
                        {s.options.map(o => <option key={o} style={{ background: "#0a1020" }}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                <button onClick={handleBatchRun} disabled={batchRunning}
                  className="w-full py-4 rounded-xl font-bold text-lg tracking-wider transition-all duration-300 disabled:opacity-60"
                  style={{ fontFamily: "'Rajdhani', sans-serif", background: batchRunning ? "rgba(57,255,20,0.07)" : "linear-gradient(135deg, #39ff14, #22bb00)", color: batchRunning ? "#39ff14" : "#050a0f", border: batchRunning ? "1px solid rgba(57,255,20,0.25)" : "none", boxShadow: batchRunning ? "none" : "0 0 30px rgba(57,255,20,0.38)" }}>
                  {batchRunning ? `⚙️ ОБРАБОТКА... ${batchDone}/${batchList.split("\n").filter(l => l.trim()).length}` : "▶ ЗАПУСТИТЬ ПАКЕТНУЮ ГЕНЕРАЦИЮ"}
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>ОЧЕРЕДЬ ЗАДАЧ</span>
                  {batchDone > 0 && <span className="px-2 py-0.5 rounded" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", background: "rgba(57,255,20,0.08)", color: "#39ff14" }}>{batchDone} готово</span>}
                </div>

                {batchList.split("\n").filter(l => l.trim()).map((line, i) => {
                  const isDone = i < batchDone;
                  const isActive = i === batchDone && batchRunning;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-all duration-500"
                      style={{ background: isDone ? "rgba(57,255,20,0.04)" : isActive ? "rgba(0,229,255,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${isDone ? "rgba(57,255,20,0.18)" : isActive ? "rgba(0,229,255,0.18)" : "rgba(255,255,255,0.05)"}` }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: isDone ? "rgba(57,255,20,0.12)" : isActive ? "rgba(0,229,255,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${isDone ? "rgba(57,255,20,0.35)" : isActive ? "rgba(0,229,255,0.28)" : "rgba(255,255,255,0.07)"}` }}>
                        {isDone ? <Icon name="Check" size={11} style={{ color: "#39ff14" }} /> :
                          isActive ? <span className="inline-block w-3 h-3 rounded-full border border-current border-t-transparent" style={{ color: "#00e5ff", animation: "spin 0.8s linear infinite" }} /> :
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "rgba(255,255,255,0.25)" }}>{i + 1}</span>}
                      </div>
                      <span className="flex-1 text-sm" style={{ fontFamily: "'Golos Text', sans-serif", color: isDone ? "#39ff14" : isActive ? "#00e5ff" : "rgba(255,255,255,0.38)" }}>{line}</span>
                      {isDone && (
                        <div className="flex gap-1">
                          {["OBJ", "FBX"].map(f => <span key={f} className="px-1.5 py-0.5 rounded" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", background: "rgba(57,255,20,0.08)", color: "#39ff14" }}>{f}</span>)}
                        </div>
                      )}
                    </div>
                  );
                })}

                {batchDone > 0 && batchDone === batchList.split("\n").filter(l => l.trim()).length && (
                  <div className="p-5 rounded-xl text-center" style={{ background: "rgba(57,255,20,0.05)", border: "1px solid rgba(57,255,20,0.25)" }}>
                    <p className="font-bold text-xl mb-1" style={{ fontFamily: "'Rajdhani', sans-serif", color: "#39ff14" }}>✓ Всё готово!</p>
                    <p className="mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{batchDone} моделей сгенерировано</p>
                    <button className="px-6 py-2.5 rounded-xl font-bold text-sm tracking-wider transition-all hover:scale-105"
                      style={{ fontFamily: "'Rajdhani', sans-serif", background: "linear-gradient(135deg, #39ff14, #22bb00)", color: "#050a0f" }}>
                      ↓ СКАЧАТЬ АРХИВ ZIP
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 mt-16 border-t py-6" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.18)" }}>FORGE3D © 2026 — AI 3D Asset Pipeline</span>
          <div className="flex gap-5">
            {["API Docs", "Python SDK", "Lua Script"].map(link => (
              <span key={link} className="cursor-pointer hover:opacity-70 transition-opacity" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", color: "rgba(0,229,255,0.4)" }}>{link}</span>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes scanline { 0%{top:-2px;opacity:0} 5%{opacity:1} 95%{opacity:1} 100%{top:100%;opacity:0} }
        @keyframes pulse-glow { 0%,100%{opacity:0.7} 50%{opacity:1} }
        input[type=range]::-webkit-slider-thumb{appearance:none;width:14px;height:14px;border-radius:50%;background:#00e5ff;cursor:pointer;box-shadow:0 0 8px rgba(0,229,255,0.6)}
      `}</style>
    </div>
  );
}
