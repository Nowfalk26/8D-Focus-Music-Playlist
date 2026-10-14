import React from "react";

/**
 * SpatialAudioAnimation component
 * Exact source of truth from Google Stitch project:
 * - Stationary Human Silhouette with glowing cyan neon outline
 * - Seamlessly animated concentric elliptical orbital rings
 * - Harmonic gentle motion on audio waveform
 * - Soft cyan, violet, and magenta glow pulse
 * - Exact shapes, proportions, colors, and coordinates from reference artwork
 */
export default function SpatialAudioAnimation({ className = "", mode = "8d" }) {
  return (
    <div className={`relative w-full max-w-[720px] aspect-[16/9] flex items-center justify-center select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 1024 576"
        className="w-full h-full overflow-hidden"
        style={{ background: "transparent" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Master Neon Glow Filters */}
          <filter id="stitch-neon-cyan-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur1" />
            <feGaussianBlur stdDeviation="8" result="blur2" />
            <feGaussianBlur stdDeviation="18" result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="stitch-neon-mag-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur1" />
            <feGaussianBlur stdDeviation="10" result="blur2" />
            <feGaussianBlur stdDeviation="24" result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="stitch-core-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradients strictly matching the reference colors */}
          <linearGradient id="stitch-ring-outer-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.95" />
            <stop offset="20%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#c084fc" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#e879f9" stopOpacity="0.95" />
            <stop offset="85%" stopColor="#f43f5e" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fb923c" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="stitch-ring-mag-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#c026d3" stopOpacity="0.95" />
            <stop offset="75%" stopColor="#f43f5e" stopOpacity="1" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="stitch-ring-inner-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="35%" stopColor="#00f2fe" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#a855f7" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.7" />
          </linearGradient>

          {/* Waveform vertical gradient */}
          <linearGradient id="stitch-wave-grad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.2" />
            <stop offset="40%" stopColor="#00e5ff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="1" />
          </linearGradient>

          {/* Silhouette base glow */}
          <radialGradient id="stitch-subtle-head-glow" cx="514" cy="245" r="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00f5ff" stopOpacity="0.06" />
            <stop offset="70%" stopColor="#00f5ff" stopOpacity="0.01" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        <style>{`
          @keyframes stitchSubtlePulse {
            0%, 100% { opacity: 0.92; filter: drop-shadow(0 0 7px rgba(53, 223, 255, 0.75)); }
            50% { opacity: 1.0; filter: drop-shadow(0 0 12px rgba(83, 231, 255, 0.95)); }
          }

          @keyframes stitchOrbitDash1 {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -960; }
          }
          @keyframes stitchOrbitDash2 {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 840; }
          }
          @keyframes stitchOrbitDash3 {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -720; }
          }
          @keyframes stitchOrbitDash4 {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: 600; }
          }

          @keyframes stitchWaveA {
            0%, 100% { transform: scaleY(1); }
            33% { transform: scaleY(1.14); }
            66% { transform: scaleY(0.88); }
          }
          @keyframes stitchWaveB {
            0%, 100% { transform: scaleY(1); }
            33% { transform: scaleY(0.86); }
            66% { transform: scaleY(1.16); }
          }
          @keyframes stitchWaveC {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.18); }
          }

          @keyframes stitchTwinkle1 {
            0%, 100% { opacity: 0.85; transform: scale(1); }
            50% { opacity: 0.35; transform: scale(0.85); }
          }
          @keyframes stitchTwinkle2 {
            0%, 100% { opacity: 0.4; transform: scale(0.9); }
            50% { opacity: 0.95; transform: scale(1.15); }
          }

          .stitch-silhouette-stroke {
            animation: stitchSubtlePulse 6s ease-in-out infinite;
            transform-origin: 514px 250px;
          }

          .stitch-dash-1 {
            stroke-dasharray: 240 80 120 40;
            animation: stitchOrbitDash1 6s linear infinite;
          }
          .stitch-dash-2 {
            stroke-dasharray: 210 70 140 60;
            animation: stitchOrbitDash2 6s linear infinite;
          }
          .stitch-dash-3 {
            stroke-dasharray: 180 60 90 30;
            animation: stitchOrbitDash3 6s linear infinite;
          }
          .stitch-dash-4 {
            stroke-dasharray: 150 50 100 50;
            animation: stitchOrbitDash4 6s linear infinite;
          }

          .stitch-wave-a { transform-origin: 514px 215px; animation: stitchWaveA 6s ease-in-out infinite; }
          .stitch-wave-b { transform-origin: 514px 215px; animation: stitchWaveB 6s ease-in-out infinite; }
          .stitch-wave-c { transform-origin: 514px 215px; animation: stitchWaveC 6s ease-in-out infinite; }

          .stitch-twinkle-1 { animation: stitchTwinkle1 6s ease-in-out infinite; transform-origin: center; }
          .stitch-twinkle-2 { animation: stitchTwinkle2 6s ease-in-out infinite; transform-origin: center; }

          @media (prefers-reduced-motion: reduce) {
            .stitch-dash-1, .stitch-dash-2, .stitch-dash-3, .stitch-dash-4,
            .stitch-wave-a, .stitch-wave-b, .stitch-wave-c,
            .stitch-silhouette-stroke, .stitch-twinkle-1, .stitch-twinkle-2 {
              animation: none !important;
            }
          }
        `}</style>

        {/* 1. REAR ORBITAL RINGS (Behind Silhouette) */}
        <g id="rear-orbits" opacity="0.95">
          <ellipse cx="522" cy="254" rx="402" ry="176" fill="none" stroke="#00e5ff" strokeWidth="1.2" opacity="0.4" />
          <ellipse cx="522" cy="254" rx="392" ry="170" fill="none" stroke="url(#stitch-ring-outer-grad)" strokeWidth="2.2" filter="url(#stitch-neon-cyan-soft)" className="stitch-dash-1" />
          <ellipse cx="522" cy="254" rx="382" ry="164" fill="none" stroke="#ffffff" strokeWidth="1.0" opacity="0.8" className="stitch-dash-1" />
          
          <ellipse cx="522" cy="254" rx="368" ry="156" fill="none" stroke="url(#stitch-ring-mag-grad)" strokeWidth="3.2" filter="url(#stitch-neon-mag-soft)" className="stitch-dash-2" />
          <ellipse cx="522" cy="254" rx="356" ry="150" fill="none" stroke="#f43f5e" strokeWidth="1.8" opacity="0.9" className="stitch-dash-2" />
          <ellipse cx="522" cy="254" rx="344" ry="144" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity="0.85" className="stitch-dash-2" />
          
          <ellipse cx="522" cy="254" rx="330" ry="136" fill="none" stroke="url(#stitch-ring-mag-grad)" strokeWidth="2.8" filter="url(#stitch-neon-mag-soft)" className="stitch-dash-3" />
          <ellipse cx="522" cy="254" rx="316" ry="128" fill="none" stroke="#c084fc" strokeWidth="1.6" opacity="0.75" className="stitch-dash-3" />
          <ellipse cx="522" cy="254" rx="300" ry="120" fill="none" stroke="#00e5ff" strokeWidth="2.2" filter="url(#stitch-neon-cyan-soft)" className="stitch-dash-3" />
          <ellipse cx="522" cy="254" rx="286" ry="112" fill="none" stroke="#ffffff" strokeWidth="1.0" opacity="0.7" className="stitch-dash-3" />
          
          <ellipse cx="522" cy="254" rx="270" ry="104" fill="none" stroke="url(#stitch-ring-inner-cyan)" strokeWidth="2.4" filter="url(#stitch-neon-cyan-soft)" className="stitch-dash-4" />
          <ellipse cx="522" cy="254" rx="252" ry="96" fill="none" stroke="#e0f2fe" strokeWidth="1.2" opacity="0.8" className="stitch-dash-4" />
          <ellipse cx="522" cy="254" rx="232" ry="86" fill="none" stroke="#38bdf8" strokeWidth="1.8" opacity="0.65" className="stitch-dash-4" />
          <ellipse cx="522" cy="254" rx="212" ry="76" fill="none" stroke="#00e5ff" strokeWidth="1.2" opacity="0.4" />
        </g>

        {/* 2. AUDIO WAVEFORM (Behind Head, Upper-Middle Region) */}
        <g id="audio-waveform" filter="url(#stitch-neon-cyan-soft)">
          {/* Sub-group A */}
          <g className="stitch-wave-a">
            <line x1="288" y1="215" x2="288" y2="198" stroke="url(#stitch-wave-grad)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="298" y1="215" x2="298" y2="188" stroke="url(#stitch-wave-grad)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="308" y1="215" x2="308" y2="175" stroke="url(#stitch-wave-grad)" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="318" y1="215" x2="318" y2="190" stroke="url(#stitch-wave-grad)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="328" y1="215" x2="328" y2="162" stroke="url(#stitch-wave-grad)" strokeWidth="2.0" strokeLinecap="round" />
            <line x1="338" y1="215" x2="338" y2="182" stroke="url(#stitch-wave-grad)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="348" y1="215" x2="348" y2="148" stroke="url(#stitch-wave-grad)" strokeWidth="2.0" strokeLinecap="round" />
            <line x1="358" y1="215" x2="358" y2="195" stroke="url(#stitch-wave-grad)" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="368" y1="215" x2="368" y2="135" stroke="url(#stitch-wave-grad)" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="378" y1="215" x2="378" y2="170" stroke="url(#stitch-wave-grad)" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="388" y1="215" x2="388" y2="120" stroke="url(#stitch-wave-grad)" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="398" y1="215" x2="398" y2="145" stroke="url(#stitch-wave-grad)" strokeWidth="2.0" strokeLinecap="round" />
            <line x1="408" y1="215" x2="408" y2="105" stroke="url(#stitch-wave-grad)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          {/* Sub-group B */}
          <g className="stitch-wave-b">
            <line x1="418" y1="215" x2="418" y2="125" stroke="url(#stitch-wave-grad)" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="428" y1="215" x2="428" y2="92" stroke="url(#stitch-wave-grad)" strokeWidth="2.6" strokeLinecap="round" />
            <line x1="438" y1="215" x2="438" y2="140" stroke="url(#stitch-wave-grad)" strokeWidth="2.0" strokeLinecap="round" />
            <line x1="448" y1="215" x2="448" y2="85" stroke="url(#stitch-wave-grad)" strokeWidth="2.8" strokeLinecap="round" />
            <line x1="458" y1="215" x2="458" y2="130" stroke="url(#stitch-wave-grad)" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="468" y1="215" x2="468" y2="78" stroke="url(#stitch-wave-grad)" strokeWidth="3.0" strokeLinecap="round" />
            <line x1="478" y1="215" x2="478" y2="115" stroke="url(#stitch-wave-grad)" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="488" y1="215" x2="488" y2="88" stroke="url(#stitch-wave-grad)" strokeWidth="2.8" strokeLinecap="round" />
            <line x1="498" y1="215" x2="498" y2="135" stroke="url(#stitch-wave-grad)" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="508" y1="215" x2="508" y2="75" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />
            <line x1="518" y1="215" x2="518" y2="120" stroke="url(#stitch-wave-grad)" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="528" y1="215" x2="528" y2="84" stroke="url(#stitch-wave-grad)" strokeWidth="2.8" strokeLinecap="round" />
            <line x1="538" y1="215" x2="538" y2="130" stroke="url(#stitch-wave-grad)" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="548" y1="215" x2="548" y2="92" stroke="url(#stitch-wave-grad)" strokeWidth="2.6" strokeLinecap="round" />
            <line x1="558" y1="215" x2="558" y2="140" stroke="url(#stitch-wave-grad)" strokeWidth="2.0" strokeLinecap="round" />
            <line x1="568" y1="215" x2="568" y2="100" stroke="url(#stitch-wave-grad)" strokeWidth="2.6" strokeLinecap="round" />
          </g>
          {/* Sub-group C */}
          <g className="stitch-wave-c">
            <line x1="578" y1="215" x2="578" y2="115" stroke="url(#stitch-wave-grad)" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="588" y1="215" x2="588" y2="150" stroke="url(#stitch-wave-grad)" strokeWidth="2.0" strokeLinecap="round" />
            <line x1="598" y1="215" x2="598" y2="110" stroke="url(#stitch-wave-grad)" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="608" y1="215" x2="608" y2="165" stroke="url(#stitch-wave-grad)" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="618" y1="215" x2="618" y2="128" stroke="url(#stitch-wave-grad)" strokeWidth="2.0" strokeLinecap="round" />
            <line x1="628" y1="215" x2="628" y2="175" stroke="url(#stitch-wave-grad)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="638" y1="215" x2="638" y2="145" stroke="url(#stitch-wave-grad)" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="648" y1="215" x2="648" y2="190" stroke="url(#stitch-wave-grad)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="658" y1="215" x2="658" y2="168" stroke="url(#stitch-wave-grad)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="668" y1="215" x2="668" y2="202" stroke="url(#stitch-wave-grad)" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        </g>

        {/* 3. CENTRAL HUMAN SILHOUETTE (Stationary with subtle cyan-blue glow pulse) */}
        <g id="central-silhouette">
          {/* Solid black silhouette mask body covering rear elements */}
          <path
            d="M 292,576 C 305,510 326,450 380,412 C 422,382 432,364 430,326 C 426,306 414,295 412,268 C 410,248 412,230 415,208 C 424,142 458,95 514,95 C 570,95 604,142 613,208 C 616,230 618,248 616,268 C 614,295 602,306 598,326 C 596,364 606,382 648,412 C 702,450 723,510 736,576 Z"
            fill="#000000"
          />
          {/* Subtle inner atmosphere glow */}
          <ellipse cx="514" cy="245" rx="100" ry="140" fill="url(#stitch-subtle-head-glow)" />
          {/* Outer glow neon stroke */}
          <path
            className="stitch-silhouette-stroke"
            d="M 292,576 C 305,510 326,450 380,412 C 422,382 432,364 430,326 C 426,306 414,295 412,268 C 410,248 412,230 415,208 C 424,142 458,95 514,95 C 570,95 604,142 613,208 C 616,230 618,248 616,268 C 614,295 602,306 598,326 C 596,364 606,382 648,412 C 702,450 723,510 736,576"
            fill="none"
            stroke="#35dfff"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#stitch-neon-cyan-soft)"
          />
          {/* Crisp high-intensity core stroke */}
          <path
            className="stitch-silhouette-stroke"
            d="M 292,576 C 305,510 326,450 380,412 C 422,382 432,364 430,326 C 426,306 414,295 412,268 C 410,248 412,230 415,208 C 424,142 458,95 514,95 C 570,95 604,142 613,208 C 616,230 618,248 616,268 C 614,295 602,306 598,326 C 596,364 606,382 648,412 C 702,450 723,510 736,576"
            fill="none"
            stroke="#e0faff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#stitch-core-glow)"
          />
          {/* Ear contours */}
          <path
            className="stitch-silhouette-stroke"
            d="M 419,235 C 413,240 410,252 414,264 C 417,272 423,275 428,272 C 431,266 430,256 427,248"
            fill="none"
            stroke="#35dfff"
            strokeWidth="2.2"
            strokeLinecap="round"
            filter="url(#stitch-neon-cyan-soft)"
          />
          <path
            className="stitch-silhouette-stroke"
            d="M 609,235 C 615,240 618,252 614,264 C 611,272 605,275 600,272 C 597,266 598,256 601,248"
            fill="none"
            stroke="#35dfff"
            strokeWidth="2.2"
            strokeLinecap="round"
            filter="url(#stitch-neon-cyan-soft)"
          />
          <path
            className="stitch-silhouette-stroke"
            d="M 488,380 C 505,392 523,392 540,380"
            fill="none"
            stroke="#35dfff"
            strokeWidth="1.6"
            strokeDasharray="6 6"
            opacity="0.45"
          />
        </g>

        {/* 4. FOREGROUND ORBITAL RINGS (Sweeping in front of silhouette) */}
        <g id="foreground-orbits">
          <path
            d="M 120,254 C 120,351 300,430 522,430 C 744,430 924,351 924,254"
            fill="none"
            stroke="url(#stitch-ring-outer-grad)"
            strokeWidth="3.5"
            filter="url(#stitch-neon-cyan-soft)"
            className="stitch-dash-1"
          />
          <path
            d="M 120,254 C 120,351 300,430 522,430 C 744,430 924,351 924,254"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.4"
            opacity="0.9"
            className="stitch-dash-1"
          />

          <path
            d="M 154,254 C 154,340 318,410 522,410 C 726,410 890,340 890,254"
            fill="none"
            stroke="url(#stitch-ring-mag-grad)"
            strokeWidth="4.8"
            filter="url(#stitch-neon-mag-soft)"
            className="stitch-dash-2"
          />
          <path
            d="M 154,254 C 154,340 318,410 522,410 C 726,410 890,340 890,254"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.8"
            opacity="0.95"
            className="stitch-dash-2"
          />

          <path
            d="M 178,254 C 178,330 332,398 522,398 C 712,398 866,330 866,254"
            fill="none"
            stroke="#c026d3"
            strokeWidth="3.0"
            filter="url(#stitch-neon-mag-soft)"
            className="stitch-dash-3"
          />
          <path
            d="M 178,254 C 178,330 332,398 522,398 C 712,398 866,330 866,254"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            opacity="0.85"
            className="stitch-dash-3"
          />

          <path
            d="M 206,254 C 206,320 348,382 522,382 C 696,382 838,320 838,254"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="2.6"
            filter="url(#stitch-neon-cyan-soft)"
            className="stitch-dash-3"
          />
          <path
            d="M 206,254 C 206,320 348,382 522,382 C 696,382 838,320 838,254"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.0"
            opacity="0.8"
            className="stitch-dash-3"
          />

          <path
            d="M 236,254 C 236,310 364,366 522,366 C 680,366 808,310 808,254"
            fill="none"
            stroke="url(#stitch-ring-outer-grad)"
            strokeWidth="2.2"
            opacity="0.9"
            className="stitch-dash-4"
          />
          <path
            d="M 270,254 C 270,300 382,350 522,350 C 662,350 774,300 774,254"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.0"
            filter="url(#stitch-neon-mag-soft)"
            className="stitch-dash-4"
          />
          <path
            d="M 310,254 C 310,290 405,330 522,330 C 639,330 734,290 734,254"
            fill="none"
            stroke="#00e5ff"
            strokeWidth="1.8"
            filter="url(#stitch-neon-cyan-soft)"
            className="stitch-dash-1"
          />
        </g>

        {/* 5. PARTICLES AND STARS (Exact positions and subtle glow) */}
        <g id="particles-stars">
          <circle cx="563" cy="82" r="2.4" fill="#00e5ff" filter="url(#stitch-neon-cyan-soft)" className="stitch-twinkle-1" />
          <circle cx="532" cy="128" r="1.8" fill="#ffffff" className="stitch-twinkle-2" />
          <circle cx="622" cy="138" r="2.2" fill="#c084fc" className="stitch-twinkle-1" />
          <circle cx="711" cy="178" r="3.2" fill="#c026d3" filter="url(#stitch-neon-mag-soft)" className="stitch-twinkle-2" />
          <circle cx="784" cy="134" r="2.0" fill="#f43f5e" className="stitch-twinkle-1" />
          <circle cx="795" cy="168" r="2.6" fill="#e879f9" className="stitch-twinkle-2" />
          <circle cx="895" cy="272" r="2.2" fill="#f43f5e" className="stitch-twinkle-1" />
          <circle cx="219" cy="318" r="2.2" fill="#e879f9" className="stitch-twinkle-2" />
          <circle cx="236" cy="294" r="1.8" fill="#ffffff" className="stitch-twinkle-1" />
          <circle cx="127" cy="494" r="2.0" fill="#f43f5e" className="stitch-twinkle-2" />
          <circle cx="340" cy="495" r="2.2" fill="#00e5ff" className="stitch-twinkle-1" />
          <circle cx="674" cy="406" r="2.4" fill="#38bdf8" className="stitch-twinkle-2" />
          <circle cx="712" cy="628" r="1.8" fill="#ffffff" className="stitch-twinkle-1" />
          <circle cx="742" cy="580" r="2.5" fill="#fb923c" filter="url(#stitch-core-glow)" className="stitch-twinkle-2" />
        </g>
      </svg>
    </div>
  );
}
