"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type LoginCharacterMood = "idle" | "email" | "password" | "peek" | "error" | "loading";

type Props = {
  mood: LoginCharacterMood;
  variant?: "participant" | "admin";
};

type Point = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pupilOffset(eyeX: number, eyeY: number, target: Point, max = 5) {
  const dx = target.x - eyeX;
  const dy = target.y - eyeY;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const scale = Math.min(max, dist * 0.08);
  return { x: (dx / dist) * scale, y: (dy / dist) * scale };
}

function Eye({
  cx,
  cy,
  target,
  r = 9,
  pupilR = 5,
  closed = false,
  lookAway = false,
}: {
  cx: number;
  cy: number;
  target: Point;
  r?: number;
  pupilR?: number;
  closed?: boolean;
  lookAway?: boolean;
}) {
  if (closed) {
    return (
      <path
        d={`M${cx - r} ${cy} Q${cx} ${cy + 4} ${cx + r} ${cy}`}
        stroke="#1a1a2e"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    );
  }

  if (lookAway) {
    return (
      <>
        <circle cx={cx - 3} cy={cy} r={r} fill="white" stroke="#ddd" strokeWidth="1" />
        <circle cx={cx - 1} cy={cy} r={pupilR - 1} fill="#1a1a2e" />
      </>
    );
  }

  const offset = pupilOffset(cx, cy, target, r * 0.55);

  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="white" stroke="#e5e7eb" strokeWidth="1" />
      <circle cx={cx + offset.x} cy={cy + offset.y} r={pupilR} fill="#1a1a2e" />
    </>
  );
}

function Hand({ cx, cy, flip = false }: { cx: number; cy: number; flip?: boolean }) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={26}
      ry={16}
      fill="#FF8A50"
      stroke="#E56A30"
      strokeWidth="2"
      transform={flip ? `scale(-1,1) translate(${-2 * cx},0)` : undefined}
    />
  );
}

