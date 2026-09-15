import { useEffect, useRef, useState } from "react";
import type { Mission } from "../data";

/* ═══════════════════════════════════════════════════════
   RADAR SCOPE — rotating PPI with phosphor persistence
   ═══════════════════════════════════════════════════════ */
export function RadarScope({ size = 320, missions }: { size?: number; missions: Mission[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = size * dpr; cv.height = size * dpr;
    ctx.scale(dpr, dpr);

    let raf = 0;
    let sweep = 0;

    const contacts = missions.slice(0, 9).map((m, i) => ({
      ang: (i / 9) * Math.PI * 2 + Math.random() * 0.4,
      dist: 0.25 + Math.random() * 0.6,
      label: m.desig,
      strength: 0.55 + Math.random() * 0.45,
      blip: -99,
    }));

    const draw = () => {
      const c = size / 2;
      const R = size * 0.44;
      sweep += 0.014;
      if (sweep > Math.PI * 2) sweep -= Math.PI * 2;

      ctx.fillStyle = "rgba(2, 4, 10, 0.13)";
      ctx.fillRect(0, 0, size, size);

      // range rings
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(c, c, (R * i) / 4, 0, Math.PI * 2);
        ctx.strokeStyle = i === 4 ? "rgba(0, 240, 255, .4)" : "rgba(0, 240, 255, .13)";
        ctx.stroke();
      }
      // crosshairs
      ctx.beginPath();
      ctx.moveTo(c - R, c); ctx.lineTo(c + R, c);
      ctx.moveTo(c, c - R); ctx.lineTo(c, c + R);
      ctx.strokeStyle = "rgba(0, 240, 255, .13)";
      ctx.stroke();
      // bearing ticks
      for (let d = 0; d < 360; d += 30) {
        const a = (d * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(c + Math.cos(a) * R * 0.93, c + Math.sin(a) * R * 0.93);
        ctx.lineTo(c + Math.cos(a) * R, c + Math.sin(a) * R);
        ctx.strokeStyle = "rgba(0, 240, 255, .3)";
        ctx.stroke();
      }
      // labels
      ctx.font = "8px 'IBM Plex Mono', monospace";
      ctx.fillStyle = "rgba(0, 240, 255, .45)";
      ctx.textAlign = "center";
      [["000", 0, -1], ["090", 1, 0], ["180", 0, 1], ["270", -1, 0]].forEach(([lbl, dx, dy]) => {
        ctx.fillText(lbl as string, c + (dx as number) * R * 0.84, c + (dy as number) * R * 0.84 + 3);
      });

      // sweep trail
      for (let i = 0; i < 28; i++) {
        const a0 = sweep - (i / 28) * 0.85;
        ctx.beginPath();
        ctx.moveTo(c, c);
        ctx.arc(c, c, R, a0 - 0.035, a0);
        ctx.closePath();
        ctx.fillStyle = `rgba(0, 240, 255, ${0.09 * (1 - i / 28)})`;
        ctx.fill();
      }
      // sweep edge
      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.lineTo(c + Math.cos(sweep) * R, c + Math.sin(sweep) * R);
      ctx.strokeStyle = "rgba(180, 255, 245, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // contacts
      contacts.forEach(ct => {
        let diff = Math.abs(((sweep - ct.ang + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
        diff = Math.PI - diff;
        if (diff < 0.05) ct.blip = 0;
        if (ct.blip >= 0) ct.blip += 0.011;
        const fade = ct.blip >= 0 ? Math.max(0, 1 - ct.blip) : 0;
        if (fade <= 0) return;

        const x = c + Math.cos(ct.ang) * R * ct.dist;
        const y = c + Math.sin(ct.ang) * R * ct.dist;
        ctx.beginPath();
        ctx.arc(x, y, 3 * ct.strength + 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 255, 245, ${fade})`;
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 10 * fade;
        ctx.fill();
        ctx.shadowBlur = 0;
        if (fade > 0.3) {
          ctx.font = "8px 'IBM Plex Mono', monospace";
          ctx.fillStyle = `rgba(0, 240, 255, ${fade * 0.8})`;
          ctx.textAlign = "left";
          ctx.fillText(ct.label, x + 10, y + 3);
        }
      });

      // center
      ctx.beginPath();
      ctx.arc(c, c, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#c0fff0";
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [size, missions]);

  return <canvas ref={ref} style={{ width: size, height: size }} className="block" />;
}

/* ═══════════════════════════════════════════════════════
   ORBITAL MAP — satellites on elliptical paths around planet
   ═══════════════════════════════════════════════════════ */
export function OrbitMap({ sats, onSelect, activeId }: {
  sats: Mission[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef<string | null>(null);
  const nodePos = useRef<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    let w = 0, h = 0;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    const orbits = sats.map((s, i) => ({
      ...s,
      a: 0.18 + (i % 5) * 0.07,
      ecc: 0.14 + (i % 4) * 0.07,
      tilt: (i * 33 * Math.PI) / 180,
      phase: (i / sats.length) * Math.PI * 2,
      speed: 0.14 + (i % 6) * 0.03,
    }));

    const pos = (o: typeof orbits[0], tw: number) => {
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h);
      const ang = o.phase + tw * o.speed;
      const rx = R * o.a, ry = R * o.a * (1 - o.ecc);
      const x0 = Math.cos(ang) * rx, y0 = Math.sin(ang) * ry;
      return {
        x: cx + x0 * Math.cos(o.tilt) - y0 * Math.sin(o.tilt),
        y: cy + x0 * Math.sin(o.tilt) + y0 * Math.cos(o.tilt),
      };
    };

    const onMove = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      let found: string | null = null;
      nodePos.current.forEach((p, id) => {
        if (Math.hypot(p.x - mx, p.y - my) < 16) found = id;
      });
      hoverRef.current = found;
      cv.style.cursor = found ? "pointer" : "crosshair";
    };
    const onClick = () => {
      if (hoverRef.current) onSelect(hoverRef.current);
    };
    const onLeave = () => { hoverRef.current = null; };
    cv.addEventListener("mousemove", onMove);
    cv.addEventListener("click", onClick);
    cv.addEventListener("mouseleave", onLeave);

    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h);

      // stars
      for (let i = 0; i < 70; i++) {
        const sx = ((i * 8677) % w);
        const sy = ((i * 4231) % h);
        const tw = 0.2 + Math.abs(Math.sin(t * 1.4 + i)) * 0.5;
        ctx.beginPath(); ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 255, 230, ${tw * 0.35})`;
        ctx.fill();
      }

      // planet
      const pr = R * 0.11;
      const g = ctx.createRadialGradient(cx - pr * 0.35, cy - pr * 0.35, pr * 0.1, cx, cy, pr);
      g.addColorStop(0, "rgba(0, 240, 255, 0.5)");
      g.addColorStop(0.55, "rgba(0, 100, 80, 0.5)");
      g.addColorStop(1, "rgba(2, 15, 12, 0.9)");
      ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2);
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = "rgba(0, 240, 255, 0.45)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, pr * 1.22, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.13)"; ctx.lineWidth = 5; ctx.stroke();

      // uplink cone
      const coneA = -Math.PI / 2 + Math.sin(t * 0.5) * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R * 0.44, coneA - 0.15, coneA + 0.15);
      ctx.closePath();
      ctx.fillStyle = "rgba(0, 240, 255, 0.04)";
      ctx.fill();

      // orbits + sats
      orbits.forEach(o => {
        const isActive = activeId === o.id;
        const isHover = hoverRef.current === o.id;

        ctx.save();
        ctx.translate(cx, cy); ctx.rotate(o.tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, R * o.a, R * o.a * (1 - o.ecc), 0, 0, Math.PI * 2);
        ctx.strokeStyle = isActive ? "rgba(0, 240, 255, .7)" : "rgba(0, 240, 255, .14)";
        ctx.lineWidth = isActive ? 1.4 : 0.7;
        ctx.setLineDash(isActive ? [] : [3, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        const p = pos(o, t);
        nodePos.current.set(o.id, p);

        // trail
        for (let k = 1; k <= 12; k++) {
          const tp = pos(o, t - k * 0.045);
          ctx.beginPath(); ctx.arc(tp.x, tp.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 240, 255, ${0.18 * (1 - k / 12)})`;
          ctx.fill();
        }

        // downlink beam
        if (isActive || isHover) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(cx, cy);
          ctx.strokeStyle = "rgba(0, 240, 255, .35)";
          ctx.setLineDash([2, 5]); ctx.lineWidth = 1; ctx.stroke();
          ctx.setLineDash([]);
        }

        const rad = isActive ? 7 : 4.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, rad * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? "rgba(0, 240, 255, .14)" : "rgba(0, 240, 255, .05)";
        ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? "#c0fff0" : o.color;
        ctx.shadowColor = o.color;
        ctx.shadowBlur = isActive ? 18 : 7;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (isHover || isActive) {
          ctx.font = "600 10px 'IBM Plex Mono', monospace";
          const label = `${o.desig} ${o.name}`;
          const tw2 = ctx.measureText(label).width;
          ctx.fillStyle = "rgba(2, 4, 10, .92)";
          ctx.fillRect(p.x - tw2 / 2 - 7, p.y - rad - 24, tw2 + 14, 17);
          ctx.strokeStyle = "rgba(0, 240, 255, .55)"; ctx.lineWidth = 1;
          ctx.strokeRect(p.x - tw2 / 2 - 7, p.y - rad - 24, tw2 + 14, 17);
          ctx.fillStyle = "#c0fff0"; ctx.textAlign = "center";
          ctx.fillText(label, p.x, p.y - rad - 12);
        }
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", fit);
      cv.removeEventListener("mousemove", onMove);
      cv.removeEventListener("click", onClick);
      cv.removeEventListener("mouseleave", onLeave);
    };
  }, [sats, activeId, onSelect]);

  return <canvas ref={ref} className="block w-full h-full" />;
}

/* ═══════════════════════════════════════════════════════
   TELEMETRY GRAPH — rolling waveform
   ═══════════════════════════════════════════════════════ */
export function TelemetryGraph({ color = "#00f0ff", label, unit }: { color?: string; label: string; unit: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    cv.width = 240; cv.height = 52;
    const data: number[] = new Array(60).fill(0.5);
    let raf = 0; let t = 0;

    const draw = () => {
      t += 0.05;
      data.shift();
      const nv = 0.5 + Math.sin(t) * 0.22 + Math.sin(t * 2.7) * 0.13 + (Math.random() - 0.5) * 0.07;
      data.push(Math.max(0.05, Math.min(0.95, nv)));
      if (Math.random() > 0.9) setVal(+(nv * 100).toFixed(1));

      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.strokeStyle = "rgba(0, 240, 255, .07)"; ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(0, (cv.height / 4) * i); ctx.lineTo(cv.width, (cv.height / 4) * i); ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, cv.height);
      data.forEach((d, i) => ctx.lineTo((i / (data.length - 1)) * cv.width, cv.height - d * cv.height));
      ctx.lineTo(cv.width, cv.height); ctx.closePath();
      ctx.fillStyle = `${color}18`; ctx.fill();
      ctx.beginPath();
      data.forEach((d, i) => {
        const x = (i / (data.length - 1)) * cv.width, y = cv.height - d * cv.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = color; ctx.lineWidth = 1.4;
      ctx.shadowColor = color; ctx.shadowBlur = 6; ctx.stroke(); ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [color]);

  return (
    <div className="tgraph">
      <div className="tgraph-head">
        <span>{label}</span>
        <b style={{ color }}>{val}{unit}</b>
      </div>
      <canvas ref={ref} className="w-full block h-[52px]" />
    </div>
  );
}
