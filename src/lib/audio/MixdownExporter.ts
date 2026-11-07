import { StudioTrack, DrumMatrix, DRUM_SOUNDS } from "@/stores/useStudioStore";
import { VocalPreferences } from "@/types/settings";
import { createVocalEffectsChain } from "./dsp/EffectsRack";
import { audioBufferToWav } from "./WavEncoder";

export interface MixdownOptions {
  tracks: StudioTrack[];
  drumMatrix: DrumMatrix;
  vocalSettings: VocalPreferences;
  bpm: number;
  durationSeconds?: number;
  format?: "mp3" | "wav";
  onProgress?: (pct: number) => void;
}

export async function exportMixdown(options: MixdownOptions): Promise<{ blob: Blob; filename: string }> {
  const {
    tracks,
    drumMatrix,
    vocalSettings,
    bpm,
    format = "wav",
    onProgress,
  } = options;

  // Calculate total duration needed based on clips or minimum 30s
  let maxClipEnd = 30;
  tracks.forEach((track) => {
    track.clips.forEach((clip) => {
      const end = clip.startTime + clip.duration;
      if (end > maxClipEnd) maxClipEnd = end;
    });
  });

  const totalDuration = options.durationSeconds || Math.min(180, Math.ceil(maxClipEnd + 2));
  const sampleRate = 44100;
  const totalSamples = Math.floor(sampleRate * totalDuration);

  onProgress?.(10);

  const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);
  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.9, 0);

  // Master Dynamics Limiter to prevent harsh clipping
  const limiter = offlineCtx.createDynamicsCompressor();
  limiter.threshold.setValueAtTime(-1.0, 0);
  limiter.knee.setValueAtTime(0, 0);
  limiter.ratio.setValueAtTime(20, 0);
  limiter.attack.setValueAtTime(0.002, 0);
  limiter.release.setValueAtTime(0.1, 0);

  masterGain.connect(limiter);
  limiter.connect(offlineCtx.destination);

  const hasSolo = tracks.some((t) => t.isSoloed);

  // 1. Render Audio Tracks (Beats, Vocals)
  for (const track of tracks) {
    if (track.isMuted) continue;
    if (hasSolo && !track.isSoloed) continue;

    const trackGain = offlineCtx.createGain();
    trackGain.gain.setValueAtTime(track.volume, 0);

    const trackPan = offlineCtx.createStereoPanner ? offlineCtx.createStereoPanner() : null;
    if (trackPan) {
      trackPan.pan.setValueAtTime(track.pan, 0);
      trackGain.connect(trackPan);
      trackPan.connect(masterGain);
    } else {
      trackGain.connect(masterGain);
    }

    // If vocal track, pass through vocal effects chain
    let trackInputNode: AudioNode = trackGain;
    if (track.type === "vocal") {
      const vocalRack = createVocalEffectsChain(offlineCtx as unknown as AudioContext, vocalSettings);
      vocalRack.output.connect(trackGain);
      trackInputNode = vocalRack.input;
    }

    // Schedule all clips on this track
    for (const clip of track.clips) {
      if (clip.audioBuffer) {
        const source = offlineCtx.createBufferSource();
        source.buffer = clip.audioBuffer;
        source.connect(trackInputNode);
        source.start(clip.startTime);
      }
    }
  }

  onProgress?.(40);

  // 2. Render Drum Sequencer Grid
  const secondsPerBeat = 60 / bpm;
  const secondsPer16th = secondsPerBeat / 4;
  const loopDuration = secondsPer16th * 16;
  const numLoops = Math.ceil(totalDuration / loopDuration);

  for (let loop = 0; loop < numLoops; loop++) {
    const loopStartTime = loop * loopDuration;
    if (loopStartTime >= totalDuration) break;

    for (let step = 0; step < 16; step++) {
      const stepTime = loopStartTime + step * secondsPer16th;
      if (stepTime >= totalDuration) break;

      for (let soundIdx = 0; soundIdx < 8; soundIdx++) {
        const drumStep = drumMatrix[soundIdx][step];
        if (drumStep && drumStep.active) {
          const soundId = DRUM_SOUNDS[soundIdx].id;
          triggerOfflineDrum(offlineCtx, masterGain, soundId, stepTime, drumStep.velocity);
        }
      }
    }
  }

  onProgress?.(70);

  // Render faster-than-realtime in browser!
  const renderedBuffer = await offlineCtx.startRendering();

  onProgress?.(90);

  // Format encoding
  let finalBlob: Blob;
  let ext = "wav";

  if (format === "mp3") {
    try {
      // Try lamejs MP3 encoding
      finalBlob = await encodeMp3(renderedBuffer);
      ext = "mp3";
    } catch {
      // Fallback to high-definition WAV
      finalBlob = audioBufferToWav(renderedBuffer);
      ext = "wav";
    }
  } else {
    finalBlob = audioBufferToWav(renderedBuffer);
    ext = "wav";
  }

  onProgress?.(100);

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `BandLab_Track_${timestamp}.${ext}`;

  return { blob: finalBlob, filename };
}

