// Master Web Audio Engine Singleton for BandLab Clone

export type MetronomeSound = "clave" | "hat" | "rim" | "sine";

export interface MetronomeSampleConfig {
  id: MetronomeSound;
  name: string;
  accentedPath: string;
  unaccentedPath: string;
}

export const METRONOME_PRESETS: MetronomeSampleConfig[] = [
  {
    id: "clave",
    name: "Latin Clave",
    accentedPath: "/audio/metronome/clave_accented.m4a",
    unaccentedPath: "/audio/metronome/clave_unaccented.m4a",
  },
  {
    id: "hat",
    name: "Studio Hi-Hat",
    accentedPath: "/audio/metronome/hat_accented.m4a",
    unaccentedPath: "/audio/metronome/hat_unaccented.m4a",
  },
  {
    id: "rim",
    name: "Wood Rimshot",
    accentedPath: "/audio/metronome/rim_accented.m4a",
    unaccentedPath: "/audio/metronome/rim_unaccented.m4a",
  },
  {
    id: "sine",
    name: "Sine Burst",
    accentedPath: "/audio/metronome/sineburst_accented.m4a",
    unaccentedPath: "/audio/metronome/sineburst_unaccented.m4a",
  },
];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private metronomeTimer: number | null = null;
  private playheadInterval: number | null = null;
  private metronomeBuffers: Map<string, AudioBuffer> = new Map();
  private metronomeSound: MetronomeSound = "clave";
  private isPreloadingMetronome: boolean = false;

  public isInitialized = false;

  public init() {
    if (typeof window === "undefined") return;
    if (this.ctx && this.ctx.state !== "closed") {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    // Analyser Node for visualizers & meters
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.isInitialized = true;
  }

  public getContext(): AudioContext {
    if (!this.ctx) {
      this.init();
    }
    return this.ctx!;
  }

  public getMasterGain(): GainNode | null {
    return this.masterGain;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setMasterVolume(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  // Synthesize realistic 808 & electronic drums on the fly (Zero asset latency)
  public triggerDrum(soundId: string, time: number = 0, velocity: number = 1.0) {
    const ctx = this.getContext();
    const startTime = time > 0 ? time : ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(velocity * 0.9, startTime);
    gain.connect(this.masterGain!);

    switch (soundId) {
      case "kick": {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(140, startTime);
        osc.frequency.exponentialRampToValueAtTime(35, startTime + 0.12);
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
        // Tonal snap + noise burst
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(200, startTime);
        osc.frequency.exponentialRampToValueAtTime(60, startTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.18);
        osc.connect(gain);
        osc.start(startTime);
        osc.stop(startTime + 0.19);

        // White noise
        const bufferSize = ctx.sampleRate * 0.2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "highpass";
        noiseFilter.frequency.setValueAtTime(1200, startTime);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(velocity * 0.6, startTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain!);
        noise.start(startTime);
        noise.stop(startTime + 0.21);
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
          cGain.connect(this.masterGain!);
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

  public setMetronomeSound(sound: MetronomeSound) {
    this.metronomeSound = sound;
    this.preloadMetronomeSamples().catch(() => {});
  }

  public getMetronomeSound(): MetronomeSound {
    return this.metronomeSound;
  }

  public async preloadMetronomeSamples(): Promise<void> {
    if (typeof window === "undefined" || this.isPreloadingMetronome) return;
    this.isPreloadingMetronome = true;
    try {
      this.init();
      const ctx = this.getContext();
      if (!ctx) return;

      const promises = METRONOME_PRESETS.flatMap((preset) => [
        this.loadMetronomeSample(preset.accentedPath, `${preset.id}_accented`),
        this.loadMetronomeSample(preset.unaccentedPath, `${preset.id}_unaccented`),
      ]);
      await Promise.allSettled(promises);
    } finally {
      this.isPreloadingMetronome = false;
    }
  }

  private async loadMetronomeSample(url: string, key: string): Promise<void> {
    if (this.metronomeBuffers.has(key)) return;
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const arrayBuffer = await res.arrayBuffer();
      const ctx = this.getContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.metronomeBuffers.set(key, audioBuffer);
    } catch {
      // Fallback silently if fetch or decode is unavailable
    }
  }

  // Play high/low accented click for metronome using authentic BandLab samples
  public playMetronomeClick(isHigh: boolean = false, time: number = 0, soundOverride?: MetronomeSound) {
    const ctx = this.getContext();
    const soundType = soundOverride || this.metronomeSound;
    const sampleKey = `${soundType}_${isHigh ? "accented" : "unaccented"}`;
    const cachedBuffer = this.metronomeBuffers.get(sampleKey);
    const clickTime = time > 0 ? time : ctx.currentTime;

    if (cachedBuffer) {
      try {
        const source = ctx.createBufferSource();
        source.buffer = cachedBuffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(isHigh ? 0.95 : 0.75, clickTime);
        source.connect(gain);
        gain.connect(this.masterGain || ctx.destination);
        source.start(clickTime);
        return;
      } catch {
        // In case of BufferSource failure, fallback to synthesized oscillator
      }
    }

    // High precision fallback synthesizer if sample is loading or offline
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = soundType === "sine" ? "sine" : "triangle";
    osc.frequency.setValueAtTime(isHigh ? 1320 : 880, clickTime);

    gain.gain.setValueAtTime(isHigh ? 0.35 : 0.2, clickTime);
    gain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);

    osc.start(clickTime);
    osc.stop(clickTime + 0.04);
  }

  // Decode audio file (MP3/WAV/OGG) from ArrayBuffer
  public async decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
    const ctx = this.getContext();
    return await ctx.decodeAudioData(arrayBuffer.slice(0));
  }

  // Generate waveform peaks for 2D Canvas rendering
  public extractPeaks(buffer: AudioBuffer, samples: number = 300): number[] {
    const channel = buffer.getChannelData(0);
    const step = Math.ceil(channel.length / samples);
    const peaks: number[] = [];

    for (let i = 0; i < samples; i++) {
      let min = 1.0;
      let max = -1.0;
      const start = i * step;
      const end = Math.min(start + step, channel.length);

      for (let j = start; j < end; j++) {
        const val = channel[j];
        if (val < min) min = val;
        if (val > max) max = val;
      }
      peaks.push(Math.max(Math.abs(min), Math.abs(max)));
    }
    return peaks;
  }
}

export const audioEngine = new AudioEngine();