export function LoginCharacterAnimation({ mood, variant = "participant" }: Props) {
  const isAdmin = variant === "admin";
  const svgRef = useRef<SVGSVGElement>(null);
  const [target, setTarget] = useState<Point>({ x: 360, y: 180 });

  const trackPointer = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 480;
    const y = ((clientY - rect.top) / rect.height) * 400;
    setTarget({
      x: clamp(x, 0, 480),
      y: clamp(y, 0, 400),
    });
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => trackPointer(e.clientX, e.clientY);
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [trackPointer]);

  const shake = mood === "error";
  const peek = mood === "peek";
  const passwordMode = mood === "password" || mood === "loading";
  const trackMouse = !passwordMode && !peek;

  const lookTarget = trackMouse ? target : { x: 40, y: 200 };

  return (
    <div
      className={`relative h-full min-h-[360px] w-full overflow-hidden ${
        isAdmin
          ? "bg-gradient-to-br from-[#0F2744] via-[#1a3a5c] to-[#0a1a2e]"
          : "bg-gradient-to-br from-slate-100 via-slate-50 to-teal-50"
      }`}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center p-6 sm:p-10 ${
          shake ? "animate-auth-shake" : ""
        }`}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 480 400"
          className="w-full max-w-2xl h-auto drop-shadow-md"
          aria-hidden
        >
          {/* Orange blob — covers eyes on password */}
          <g className="animate-auth-float" style={{ animationDelay: "0s" }}>
            <path
              d="M30 280 Q20 160 130 145 Q240 130 255 230 Q270 320 140 335 Q30 350 30 280 Z"
              fill="#FF8A50"
            />
            {!passwordMode && !peek && (
              <g>
                <Eye cx={108} cy={218} target={lookTarget} r={10} pupilR={5} />
                <Eye cx={158} cy={214} target={lookTarget} r={10} pupilR={5} />
              </g>
            )}
            {passwordMode && (
              <>
                <path d="M95 205 Q132 225 172 205" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
                <Hand cx={95} cy={210} />
                <Hand cx={168} cy={210} flip />
              </>
            )}
            {peek && (
              <>
                <Hand cx={95} cy={210} />
                <ellipse cx={168} cy={210} rx={26} ry={16} fill="#FF8A50" stroke="#E56A30" strokeWidth="2" />
                <Eye cx={168} cy={210} target={lookTarget} r={8} pupilR={4} />
              </>
            )}
          </g>

          {/* Purple — looks away left on password */}
          <g
            className="animate-auth-float transition-transform duration-500"
            style={{
              animationDelay: "0.35s",
              transform: passwordMode || peek ? "translate(-28px, 6px) rotate(-18deg)" : undefined,
              transformOrigin: "200px 200px",
            }}
          >
            <rect x="168" y="75" width="68" height="185" rx="10" fill="#7B68EE" transform="rotate(-8 202 167)" />
            {!passwordMode && !peek && (
              <g transform="rotate(-8 202 167)">
                <Eye cx={188} cy={138} target={lookTarget} r={8} pupilR={4} />
                <Eye cx={218} cy={136} target={lookTarget} r={8} pupilR={4} />
                <path d="M183 162 Q203 172 223 162" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </g>
            )}
            {(passwordMode || peek) && (
              <g transform="rotate(-8 202 167)">
                <Eye cx={188} cy={138} target={lookTarget} closed lookAway />
                <Eye cx={218} cy={136} target={lookTarget} closed lookAway />
              </g>
            )}
          </g>

          {/* Black tall — big eyes, covers on password */}
          <g className="animate-auth-float" style={{ animationDelay: "0.18s" }}>
            <rect x="248" y="58" width="52" height="210" rx="8" fill="#1a1a2e" />
            {!passwordMode && !peek && (
              <g>
                <Eye cx={264} cy={118} target={lookTarget} r={13} pupilR={6} />
                <Eye cx={288} cy={118} target={lookTarget} r={13} pupilR={6} />
              </g>
            )}
            {passwordMode && (
              <>
                <ellipse cx={262} cy={115} rx={24} ry={14} fill="#FF8A50" stroke="#E56A30" strokeWidth="2" />
                <ellipse cx={286} cy={115} rx={24} ry={14} fill="#FF8A50" stroke="#E56A30" strokeWidth="2" />
              </>
            )}
            {peek && (
              <>
                <ellipse cx={262} cy={115} rx={24} ry={14} fill="#2a2a2a" stroke="#444" strokeWidth="2" />
                <Eye cx={288} cy={115} target={lookTarget} r={10} pupilR={5} />
              </>
            )}
          </g>

          {/* Yellow pillar — looks away right on password */}
          <g
            className="animate-auth-float transition-transform duration-500"
            style={{
              animationDelay: "0.55s",
              transform: passwordMode || peek ? "translate(32px, 4px) rotate(14deg)" : undefined,
              transformOrigin: "360px 200px",
            }}
          >
            <path d="M338 95 L398 95 L390 295 L346 295 Z" fill={isAdmin ? "#C9A227" : "#FFD54F"} />
            <ellipse cx={368} cy={92} rx={34} ry={14} fill={isAdmin ? "#C9A227" : "#FFD54F"} />
            {!passwordMode && !peek && (
              <g>
                <Eye cx={352} cy={155} target={lookTarget} r={8} pupilR={4} />
                <Eye cx={382} cy={153} target={lookTarget} r={8} pupilR={4} />
                <line x1={345} y1={178} x2={385} y2={178} stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            )}
            {(passwordMode || peek) && (
              <g>
                <Eye cx={352} cy={155} target={lookTarget} closed lookAway />
                <Eye cx={382} cy={153} target={lookTarget} closed lookAway />
              </g>
            )}
          </g>
        </svg>
      </div>

      <div className={`absolute bottom-8 left-8 right-8 ${isAdmin ? "text-white/80" : "text-slate-500"}`}>
        <p className="text-sm font-medium">
          {isAdmin ? "BTX Admin Portal" : "BTX Participant Portal"}
        </p>
        <p className="text-xs mt-1 opacity-80">
          {passwordMode
            ? "We won't peek at your password!"
            : peek
              ? "Okay, we peeked a little..."
              : mood === "email"
                ? "Welcome back!"
                : "Move your mouse — we're watching!"}
        </p>
      </div>
    </div>
  );
}
