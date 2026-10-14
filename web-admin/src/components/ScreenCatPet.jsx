import React, { useState, useEffect, useRef } from "react";
import { usePlayer } from "../context/PlayerContext";

/**
 * ScreenCatPet - An interactive house cat that roams, walks, runs (zoomies!),
 * sits, stretches, and loafs across the screen like a real pet cat roaming around a house!
 */
export default function ScreenCatPet() {
  const { setShowMiloChat } = usePlayer();

  // Position state (in pixels from left, and bottom offset)
  const [posX, setPosX] = useState(120);
  const [posY, setPosY] = useState(24); // px from bottom of viewport
  const [direction, setDirection] = useState(1); // 1 = facing right, -1 = facing left
  const [catAction, setCatAction] = useState("walking"); // walking, running, sitting, loafing, stretching, curious
  const [bubbleText, setBubbleText] = useState("");
  const [showHearts, setShowHearts] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);

  // References
  const targetXRef = useRef(350);
  const posXRef = useRef(120);
  const animFrameRef = useRef(null);
  const actionTimerRef = useRef(null);
  const bubbleTimerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  posXRef.current = posX;

  // Thought / Speech bubbles that pop up like a real companion pet
  const THOUGHT_BUBBLES = [
    "Macha, take a deep breath! ✨",
    "Drink some water bro 💧",
    "Click me if you need to talk!",
    "Zoomies time across the screen! ⚡",
    "Vibing to 8D spatial audio 🎧",
    "Don't overwork today, nanba!",
    "Stretch your back bro! 🧘‍♂️",
    "I'm keeping you company! 🐾",
  ];

  // Helper: show temporary thought bubble
  const triggerBubble = (text, duration = 4000) => {
    setBubbleText(text);
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => {
      setBubbleText("");
    }, duration);
  };

  // Behavior AI State Machine (changes activities every few seconds)
  useEffect(() => {
    const chooseNextBehavior = () => {
      if (isDragging || isHovered) return;

      const screenWidth = window.innerWidth || 1200;
      const minX = 40;
      const maxX = Math.max(minX + 200, screenWidth - 140);

      // Random activity roll
      const roll = Math.random();

      if (roll < 0.40) {
        // Walk to a random spot
        const newTarget = minX + Math.random() * (maxX - minX);
        targetXRef.current = newTarget;
        setDirection(newTarget > posXRef.current ? 1 : -1);
        setCatAction("walking");
      } else if (roll < 0.58) {
        // Sudden Zoomies! Runs fast across the room!
        const newTarget = minX + Math.random() * (maxX - minX);
        targetXRef.current = newTarget;
        setDirection(newTarget > posXRef.current ? 1 : -1);
        setCatAction("running");
        if (Math.random() < 0.35) {
          triggerBubble("ZOOMIES!! ⚡🐾", 2500);
        }
      } else if (roll < 0.80) {
        // Sit and look around curiously
        setCatAction("sitting");
        if (Math.random() < 0.25) {
          const randomThought = THOUGHT_BUBBLES[Math.floor(Math.random() * THOUGHT_BUBBLES.length)];
          triggerBubble(randomThought);
        }
      } else if (roll < 0.92) {
        // Loaf down for a cozy catnap
        setCatAction("loafing");
      } else {
        // Stretch arched back
        setCatAction("stretching");
      }
    };

    // Initial behavior
    chooseNextBehavior();
    actionTimerRef.current = setInterval(chooseNextBehavior, 5500);

    return () => {
      if (actionTimerRef.current) clearInterval(actionTimerRef.current);
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    };
  }, [isDragging, isHovered]);

  // Movement Physics Loop
  useEffect(() => {
    let lastTime = performance.now();

    const updatePhysics = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isDragging && !isHovered && (catAction === "walking" || catAction === "running")) {
        const current = posXRef.current;
        const target = targetXRef.current;
        const dist = target - current;

        // Speed: walking ~ 85px/s, running ~ 260px/s
        const speed = catAction === "running" ? 280 : 95;
        const step = speed * dt;

        if (Math.abs(dist) < 5) {
          // Reached destination! Sit and rest
          setPosX(target);
          setCatAction("sitting");
        } else {
          const moveDir = dist > 0 ? 1 : -1;
          setDirection(moveDir);
          const nextX = current + moveDir * step;

          // Screen edge boundaries
          const screenWidth = window.innerWidth || 1200;
          const clampedX = Math.max(30, Math.min(screenWidth - 130, nextX));
          setPosX(clampedX);
        }
      }

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [catAction, isDragging, isHovered]);

  // Handle Dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: posX,
      startY: posY,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = dragStartRef.current.y - e.clientY; // inverted for bottom offset

      const newX = Math.max(20, Math.min(window.innerWidth - 120, dragStartRef.current.startX + dx));
      const newY = Math.max(12, Math.min(window.innerHeight - 150, dragStartRef.current.startY + dy));

      setPosX(newX);
      setPosY(newY);
      targetXRef.current = newX;
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setCatAction("sitting");
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Click on cat: show hearts and open chat with friend!
  const handleClick = () => {
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 1400);
    triggerBubble("Hey macha! Opening chat with me...", 1500);
    setTimeout(() => {
      setShowMiloChat(true);
    }, 350);
  };

  return (
    <div
      style={{
        position: "fixed",
        left: `${posX}px`,
        bottom: `${posY}px`,
        transform: `scaleX(${direction})`,
        transformOrigin: "center bottom",
        zIndex: 45,
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        transition: isDragging ? "none" : "bottom 0.2s ease-out",
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="House Cat Pet - Roaming freely! Click me to talk to your best friend!"
    >
      {/* Speech / Thought Bubble (Unflipped so text is always readable!) */}
      {bubbleText && (
        <div
          style={{
            transform: `scaleX(${direction})`, // counter-flip so text is always normal
          }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#130b24]/95 text-cyan-200 border border-purple-400/40 px-3 py-1.5 rounded-2xl text-[11px] font-bold shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md pointer-events-auto cursor-pointer animate-bounce flex items-center gap-1.5"
          onClick={handleClick}
        >
          <span>{bubbleText}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
        </div>
      )}

      {/* Love Hearts effect when clicked / petted */}
      {showHearts && (
        <div
          style={{ transform: `scaleX(${direction})` }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 text-sm pointer-events-none animate-pulse"
        >
          <span className="animate-ping text-pink-400">💖</span>
          <span className="text-pink-300">✨</span>
          <span className="animate-ping text-pink-500">💕</span>
        </div>
      )}

      {/* Sleeping 'zzz' bubbles when loafing */}
      {catAction === "loafing" && (
        <div
          style={{ transform: `scaleX(${direction})` }}
          className="absolute -top-7 right-2 flex flex-col text-[10px] font-mono text-purple-300/80 pointer-events-none animate-pulse"
        >
          <span className="translate-x-2">z</span>
          <span className="translate-x-1 text-[11px]">Z</span>
          <span className="text-[12px] text-cyan-300">z</span>
        </div>
      )}

      {/* Speed lines when running */}
      {catAction === "running" && (
        <div
          style={{ transform: `scaleX(${direction})` }}
          className="absolute top-4 -left-6 pointer-events-none flex flex-col gap-1 opacity-70"
        >
          <span className="w-4 h-0.5 bg-cyan-400 rounded-full animate-pulse"></span>
          <span className="w-6 h-0.5 bg-purple-400 rounded-full animate-pulse delay-75"></span>
          <span className="w-3 h-0.5 bg-pink-400 rounded-full animate-pulse delay-150"></span>
        </div>
      )}

      {/* Clickable Cat Graphic Container */}
      <div onClick={handleClick} className="relative group p-1">
        <svg
          width="76"
          height="54"
          viewBox="0 0 100 70"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-[0_8px_16px_rgba(157,78,221,0.45)] group-hover:scale-105 transition-transform"
        >
          <defs>
            <linearGradient id="catFur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b1d6e" />
              <stop offset="50%" stopColor="#251247" />
              <stop offset="100%" stopColor="#140929" />
            </linearGradient>
            <linearGradient id="catBelly" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
            <linearGradient id="earPink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* Animated Tail */}
          <path
            d="M 22,40 C 12,32 6,24 10,14 C 13,7 20,8 18,16 C 16,22 19,30 24,38"
            fill="none"
            stroke="url(#catFur)"
            strokeWidth="5"
            strokeLinecap="round"
            className={`${
              catAction === "running"
                ? "animate-pulse"
                : catAction === "walking"
                ? "animate-bounce origin-bottom-right"
                : "animate-pulse"
            }`}
          />

          {/* Back Paws */}
          {catAction !== "loafing" && (
            <>
              {/* Back Left Leg */}
              <rect
                x="25"
                y="46"
                width="7"
                height={catAction === "sitting" ? "9" : "15"}
                rx="3.5"
                fill="#1e0f38"
                className={catAction === "walking" ? "animate-bounce" : ""}
              />
              {/* Back Right Leg */}
              <rect
                x="35"
                y="46"
                width="7"
                height={catAction === "sitting" ? "9" : "15"}
                rx="3.5"
                fill="#2c1452"
                className={catAction === "walking" ? "animate-pulse" : ""}
              />
            </>
          )}

          {/* Cat Main Body */}
          {catAction === "loafing" ? (
            // Cozy bread-loaf shape
            <ellipse cx="48" cy="46" rx="26" ry="16" fill="url(#catFur)" stroke="#9d4edd" strokeWidth="1.5" />
          ) : catAction === "stretching" ? (
            // Arched stretching shape
            <path
              d="M 22,46 Q 38,26 68,46 L 68,54 L 22,54 Z"
              fill="url(#catFur)"
              stroke="#9d4edd"
              strokeWidth="1.5"
            />
          ) : (
            // Standard rounded body
            <ellipse cx="46" cy="42" rx="24" ry="17" fill="url(#catFur)" stroke="#9d4edd" strokeWidth="1.5" />
          )}

          {/* Front Paws */}
          {catAction !== "loafing" && (
            <>
              {/* Front Left Leg */}
              <rect
                x="56"
                y="46"
                width="7"
                height={catAction === "sitting" ? "10" : "15"}
                rx="3.5"
                fill="#2c1452"
                className={catAction === "walking" ? "animate-pulse" : ""}
              />
              {/* Front Right Leg */}
              <rect
                x="65"
                y="46"
                width="7"
                height={catAction === "sitting" ? "10" : "15"}
                rx="3.5"
                fill="#3b1d6e"
                className={catAction === "walking" ? "animate-bounce" : ""}
              />
            </>
          )}

          {/* Cat Head */}
          <circle cx="70" cy="30" r="18" fill="url(#catFur)" stroke="#9d4edd" strokeWidth="1.5" />

          {/* Left Cat Ear */}
          <polygon points="62,17 56,3 70,11" fill="url(#catFur)" stroke="#9d4edd" strokeWidth="1.5" />
          <polygon points="62,15 58,6 68,12" fill="url(#earPink)" />

          {/* Right Cat Ear */}
          <polygon points="76,12 84,3 86,17" fill="url(#catFur)" stroke="#9d4edd" strokeWidth="1.5" />
          <polygon points="77,13 83,6 84,15" fill="url(#earPink)" />

          {/* Cyan 8D Mini Headphones on Cat */}
          <path d="M 60,25 A 13,13 0 0,1 82,25" fill="none" stroke="#00f0ff" strokeWidth="2.5" />
          <circle cx="58" cy="27" r="4" fill="#00f0ff" stroke="#3b82f6" strokeWidth="1" />
          <circle cx="83" cy="27" r="4" fill="#00f0ff" stroke="#3b82f6" strokeWidth="1" />

          {/* Cat Eyes */}
          {catAction === "loafing" ? (
            // Closed peaceful sleeping eyes (^ . ^)
            <>
              <path d="M 64,30 Q 67,27 70,30" fill="none" stroke="#e9d5ff" strokeWidth="2" strokeLinecap="round" />
              <path d="M 74,30 Q 77,27 80,30" fill="none" stroke="#e9d5ff" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            // Big curious luminous eyes
            <>
              <ellipse cx="67" cy="29" rx="3.5" ry="4" fill="#00f0ff" />
              <ellipse cx="67" cy="29" rx="1.8" ry="3.5" fill="#0f172a" />
              <circle cx="65.5" cy="27.5" r="1.2" fill="#ffffff" />

              <ellipse cx="78" cy="29" rx="3.5" ry="4" fill="#00f0ff" />
              <ellipse cx="78" cy="29" rx="1.8" ry="3.5" fill="#0f172a" />
              <circle cx="76.5" cy="27.5" r="1.2" fill="#ffffff" />
            </>
          )}

          {/* Cute Pink Nose */}
          <polygon points="73,34 71,32 75,32" fill="#f472b6" />

          {/* Whisker Lines */}
          <line x1="61" y1="33" x2="52" y2="31" stroke="#c4b5fd" strokeWidth="1" opacity="0.7" />
          <line x1="61" y1="35" x2="52" y2="36" stroke="#c4b5fd" strokeWidth="1" opacity="0.7" />
          <line x1="83" y1="33" x2="92" y2="31" stroke="#c4b5fd" strokeWidth="1" opacity="0.7" />
          <line x1="83" y1="35" x2="92" y2="36" stroke="#c4b5fd" strokeWidth="1" opacity="0.7" />
        </svg>

        {/* Tiny Status Tag */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#1a0f30]/90 px-1.5 py-0.5 rounded-full border border-purple-500/30 text-[9px] font-mono text-purple-300/80 pointer-events-none whitespace-nowrap">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              catAction === "running"
                ? "bg-cyan-400 animate-ping"
                : catAction === "loafing"
                ? "bg-purple-400"
                : "bg-emerald-400"
            }`}
          ></span>
          <span>{catAction}</span>
        </div>
      </div>
    </div>
  );
}
