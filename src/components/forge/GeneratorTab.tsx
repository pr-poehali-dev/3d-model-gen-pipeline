import { useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { GeneratedModel } from "./constants";

interface GeneratorTabProps {
  prompt: string;
  setPrompt: (v: string) => void;
  isGenerating: boolean;
  progress: number;
  generatedModel: GeneratedModel | null;
  qualityLevel: number;
  setQualityLevel: (v: number) => void;
  onGenerate: () => void;
}

export default function GeneratorTab({
  prompt,
  setPrompt,
  isGenerating,
  progress,
  generatedModel,
  qualityLevel,
  setQualityLevel,
  onGenerate,
}: GeneratorTabProps) {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-up">
      {/* Left — controls */}
      <div className="lg:col-span-3 space-y-5">
        <div>
          <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Rajdhani', sans-serif", color: "rgba(255,255,255,0.95)" }}>
            Генерация <span style={{ color: "#00e5ff", textShadow: "0 0 15px rgba(0,229,255,0.5)" }}>3D-модели</span>
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>Опишите объект на русском — ИИ создаст 3D-меш за секунды</p>
        </div>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Например: Рыцарский меч с золотой гравировкой на лезвии..."
            rows={4}
            className="w-full rounded-xl px-5 py-4 text-sm resize-none outline-none transition-all duration-300"
            style={{ fontFamily: "'Golos Text', sans-serif", background: "rgba(0,229,255,0.03)", border: "1px solid rgba(0,229,255,0.18)", color: "rgba(255,255,255,0.88)", caretColor: "#00e5ff" }}
            onFocus={e => (e.target.style.borderColor = "rgba(0,229,255,0.5)")}
            onBlur={e => (e.target.style.borderColor = "rgba(0,229,255,0.18)")}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["Меч", "Замок", "Дракон", "Броня", "Посох", "Дерево", "Щит", "Корабль"].map(tag => (
            <button
              key={tag}
              onClick={() => setPrompt(prompt ? `${prompt}, ${tag.toLowerCase()}` : tag)}
              className="px-3 py-1.5 rounded-lg text-xs transition-all duration-200 hover:scale-105"
              style={{ fontFamily: "'IBM Plex Mono', monospace", background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.15)", color: "rgba(255,255,255,0.55)" }}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Качество", options: ["Низкое", "Среднее", "Высокое"] },
            { label: "Движок", options: ["Roblox", "Unity", "Unreal"] },
            { label: "Формат", options: ["OBJ", "FBX", "GLB"] },
          ].map(s => (
            <div key={s.label}>
              <label className="block mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.38)" }}>{s.label}</label>
              <select
                className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                style={{ fontFamily: "'IBM Plex Mono', monospace", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.75)" }}
              >
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
          <input
            type="range" min={10} max={100} value={qualityLevel}
            onChange={e => setQualityLevel(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #00e5ff ${qualityLevel}%, rgba(255,255,255,0.08) ${qualityLevel}%)` }}
          />
        </div>

        <button
          onClick={onGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-4 rounded-xl font-bold text-lg tracking-widest transition-all duration-300 disabled:opacity-50"
          style={{ fontFamily: "'Rajdhani', sans-serif", background: isGenerating ? "rgba(0,229,255,0.08)" : "linear-gradient(135deg, #00e5ff, #0088cc)", color: isGenerating ? "#00e5ff" : "#050a0f", border: isGenerating ? "1px solid rgba(0,229,255,0.25)" : "none", boxShadow: isGenerating ? "none" : "0 0 30px rgba(0,229,255,0.38)" }}
        >
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
            {[
              { p: 20, label: "Анализ промпта" },
              { p: 45, label: "Генерация меша (TripoSR)" },
              { p: 72, label: "Оптимизация полигонов" },
              { p: 92, label: "Конвертация формата" },
            ].map(step => (
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

      {/* Right — 3D Preview */}
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
            {[
              { label: "Вершины", value: generatedModel ? "1.2K" : "—" },
              { label: "UV-маппинг", value: generatedModel ? "✓" : "—" },
              { label: "Normal map", value: generatedModel ? "✓" : "—" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: generatedModel ? "#00e5ff" : "rgba(255,255,255,0.18)" }}>{s.value}</p>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { label: "Моделей создано", value: "1,847", color: "#00e5ff" },
            { label: "Среднее время", value: "3.2с", color: "#a855f7" },
            { label: "Успешных", value: "98.4%", color: "#39ff14" },
            { label: "Активных сессий", value: "12", color: "#ff6b35" },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="font-bold text-xl" style={{ fontFamily: "'Rajdhani', sans-serif", color: s.color, textShadow: `0 0 10px ${s.color}50` }}>{s.value}</p>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
