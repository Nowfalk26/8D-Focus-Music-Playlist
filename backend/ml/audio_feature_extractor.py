#!/usr/bin/env python3
"""
Flow 8D Audio Feature Extractor
Real DSP and ML Acoustic Feature Extraction using NumPy and SciPy.
Extracts: Tempo (BPM), Energy, Danceability, Spectral Centroid, Rolloff, Contrast,
Zero-Crossing Rate, Calmness, and 10D normalized acoustic vector.
"""

import sys
import os
import json
import argparse
import hashlib
import numpy as np
import scipy.signal as signal
try:
    import soundfile as sf
    HAS_SOUNDFILE = True
except ImportError:
    HAS_SOUNDFILE = False

CACHE_FILE = os.path.join(os.path.dirname(__file__), "features_cache.json")


def load_cache():
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_cache(cache):
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2)
    except Exception as e:
        print(f"[WARN] Failed to write cache: {e}", file=sys.stderr)


def compute_spectral_features(y, sr):
    """
    Computes spectral centroid, rolloff (85%), bandwidth, and contrast
    using Short-Time Fourier Transform (STFT).
    """
    nperseg = min(2048, len(y))
    f, t, Zxx = signal.stft(y, fs=sr, nperseg=nperseg, noverlap=nperseg // 2)
    mag = np.abs(Zxx)
    power = mag ** 2

    total_mag = np.sum(mag, axis=0) + 1e-9
    # Spectral Centroid (Hz)
    centroid_t = np.sum(f[:, None] * mag, axis=0) / total_mag
    mean_centroid = float(np.mean(centroid_t))

    # Spectral Rolloff (frequency where 85% of power is below)
    cum_power = np.cumsum(power, axis=0)
    total_power = cum_power[-1, :] + 1e-9
    rolloff_idx = np.apply_along_axis(lambda col: np.searchsorted(col, 0.85 * col[-1]), 0, cum_power)
    rolloff_freqs = f[rolloff_idx]
    mean_rolloff = float(np.mean(rolloff_freqs))

    # Spectral Contrast (subbands difference)
    low_band = mag[f < 1000]
    high_band = mag[(f >= 1000) & (f < 8000)]
    contrast = 0.5
    if len(low_band) > 0 and len(high_band) > 0:
        low_peak = np.percentile(low_band, 90)
        high_valley = np.percentile(high_band, 10) + 1e-6
        contrast = float(np.clip((np.log10(low_peak + 1e-4) - np.log10(high_valley + 1e-4)) / 3.0, 0.0, 1.0))

    return mean_centroid, mean_rolloff, contrast


def estimate_tempo_and_danceability(y, sr):
    """
    Estimates BPM using spectral flux onset strength and autocorrelation peak detection.
    Also estimates danceability from the prominence of the primary rhythm peak.
    """
    hop_length = 512
    nperseg = 1024
    f, t, Zxx = signal.stft(y, fs=sr, nperseg=nperseg, noverlap=nperseg - hop_length)
    mag = np.abs(Zxx)

    # Half-wave rectified spectral flux
    flux = np.diff(mag, axis=1)
    flux = np.maximum(0, flux)
    onset_env = np.sum(flux, axis=0)

    if len(onset_env) < 20:
        return 100.0, 0.5

    # Standardize onset envelope
    onset_env = onset_env - np.mean(onset_env)
    norm = np.std(onset_env) + 1e-6
    onset_env = onset_env / norm

    # Autocorrelation of onset envelope
    autocorr = signal.correlate(onset_env, onset_env, mode='full')
    autocorr = autocorr[len(autocorr)//2:]

    # Frames per second
    fps = sr / hop_length
    # Range of candidate BPM: 55 to 190 BPM
    min_lag = int(fps * 60.0 / 190.0)
    max_lag = int(fps * 60.0 / 55.0)

    if max_lag >= len(autocorr):
        max_lag = len(autocorr) - 1

    if min_lag >= max_lag:
        return 100.0, 0.5

    search_region = autocorr[min_lag:max_lag]
    if len(search_region) == 0:
        return 100.0, 0.5

    best_lag_offset = np.argmax(search_region)
    best_lag = min_lag + best_lag_offset
    tempo = float(60.0 * fps / best_lag)

    # Harmonic / tempo doubling resolution
    if tempo < 65.0:
        tempo *= 2.0
    elif tempo > 185.0:
        tempo /= 2.0

    # Danceability: peak prominence compared to local mean
    peak_val = search_region[best_lag_offset]
    mean_val = np.mean(search_region) + 1e-6
    danceability = float(np.clip((peak_val - mean_val) / (np.max(search_region) + 1e-6), 0.1, 0.95))

    return round(tempo, 1), round(danceability, 3)


def extract_features_from_audio(file_path):
    """
    Reads an audio file and computes audio features.
    """
    if not HAS_SOUNDFILE:
        raise RuntimeError("soundfile library not installed")

    # Read audio with soundfile
    data, sr = sf.read(file_path)
    # Convert stereo to mono
    if len(data.shape) > 1:
        y = np.mean(data, axis=1)
    else:
        y = data

    # Limit to first 45 seconds for fast analysis
    max_samples = int(45 * sr)
    if len(y) > max_samples:
        y = y[:max_samples]

    duration_sec = float(len(data) / sr)

    # 1. RMS Energy
    rms = float(np.sqrt(np.mean(y ** 2)))
    # Normalized energy [0, 1]
    norm_energy = float(np.clip(rms * 4.5, 0.05, 0.98))

    # 2. Zero Crossing Rate (percussiveness / noisiness)
    zcr = float(np.mean(np.abs(np.diff(np.sign(y)))) / 2.0)

    # 3. Spectral Features
    centroid, rolloff, contrast = compute_spectral_features(y, sr)

    # 4. Tempo and Danceability
    tempo, danceability = estimate_tempo_and_danceability(y, sr)

    # 5. Acousticness: lower centroid and low ZCR indicates warm acoustic/calm track
    acousticness = float(np.clip(1.0 - (centroid / 4500.0) * 0.7 - norm_energy * 0.3, 0.05, 0.95))

    # 6. Valence / Mood estimate: bright centroid + moderate-high danceability
    valence = float(np.clip(0.3 * (centroid / 3500.0) + 0.4 * danceability + 0.3 * norm_energy, 0.1, 0.95))

    # 7. Calmness: inverse energy and lower tempo
    norm_tempo = float(np.clip((tempo - 50.0) / 130.0, 0.0, 1.0))
    calmness = float(np.clip(1.0 - (norm_energy * 0.6 + norm_tempo * 0.4), 0.05, 0.95))

    # 8. Normalized Spectral Centroid [0, 1]
    norm_centroid = float(np.clip((centroid - 400.0) / 4000.0, 0.0, 1.0))

    # 10-dimensional normalized vector:
    # [norm_tempo, norm_energy, danceability, valence, acousticness, norm_centroid, contrast, binaural_idx, spatial_depth, calmness]
    vector = [
        round(norm_tempo, 4),
        round(norm_energy, 4),
        round(danceability, 4),
        round(valence, 4),
        round(acousticness, 4),
        round(norm_centroid, 4),
        round(contrast, 4),
        0.5,   # Binaural frequency normalized prior (Alpha 10Hz)
        0.85,  # 8D spatial depth default
        round(calmness, 4)
    ]

    return {
        "tempo": tempo,
        "energy": round(norm_energy, 4),
        "danceability": danceability,
        "valence": round(valence, 4),
        "acousticness": round(acousticness, 4),
        "spectralCentroid": round(centroid, 1),
        "spectralRolloff": round(rolloff, 1),
        "spectralContrast": round(contrast, 4),
        "zeroCrossingRate": round(zcr, 4),
        "calmness": round(calmness, 4),
        "duration": duration_sec,
        "vector": vector,
        "isSynthesized": False
    }


def get_or_extract_features(identifier, file_path=None, fallback_category=None):
    """
    Checks the local cache for existing extracted features.
    If not cached and file exists, extracts using DSP.
    If file doesn't exist, derives realistic calibrated acoustic vector based on metadata.
    """
    cache = load_cache()
    if identifier in cache:
        return cache[identifier]

    # If physical audio file is available, extract with SciPy
    if file_path and os.path.exists(file_path):
        try:
            features = extract_features_from_audio(file_path)
            cache[identifier] = features
            save_cache(cache)
            return features
        except Exception as e:
            print(f"[WARN] Failed to analyze file {file_path}: {e}", file=sys.stderr)

    # Heuristic acoustic model for tracks with remote URLs or missing local cache
    features = generate_calibrated_features(fallback_category or "Deep Focus")
    cache[identifier] = features
    save_cache(cache)
    return features


def generate_calibrated_features(category):
    """
    Provides category-calibrated acoustic baseline vectors when offline
    or before complete waveform download.
    """
    cat_lower = (category or "").lower()
    
    if "deep focus" in cat_lower or "focus" in cat_lower:
        tempo = 110.0
        energy = 0.58
        danceability = 0.62
        acousticness = 0.35
        valence = 0.55
        centroid = 2200.0
        contrast = 0.60
        calmness = 0.65
    elif "binaural" in cat_lower:
        tempo = 90.0
        energy = 0.38
        danceability = 0.40
        acousticness = 0.70
        valence = 0.45
        centroid = 1400.0
        contrast = 0.45
        calmness = 0.82
    elif "nature" in cat_lower or "rain" in cat_lower:
        tempo = 65.0
        energy = 0.28
        danceability = 0.25
        acousticness = 0.90
        valence = 0.40
        centroid = 950.0
        contrast = 0.35
        calmness = 0.92
    elif "meditation" in cat_lower or "zen" in cat_lower:
        tempo = 72.0
        energy = 0.24
        danceability = 0.30
        acousticness = 0.85
        valence = 0.48
        centroid = 1100.0
        contrast = 0.40
        calmness = 0.90
    elif "ambient" in cat_lower or "noise" in cat_lower:
        tempo = 60.0
        energy = 0.32
        danceability = 0.20
        acousticness = 0.75
        valence = 0.35
        centroid = 1200.0
        contrast = 0.30
        calmness = 0.88
    elif "relax" in cat_lower:
        tempo = 78.0
        energy = 0.34
        danceability = 0.45
        acousticness = 0.65
        valence = 0.55
        centroid = 1600.0
        contrast = 0.48
        calmness = 0.80
    elif "energetic" in cat_lower or "edm" in cat_lower or "fast" in cat_lower:
        tempo = 128.0
        energy = 0.88
        danceability = 0.82
        acousticness = 0.15
        valence = 0.75
        centroid = 3400.0
        contrast = 0.75
        calmness = 0.25
    else:
        tempo = 95.0
        energy = 0.50
        danceability = 0.50
        acousticness = 0.50
        valence = 0.50
        centroid = 1800.0
        contrast = 0.50
        calmness = 0.60

    norm_tempo = float(np.clip((tempo - 50.0) / 130.0, 0.0, 1.0))
    norm_centroid = float(np.clip((centroid - 400.0) / 4000.0, 0.0, 1.0))

    vector = [
        round(norm_tempo, 4),
        round(energy, 4),
        round(danceability, 4),
        round(valence, 4),
        round(acousticness, 4),
        round(norm_centroid, 4),
        round(contrast, 4),
        0.5,
        0.85,
        round(calmness, 4)
    ]

    return {
        "tempo": tempo,
        "energy": energy,
        "danceability": danceability,
        "valence": valence,
        "acousticness": acousticness,
        "spectralCentroid": centroid,
        "spectralRolloff": centroid * 1.6,
        "spectralContrast": contrast,
        "zeroCrossingRate": 0.045,
        "calmness": calmness,
        "duration": 300.0,
        "vector": vector,
        "isSynthesized": True
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract audio features for Flow 8D ML Engine")
    parser.add_argument("--file", help="Path to audio file")
    parser.add_argument("--id", help="Unique song ID or URL", default="temp_song")
    parser.add_argument("--category", help="Category fallback", default="Deep Focus")
    args = parser.parse_args()

    res = get_or_extract_features(args.id, args.file, args.category)
    print(json.dumps(res, indent=2))
