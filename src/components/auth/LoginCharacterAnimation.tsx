"use client";

export type LoginCharacterMood = "idle" | "email" | "password" | "peek" | "error" | "loading";

type Props = {
  mood: LoginCharacterMood;
  variant?: "participant" | "admin";
};

export function LoginCharacterAnimation({ mood, variant = "participant" }: Props) {
  const isAdmin = variant === "admin";
  const shake = mood === "error";
  const peek = mood === "peek";
  const hideEyes = mood === "password" || mood === "loading";
  const lookRight = mood === "email";

  return (
    <div
      className={`relative h-full min-h-[320px] w-full overflow-hidden ${
        isAdmin
          ? "bg-gradient-to-br from-[#0F2744] via-[#1a3a5c] to-[#0a1a2e]"
          : "bg-gradient-to-br from-slate-100 via-slate-50 to-teal-50"
      }`}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center p-8 ${shake ? "animate-auth-shake" : ""}`}
      >
        <svg
          viewBox="0 0 400 320"
          className="w-full max-w-md drop-shadow-sm"
          aria-hidden
        >
          {/* Orange blob */}
          <g className="animate-auth-float" style={{ animationDelay: "0s" }}>
            <path
              d="M40 220 Q40 140 120 130 Q200 120 210 200 Q220 260 120 270 Q40 280 40 220 Z"
              fill="#FF8A50"
            />
            {!hideEyes && (
              <g transform={lookRight ? "translate(18, 0)" : undefined}>
                <circle cx="95" cy="185" r="5" fill="#1a1a2e" className="transition-transform duration-300" />
                <circle cx="130" cy="182" r="5" fill="#1a1a2e" className="transition-transform duration-300" />
                {lookRight && (
                  <>
                    <circle cx="97" cy="185" r="2" fill="white" />
                    <circle cx="132" cy="182" r="2" fill="white" />
                  </>
                )}
              </g>
            )}
            {hideEyes && !peek && (
              <path d="M82 175 Q112 195 148 175" stroke="#1a1a2e" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
            {/* Hands covering eyes on password */}
            {(hideEyes || peek) && (
              <g className="transition-all duration-300">
                <ellipse cx="88" cy="178" rx="22" ry="14" fill="#FF8A50" stroke="#E56A30" strokeWidth="2" />
                <ellipse cx="138" cy="178" rx="22" ry="14" fill="#FF8A50" stroke="#E56A30" strokeWidth="2" />
                {peek && (
                  <circle cx="138" cy="178" r="4" fill="#1a1a2e" />
                )}
              </g>
            )}
          </g>

          {/* Purple rectangle */}
          <g className="animate-auth-float" style={{ animationDelay: "0.4s" }}>
            <rect x="155" y="70" width="55" height="150" rx="8" fill="#7B68EE" transform="rotate(-8 182 145)" />
            {!hideEyes && (
              <g transform={`rotate(-8 182 145) ${lookRight ? "translate(8, 0)" : ""}`}>
                <circle cx="172" cy="115" r="4" fill="#1a1a2e" />
                <path d="M168 128 Q182 135 196 128" stroke="#1a1a2e" strokeWidth="2" fill="none" />
              </g>
            )}
            {hideEyes && (
              <g transform="rotate(-8 182 145)">
                <rect x="158" y="105" width="48" height="28" rx="6" fill="#7B68EE" stroke="#5a4fd4" strokeWidth="2" />
              </g>
            )}
          </g>

          {/* Black tall character */}
          <g className="animate-auth-float" style={{ animationDelay: "0.2s" }}>
            <rect x="218" y="55" width="42" height="175" rx="6" fill="#1a1a2e" />
            {!hideEyes && (
              <g transform={lookRight ? "translate(6, 0)" : undefined}>
                <circle cx="232" cy="95" r="10" fill="white" />
                <circle cx="248" cy="95" r="10" fill="white" />
                <circle cx="234" cy="95" r="5" fill="#1a1a2e" />
                <circle cx="250" cy="95" r="5" fill="#1a1a2e" />
              </g>
            )}
            {hideEyes && (
              <>
                <rect x="224" y="82" width="30" height="22" rx="4" fill="#1a1a2e" stroke="#333" strokeWidth="2" />
                {peek && <circle cx="252" cy="93" r="5" fill="white" />}
              </>
            )}
          </g>

          {/* Gold / yellow pillar - BTX accent */}
          <g className="animate-auth-float" style={{ animationDelay: "0.6s" }}>
            <path
              d="M295 90 L340 90 L335 250 L300 250 Z"
              fill={isAdmin ? "#C9A227" : "#FFD54F"}
              rx="4"
            />
            <ellipse cx="317" cy="88" rx="28" ry="12" fill={isAdmin ? "#C9A227" : "#FFD54F"} />
            {!hideEyes && (
              <g transform={lookRight ? "translate(5, 0)" : undefined}>
                <circle cx="308" cy="130" r="4" fill="#1a1a2e" />
                <line x1="302" y1="148" x2="322" y2="148" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}
            {hideEyes && (
              <rect x="298" y="120" width="38" height="24" rx="5" fill={isAdmin ? "#C9A227" : "#FFD54F"} stroke="#c9a020" strokeWidth="2" />
            )}
          </g>
        </svg>
      </div>

      <div className={`absolute bottom-8 left-8 right-8 ${isAdmin ? "text-white/80" : "text-slate-500"}`}>
        <p className="text-sm font-medium">
          {isAdmin ? "BTX Admin Portal" : "BTX Participant Portal"}
        </p>
        <p className="text-xs mt-1 opacity-80">
          {mood === "password" || mood === "loading"
            ? "We won't peek at your password!"
            : mood === "peek"
              ? "Okay, we peeked a little..."
              : mood === "email"
                ? "Welcome back!"
                : "Bin Tuwaym Excellence"}
        </p>
      </div>
    </div>
  );
}