// Synthesize drums in OfflineAudioContext
function triggerOfflineDrum(
  ctx: OfflineAudioContext,
  destination: AudioNode,
  soundId: string,
  startTime: number,
  velocity: number
) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(velocity * 0.85, startTime);
  gain.connect(destination);

  switch (soundId) {
    case "kick": {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, startTime);
      osc.frequency.exponentialRampToValueAtTime(38, startTime + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      osc.connect(gain);
      osc.start(startTime);
      osc.stop(startTime + 0.36);
      break;
    }
    case "bass808": {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(75, startTime);
      osc.frequency.exponentialRampToValueAtTime(42, startTime + 0.2);
      gain.gain.setValueAtTime(velocity, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.9);
      osc.connect(gain);
      osc.start(startTime);
      osc.stop(startTime + 0.95);
      break;
    }
    case "snare": {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(200, startTime);
      osc.frequency.exponentialRampToValueAtTime(60, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.18);
      osc.connect(gain);
      osc.start(startTime);
      osc.stop(startTime + 0.19);
      break;
    }
    case "clap": {
      for (let i = 0; i < 3; i++) {
        const clapTime = startTime + i * 0.012;
        const osc = ctx.createOscillator();
        osc.type = "square";
        osc.frequency.setValueAtTime(800 + i * 100, clapTime);
        const cGain = ctx.createGain();
        cGain.gain.setValueAtTime(0.3 * velocity, clapTime);
        cGain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.08);
        osc.connect(cGain);
        cGain.connect(destination);
        osc.start(clapTime);
        osc.stop(clapTime + 0.09);
      }
      break;
    }
    case "hihat_closed": {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(8000, startTime);
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(7000, startTime);
      gain.gain.setValueAtTime(velocity * 0.45, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
      osc.connect(filter);
      filter.connect(gain);
      osc.start(startTime);
      osc.stop(startTime + 0.06);
      break;
    }
    case "hihat_open": {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.frequency.setValueAtTime(6500, startTime);
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(5000, startTime);
      gain.gain.setValueAtTime(velocity * 0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      osc.connect(filter);
      filter.connect(gain);
      osc.start(startTime);
      osc.stop(startTime + 0.36);
      break;
    }
    case "perc": {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, startTime);
      osc.frequency.exponentialRampToValueAtTime(150, startTime + 0.08);
      gain.gain.setValueAtTime(velocity * 0.7, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);
      osc.connect(gain);
      osc.start(startTime);
      osc.stop(startTime + 0.11);
      break;
    }
    case "crash": {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(3000, startTime);
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(4000, startTime);
      gain.gain.setValueAtTime(velocity * 0.5, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
      osc.connect(filter);
      filter.connect(gain);
      osc.start(startTime);
      osc.stop(startTime + 0.85);
      break;
    }
  }
}

// Convert AudioBuffer to MP3 via lamejs
async function encodeMp3(buffer: AudioBuffer): Promise<Blob> {
  const lamejs = await import("@breezystack/lamejs");
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 320);
  const mp3Data: Uint8Array[] = [];

  const left = buffer.getChannelData(0);
  const right = channels > 1 ? buffer.getChannelData(1) : left;

  // Convert Float32 to Int16
  const sampleBlockSize = 1152;
  const leftInt16 = new Int16Array(left.length);
  const rightInt16 = new Int16Array(right.length);

  for (let i = 0; i < left.length; i++) {
    leftInt16[i] = Math.max(-1, Math.min(1, left[i])) * 0x7fff;
    rightInt16[i] = Math.max(-1, Math.min(1, right[i])) * 0x7fff;
  }

  for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
    const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
    const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }

  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }

  return new Blob(mp3Data as unknown as BlobPart[], { type: "audio/mp3" });
}

// Trigger automatic browser download
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}
