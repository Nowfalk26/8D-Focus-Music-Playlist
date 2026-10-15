import React, { useState, useEffect, useRef } from "react";
import { aiChatApi } from "../api/api";
import { usePlayer } from "../context/PlayerContext";

export default function MiloCatChat({ isOpen = true, onClose, initialQuery = "" }) {
  const { playSong, currentSong, isPlaying, audioMode } = usePlayer();

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "milo",
      catMood: "happy_pet",
      text: "Hey macha! I'm Milo, your close friend here on Flow 8D. How's your day going, bro? Stressed with work or college, feeling low, excited, or just want to vent? Tell me what's on your mind—I'm here to listen and talk like a true friend. (And whenever you want some music to relax or vibe, just ask and I'll recommend the perfect tracks for your mood!)",
      songs: [],
      timestamp: "Just now",
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [catState, setCatState] = useState("happy_pet");
  const [petCount, setPetCount] = useState(0);
  const [showHeartEffect, setShowHeartEffect] = useState(false);
  const [prompts, setPrompts] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Load quick mood prompts
  useEffect(() => {
    aiChatApi
      .getPrompts()
      .then((res) => setPrompts(res.data?.data || []))
      .catch(() => {});
  }, []);

  // If opened with initial query from search bar, auto-send
  useEffect(() => {
    if (isOpen && initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
    }
  }, [isOpen, initialQuery]);

  // High-five / Vibe check with friend
  const handlePetCat = () => {
    setPetCount((prev) => prev + 1);
    setShowHeartEffect(true);
    setTimeout(() => setShowHeartEffect(false), 1500);

    const friendPhrases = [
      "I got your back, macha! Take a deep breath and tell me what's up.",
      "Stay strong bro! Remember you're doing much better than you give yourself credit for.",
      "Always here for you nanba! Whenever you need to vent or talk, I'm listening.",
    ];

    const randomReply = friendPhrases[Math.floor(Math.random() * friendPhrases.length)];
    setMessages((prev) => [
      ...prev,
      {
        id: `vibe-${Date.now()}`,
        sender: "milo",
        catMood: "happy_pet",
        text: randomReply,
        songs: [],
        timestamp: "Just now",
      },
    ]);
  };

  // Send message to Milo AI
  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setLoading(true);

    try {
      // Pass the last 6 messages as multi-turn conversation context
      const history = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await aiChatApi.sendMessage({ message: text, history, mode: audioMode });
      if (res.data?.success) {
        const { reply, catMood, emotion, songs } = res.data.data;
        setCatState(catMood || "happy_pet");

        const miloMsg = {
          id: `milo-${Date.now()}`,
          sender: "milo",
          catMood: catMood || "happy_pet",
          emotion,
          text: reply,
          songs: songs || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, miloMsg]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "milo",
          catMood: "peaceful_loaf",
          text: "Sorry bro, my connection had a tiny hiccup! But I'm right here now, what were you saying?",
          songs: [],
          timestamp: "Just now",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Animated Cute Cat Avatar Component
  const renderCatAvatar = (state) => {
    let earColor = "#a855f7";
    let bodyColor = "#f3e8ff";
    let eyeExpression = "normal";

    if (state === "cat_zoomies") {
      earColor = "#00f0ff";
      bodyColor = "#e0f2fe";
      eyeExpression = "wide";
    } else if (state === "comforting_cuddle") {
      earColor = "#f472b6";
      bodyColor = "#fdf2f8";
      eyeExpression = "caring";
    } else if (state === "headphone_dj") {
      earColor = "#38bdf8";
      bodyColor = "#e0f2fe";
      eyeExpression = "cool";
    }

    return (
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
        {/* Glow Aura */}
        <div
          className={`absolute inset-0 rounded-full blur-xl opacity-60 transition-all duration-500 ${
            state === "cat_zoomies"
              ? "bg-cyan-400 animate-pulse"
              : state === "comforting_cuddle"
              ? "bg-pink-400"
              : state === "headphone_dj"
              ? "bg-purple-500 animate-spin"
              : "bg-purple-600"
          }`}
          style={{ animationDuration: "12s" }}
        />

        {/* SVG Animated Cat Face & Body */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full relative z-10 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-105 cursor-pointer"
          onClick={handlePetCat}
          title="Click to Pet Milo! 🐾"
        >
          {/* Left Cat Ear */}
          <polygon
            points="24,32 12,12 38,20"
            fill={bodyColor}
            stroke={earColor}
            strokeWidth="2.5"
            className="transition-transform origin-[24px_32px] hover:-rotate-6"
          />
          <polygon points="23,28 17,17 33,22" fill="#f472b6" opacity="0.8" />

          {/* Right Cat Ear */}
          <polygon
            points="76,32 88,12 62,20"
            fill={bodyColor}
            stroke={earColor}
            strokeWidth="2.5"
            className="transition-transform origin-[76px_32px] hover:rotate-6"
          />
          <polygon points="77,28 83,17 67,22" fill="#f472b6" opacity="0.8" />

          {/* Headphone Band */}
          <path
            d="M 18,36 A 35,35 0 0,1 82,36"
            fill="none"
            stroke="#9d4edd"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Headphone Left Ear Cup */}
          <circle cx="16" cy="38" r="9" fill="#00f0ff" stroke="#3b82f6" strokeWidth="2" />
          <circle cx="16" cy="38" r="4" fill="#1e1b4b" />

          {/* Headphone Right Ear Cup */}
          <circle cx="84" cy="38" r="9" fill="#00f0ff" stroke="#3b82f6" strokeWidth="2" />
          <circle cx="84" cy="38" r="4" fill="#1e1b4b" />

          {/* Cat Head */}
          <ellipse cx="50" cy="50" rx="35" ry="32" fill={bodyColor} stroke="#9333ea" strokeWidth="2" />

          {/* Cute Cat Eyes */}
          {state === "comforting_cuddle" ? (
            // Curved closed blissful eyes
            <>
              <path d="M 33,48 Q 40,43 47,48" fill="none" stroke="#581c87" strokeWidth="3" strokeLinecap="round" />
              <path d="M 53,48 Q 60,43 67,48" fill="none" stroke="#581c87" strokeWidth="3" strokeLinecap="round" />
            </>
          ) : state === "happy_pet" ? (
            // Sparkly happy eyes
            <>
              <path d="M 34,48 Q 40,42 46,48" fill="none" stroke="#6b21a8" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 54,48 Q 60,42 66,48" fill="none" stroke="#6b21a8" strokeWidth="3.5" strokeLinecap="round" />
            </>
          ) : (
            // Big anime cat eyes
            <>
              <ellipse cx="38" cy="46" rx="6.5" ry="8" fill="#1e1b4b" />
              <circle cx="36" cy="43" r="2.5" fill="#ffffff" />
              <circle cx="40" cy="48" r="1.2" fill="#ffffff" />

              <ellipse cx="62" cy="46" rx="6.5" ry="8" fill="#1e1b4b" />
              <circle cx="60" cy="43" r="2.5" fill="#ffffff" />
              <circle cx="64" cy="48" r="1.2" fill="#ffffff" />
            </>
          )}

          {/* Blushing Pink Cheeks */}
          <ellipse cx="28" cy="55" rx="5" ry="3" fill="#f472b6" opacity="0.6" />
          <ellipse cx="72" cy="55" rx="5" ry="3" fill="#f472b6" opacity="0.6" />

          {/* Pink Nose */}
          <polygon points="50,56 46,52 54,52" fill="#ec4899" />

          {/* Cat Mouth (:3) */}
          <path
            d="M 45,56 Q 48,60 50,57 Q 52,60 55,56"
            fill="none"
            stroke="#581c87"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Cute Whiskers */}
          <line x1="20" y1="52" x2="6" y2="49" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="56" x2="8" y2="57" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="80" y1="52" x2="94" y2="49" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="80" y1="56" x2="92" y2="57" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" />

          {/* Little DJ Bell on Collar */}
          <circle cx="50" cy="74" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
        </svg>

        {/* Floating Heart Effect when petted */}
        {showHeartEffect && (
          <div className="absolute -top-4 right-2 text-2xl animate-bounce pointer-events-none z-20">
            💖
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Cat Lounge Container */}
      <div className="relative w-full max-w-2xl h-[88vh] max-h-[760px] rounded-2xl border border-white/10 bg-[#121212] shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-white/10 bg-[#181818] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {renderCatAvatar(catState)}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Milo</span>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30 font-semibold">
                    AI Music Companion
                  </span>
                </h3>
                <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" title="Online & Listening" />
              </div>
              <p className="text-xs text-neutral-400 font-medium flex items-center gap-1.5 mt-0.5">
                <span>Your empathetic 8D music advisor</span>
                <span className="text-neutral-600">•</span>
                <button
                  onClick={handlePetCat}
                  className="text-[#1DB954] hover:text-[#1ed760] font-semibold transition-colors"
                >
                  High-five ({petCount} vibes ✨)
                </button>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePetCat}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-transform active:scale-95"
            >
              <span>🤝 Vibe Check</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-neutral-300 hover:text-white flex items-center justify-center border border-white/10 transition-all text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick Topics Bar */}
        <div className="px-4 py-2.5 border-b border-white/5 bg-[#141414] overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <span>✨ Quick Moods:</span>
          </span>
          {prompts.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSendMessage(p.query)}
              className="px-3 py-1.5 rounded-full bg-[#242424] hover:bg-[#2e2e2e] text-neutral-200 hover:text-[#1DB954] text-xs font-medium border border-white/5 hover:border-[#1DB954]/30 transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
            >
              <span>{p.emoji}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 no-scrollbar">
          {messages.map((msg) => {
            const isMilo = msg.sender === "milo";

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isMilo ? "items-start" : "items-end justify-end"}`}
              >
                {/* Milo Mini Icon */}
                {isMilo && (
                  <div
                    onClick={handlePetCat}
                    className="w-8 h-8 rounded-full bg-[#242424] border border-white/10 flex items-center justify-center text-sm shrink-0 cursor-pointer hover:border-[#1DB954]/50 transition-transform hover:scale-105"
                    title="Pet me!"
                  >
                    🐱
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] flex flex-col space-y-2.5 ${
                    isMilo ? "items-start" : "items-end"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                      isMilo
                        ? "bg-[#242424] text-neutral-100 border border-white/5 rounded-tl-sm"
                        : "bg-[#1DB954] text-black font-semibold rounded-tr-sm"
                    }`}
                  >
                    {isMilo && msg.emotion && (
                      <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#1DB954]/15 text-[#1DB954] border border-[#1DB954]/30 text-[10px] font-bold mb-2">
                        ✨ Milo Sensed: {msg.emotion}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1.5 ${
                        isMilo ? "text-neutral-400" : "text-black/60 font-normal"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Optional song request prompt when Milo is having a pure friendly heart-to-heart */}
                  {isMilo && (!msg.songs || msg.songs.length === 0) && msg.id !== "welcome" && (
                    <button
                      onClick={() => handleSendMessage(`Milo, can you recommend some 8D songs for my ${msg.emotion || "mood"}?`)}
                      className="text-xs font-semibold text-[#1DB954] hover:text-[#1ed760] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#181818] hover:bg-[#242424] border border-white/10 transition-all self-start active:scale-95 shadow-sm"
                    >
                      <span>🎵 Ask Milo for 8D songs for this mood</span>
                    </button>
                  )}

                  {/* Playable Songs Cards rendered inside chat (Only when requested) */}
                  {isMilo && msg.songs && msg.songs.length > 0 && (
                    <div className="w-full space-y-2 pt-1">
                      <div className="text-xs font-bold text-neutral-300 flex items-center gap-1.5 px-1">
                        <span>🎧 Curated Recommendations:</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {msg.songs.map((song) => {
                          const isCurrent =
                            (currentSong?._id || currentSong?.id) === (song._id || song.id);

                          return (
                            <div
                              key={song._id || song.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                                isCurrent
                                  ? "bg-[#1f2e24] border-[#1DB954]"
                                  : "bg-[#181818] hover:bg-[#222222] border-white/5 hover:border-white/15"
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={
                                    song.imageUrl ||
                                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200"
                                  }
                                  alt={song.title}
                                  className="w-11 h-11 rounded-lg object-cover border border-white/10 shrink-0"
                                />
                                <div className="min-w-0">
                                  <h4 className="text-xs font-bold text-white truncate">
                                    {song.title}
                                  </h4>
                                  <p className="text-[11px] text-neutral-400 truncate">
                                    {song.artist}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-neutral-300 border border-white/10 font-mono">
                                      {song.duration || "04:00"}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1DB954]/15 text-[#1DB954] font-semibold">
                                      {song.matchScore || 95}% Match
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Play Button */}
                              <button
                                onClick={() => playSong(song)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all active:scale-95 ${
                                  isCurrent && isPlaying
                                    ? "bg-[#1DB954] text-black shadow-lg"
                                    : "bg-white hover:bg-neutral-200 text-black shadow"
                                }`}
                              >
                                {isCurrent && isPlaying ? (
                                  <>
                                    <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                                    <span>Playing</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Play</span>
                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#242424] border border-white/10 flex items-center justify-center text-sm animate-bounce">
                🐱
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-[#181818] border border-white/10 text-xs text-neutral-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-ping" />
                <span>Milo is curating music for your mood...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-[#181818] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Milo for music or tell him how you feel..."
                className="w-full bg-[#242424] border border-white/10 rounded-full px-4 py-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] transition-all pr-10"
              />
              <button
                type="button"
                onClick={handlePetCat}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm hover:scale-125 transition-transform"
                title="Give Milo a treat! 🐟"
              >
                🐟
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-5 py-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-md"
            >
              <span>Send</span>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
