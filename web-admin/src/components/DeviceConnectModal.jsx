import React, { useState } from "react";
import { usePlayer } from "../context/PlayerContext";

export default function DeviceConnectModal({ isOpen, onClose }) {
  const {
    is8DActive,
    setIs8DActive,
    orbitSpeed,
    setOrbitSpeed,
    spatialDepth,
    setSpatialDepth,
  } = usePlayer();

  const [activeDevice, setActiveDevice] = useState("phone");
  const [deviceVolume, setDeviceVolume] = useState(85);

  if (!isOpen) return null;

  const devices = [
    {
      id: "phone",
      name: "This Phone",
      type: "Internal High-Res DAC",
      icon: "smartphone",
      isCurrent: activeDevice === "phone",
      badge: "Active",
    },
    {
      id: "bluetooth",
      name: "Bluetooth 8D Headphones",
      type: "Wireless Spatial Stereo",
      icon: "headphones",
      isCurrent: activeDevice === "bluetooth",
      badge: "8D Enhanced",
    },
    {
      id: "cast",
      name: "Living Room Speaker",
      type: "Google Cast / AirPlay",
      icon: "speaker_group",
      isCurrent: activeDevice === "cast",
      badge: "Ready",
    },
    {
      id: "orbit",
      name: "Flow 8D Binaural Engine",
      type: "Virtual 360° Spatial Stage",
      icon: "spatial_audio_off",
      isCurrent: activeDevice === "orbit",
      badge: "Immersive",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md transition-opacity p-0 sm:p-4">
      {/* Backdrop click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Sheet card */}
      <div className="relative w-full max-w-md bg-[#181818] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl z-10 select-none max-h-[90vh] overflow-y-auto">
        {/* Drag handle pill on mobile */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#1DB954] text-2xl">speaker_group</span>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Connect to a Device</h3>
              <p className="text-xs text-neutral-400">Spotify Connect & Flow 8D Output</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Current Active Output Highlight */}
        <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-[#1DB954]/15 via-black/40 to-transparent border border-[#1DB954]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#1DB954]/20 flex items-center justify-center text-[#1DB954]">
              <span className="material-symbols-outlined text-2xl animate-pulse">volume_up</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-[#1DB954]">Listening On</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-ping" />
              </div>
              <h4 className="text-sm font-semibold text-white">
                {devices.find((d) => d.id === activeDevice)?.name || "This Phone"}
              </h4>
            </div>
          </div>
          <span className="text-[11px] font-mono bg-[#1DB954] text-black font-bold px-2 py-0.5 rounded-full">
            Connected
          </span>
        </div>

        {/* Available Devices List */}
        <div className="mt-5">
          <span className="text-xs uppercase font-semibold tracking-wider text-neutral-400 px-1">
            Available Devices
          </span>
          <div className="mt-2 flex flex-col gap-1.5">
            {devices.map((device) => {
              const isSelected = activeDevice === device.id;
              return (
                <button
                  key={device.id}
                  onClick={() => setActiveDevice(device.id)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                    isSelected
                      ? "bg-white/10 border border-[#1DB954]/40"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-2xl ${
                        isSelected ? "text-[#1DB954]" : "text-neutral-400"
                      }`}
                    >
                      {device.icon}
                    </span>
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? "text-white font-bold" : "text-neutral-200"}`}>
                        {device.name}
                      </p>
                      <p className="text-xs text-neutral-400">{device.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-white/10 text-neutral-300 px-2 py-0.5 rounded">
                      {device.badge}
                    </span>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[#1DB954] text-lg font-bold">check</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 8D Binaural Spatializer Toggle */}
        <div className="mt-5 p-3.5 rounded-xl bg-[#242424] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#00f2fe] text-2xl">spatial_audio</span>
            <div>
              <p className="text-sm font-semibold text-white">8D Orbit Panning</p>
              <p className="text-xs text-neutral-400">Headphones recommended</p>
            </div>
          </div>
          <button
            onClick={() => setIs8DActive(!is8DActive)}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
              is8DActive ? "bg-[#1DB954]" : "bg-neutral-600"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                is8DActive ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="mt-5 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
            <span>Device Volume</span>
            <span className="font-mono text-white">{deviceVolume}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-neutral-400 text-lg">volume_down</span>
            <input
              type="range"
              min="0"
              max="100"
              value={deviceVolume}
              onChange={(e) => setDeviceVolume(Number(e.target.value))}
              className="w-full accent-[#1DB954] h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
            <span className="material-symbols-outlined text-neutral-400 text-lg">volume_up</span>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-full bg-[#1DB954] text-black font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
}
