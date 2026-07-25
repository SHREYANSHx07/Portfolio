"use client";

import { useGameStore } from "@/hooks/useGameStore";

/**
 * Tiny WebAudio synth — no audio files, everything generated. All calls
 * no-op unless the visitor has opted into sound (off by default), and the
 * context is only created on the first user-gesture-driven call.
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!useGameStore.getState().sound) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  glideTo?: number,
) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, ac.currentTime + duration);
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

/** achievement unlock — a warm two-note chime */
export function sfxChime() {
  tone(880, 0.35, "sine", 0.06);
  setTimeout(() => tone(1318, 0.45, "sine", 0.05), 90);
}

/** shockwave / storm — a filtered noise whoosh */
export function sfxWhoosh() {
  const ac = audio();
  if (!ac) return;
  const len = ac.sampleRate * 0.35;
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2200, ac.currentTime);
  filter.frequency.exponentialRampToValueAtTime(200, ac.currentTime + 0.35);
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.08, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.35);
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start();
}

/** voxel pop — a quick rising blip */
export function sfxBlip() {
  tone(440, 0.12, "square", 0.03, 880);
}

/** theme / toggle — a soft low click */
export function sfxClick() {
  tone(220, 0.08, "sine", 0.05);
}
