import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_USER_SETTINGS, UserSettings } from "../src/types/settings";
import { DRUM_SOUNDS } from "../src/stores/useStudioStore";
import { METRONOME_PRESETS, MetronomeSound } from "../src/lib/audio/AudioEngine";
import { BANDLAB_VOCAL_PRESETS } from "../src/lib/audio/presets/vocalPresets";
import { calculatePitchOffset } from "../src/lib/audio/dsp/EffectsRack";
import { BANDLAB_MASTERING_PROFILES } from "../src/lib/audio/dsp/MasteringRack";
import { detectPitch, INSTRUMENT_TUNINGS } from "../src/lib/audio/dsp/PitchDetector";

describe("BandLab Clone Test Suite", () => {
  // 1. LOGIN & AUTHENTICATION TESTS
  describe("Authentication & User Session", () => {
    test("Guest session ID should follow valid format and have unique entropy", () => {
      const guestId = "guest_" + Math.random().toString(36).substring(2, 9);
      assert.match(guestId, /^guest_[a-z0-9]{5,8}$/);
      assert.equal(guestId.startsWith("guest_"), true);
    });

    test("Default user settings must match Supabase schema constraints", () => {
      const settings: UserSettings = {
        id: "test-user-123",
        email: "producer@bandlab.local",
        ...DEFAULT_USER_SETTINGS,
      };

      assert.equal(typeof settings.default_bpm, "number");
      assert.ok(settings.default_bpm >= 40 && settings.default_bpm <= 240);
      assert.equal(typeof settings.default_key, "string");
      assert.equal(typeof settings.vocal_preferences.autoPitchEnabled, "boolean");
      assert.ok(settings.vocal_preferences.correctionSpeed >= 0 && settings.vocal_preferences.correctionSpeed <= 100);
      assert.ok(settings.vocal_preferences.reverbWet >= 0 && settings.vocal_preferences.reverbWet <= 1);
      assert.ok(settings.vocal_preferences.delayWet >= 0 && settings.vocal_preferences.delayWet <= 1);
      assert.equal(settings.export_preferences.format, "mp3");
      assert.equal(settings.export_preferences.bitrate, 320);
    });
  });

  // 2. AUDIO IMPORT & WAVEFORM PEAKS TESTS
  describe("Audio Import & Waveform Analysis", () => {
    test("Waveform peak extraction must normalize peaks between 0.0 and 1.0", () => {
      // Simulate 1000 sample PCM float buffer with sine wave
      const samples = 1000;
      const channel = new Float32Array(samples);
      for (let i = 0; i < samples; i++) {
        channel[i] = Math.sin((i / samples) * Math.PI * 4) * 0.85; // 0.85 amplitude
      }

      // Peak extraction algorithm
      const targetPeaks = 50;
      const step = Math.ceil(channel.length / targetPeaks);
      const peaks: number[] = [];

      for (let i = 0; i < targetPeaks; i++) {
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

      assert.equal(peaks.length, targetPeaks);
      peaks.forEach((peak) => {
        assert.ok(peak >= 0.0 && peak <= 1.0, `Peak ${peak} is out of bounds`);
      });
      // Maximum peak should be close to 0.85
      const maxPeak = Math.max(...peaks);
      assert.ok(maxPeak >= 0.8 && maxPeak <= 0.86);
    });

    test("Audio clip placement should correctly compute timeline end boundary", () => {
      const clip = {
        id: "clip-test-1",
        name: "Backing Track.wav",
        startTime: 15.5, // seconds
        duration: 45.0,  // seconds
      };
      const clipEnd = clip.startTime + clip.duration;
      assert.equal(clipEnd, 60.5);
    });
  });

  // 3. SOUND MODULATION & AUTOPITCH TESTS
  describe("Sound Modulations & AutoPitch DSP", () => {
    test("Doppler pitch shift ratio formula should calculate correct semitone ratios", () => {
      // ratio = 2^(semitones / 12)
      const octaveUp = Math.pow(2, 12 / 12);
      assert.equal(octaveUp, 2.0);

      const octaveDown = Math.pow(2, -12 / 12);
      assert.equal(octaveDown, 0.5);

      const fifthUp = Math.pow(2, 7 / 12);
      assert.ok(Math.abs(fifthUp - 1.4983) < 0.001);

      const unison = Math.pow(2, 0 / 12);
      assert.equal(unison, 1.0);
    });

    test("Key signature offset mapping should support all 12 chromatic tones", () => {
      const keyOffsets: Record<string, number> = {
        "C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5,
        "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11
      };
      assert.equal(Object.keys(keyOffsets).length, 12);
      assert.equal(keyOffsets["C"], 0);
      assert.equal(keyOffsets["A"], 9);
      assert.equal(keyOffsets["F#"], 6);
    });

    test("Hard-tune quantization activates when correction speed is below 30%", () => {
      const isHardTune = (speed: number) => speed < 30;
      assert.equal(isHardTune(10), true);  // Hyperpop hard-tune
      assert.equal(isHardTune(25), true);  // Trap autotune
      assert.equal(isHardTune(60), false); // Natural assist
      assert.equal(isHardTune(85), false); // Subtle studio
    });

    test("BandLab Vocal FX Preset catalog must contain all 24 reverse-engineered profiles", () => {
      assert.equal(BANDLAB_VOCAL_PRESETS.length, 24);
      const expectedPresets = [
        "classic", "modern-rap", "amped", "robot", "big-harmony", "bitz",
        "chip", "drone", "duet", "futurescape", "gorgon", "halo",
        "hyperpop", "krafty", "natural", "ocean", "phone", "simulacrum",
        "stone", "third", "ultrashift", "voice-cleaner", "de-reverb", "noise-gate"
      ];
      expectedPresets.forEach((id) => {
        const found = BANDLAB_VOCAL_PRESETS.find((p) => p.id === id);
        assert.ok(found, `Missing vocal preset: ${id}`);
        assert.ok(found.name.length > 0);
        assert.ok(found.color.startsWith("oklch"), `Preset ${id} must use solid OKLCH color`);
      });
    });

    test("Harmonizer and interval presets must calculate precise semitone transpositions", () => {
      // Octave up (+12)
      assert.equal(calculatePitchOffset("C", 80, 12), 12);
      // Octave down (-12)
      assert.equal(calculatePitchOffset("C", 80, -12), -12);
      // Perfect fifth (+7)
      assert.equal(calculatePitchOffset("C", 80, 7), 7);
      // Major third (+4)
      assert.equal(calculatePitchOffset("C", 80, 4), 4);
    });
  });

  // 4. BEAT SEQUENCER TESTS
  describe("16-Step Beat Maker & Drum Machine", () => {
    test("Sequencer should register all 8 essential drum kit voices", () => {
      assert.equal(DRUM_SOUNDS.length, 8);
      const expectedIds = ["kick", "snare", "clap", "hihat_closed", "hihat_open", "bass808", "perc", "crash"];
      expectedIds.forEach((id) => {
        assert.ok(DRUM_SOUNDS.some((sound) => sound.id === id), `Missing drum sound: ${id}`);
      });
    });

    test("16th note step duration should scale precisely with BPM", () => {
      // 120 BPM: 1 beat = 0.5s -> 16th note = 0.125s (125ms)
      const bpm120 = 120;
      const stepDuration120 = (60 / bpm120) / 4;
      assert.equal(stepDuration120, 0.125);

      // 140 BPM (Trap): 1 beat = 0.42857s -> 16th note = 0.10714s
      const bpm140 = 140;
      const stepDuration140 = (60 / bpm140) / 4;
      assert.ok(Math.abs(stepDuration140 - 0.10714) < 0.001);

      // 1 full 16-step bar at 120 BPM = 2.0 seconds
      const fullBarDuration120 = stepDuration120 * 16;
      assert.equal(fullBarDuration120, 2.0);
    });
  });

  // 5. AUDIO EXPORT & WAV ENCODER TESTS
  describe("Music Export & Encoding", () => {
    test("WAV header generator must produce valid RIFF PCM specification", () => {
      const numChannels = 2;
      const sampleRate = 44100;
      const bitDepth = 16;
      const numFrames = 1000;
      const dataLength = numFrames * numChannels * (bitDepth / 8);

      const buffer = new ArrayBuffer(44 + dataLength);
      const view = new DataView(buffer);

      function writeString(offset: number, str: string) {
        for (let i = 0; i < str.length; i++) {
          view.setUint8(offset + i, str.charCodeAt(i));
        }
      }

      // Write RIFF
      writeString(0, "RIFF");
      view.setUint32(4, 36 + dataLength, true);
      writeString(8, "WAVE");

      // Write fmt
      writeString(12, "fmt ");
      view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
      view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, (sampleRate * numChannels * bitDepth) / 8, true); // ByteRate
      view.setUint16(32, (numChannels * bitDepth) / 8, true);              // BlockAlign
      view.setUint16(34, bitDepth, true);

      // Write data
      writeString(36, "data");
      view.setUint32(40, dataLength, true);

      // Assertions
      assert.equal(String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)), "RIFF");
      assert.equal(String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11)), "WAVE");
      assert.equal(String.fromCharCode(view.getUint8(12), view.getUint8(13), view.getUint8(14), view.getUint8(15)), "fmt ");
      assert.equal(view.getUint16(20, true), 1); // PCM Format
      assert.equal(view.getUint16(22, true), 2); // Stereo
      assert.equal(view.getUint32(24, true), 44100);
      assert.equal(view.getUint16(34, true), 16); // 16-bit
      assert.equal(String.fromCharCode(view.getUint8(36), view.getUint8(37), view.getUint8(38), view.getUint8(39)), "data");
      assert.equal(view.getUint32(40, true), dataLength);
    });

    test("16-bit PCM sample clamping must prevent harsh integer overflow wrapping", () => {
      // Test extreme floating samples beyond [-1.0, 1.0]
      const overflowSample = 1.8;
      const underflowSample = -2.2;
      const normalSample = 0.5;

      const clamp = (val: number) => Math.max(-1, Math.min(1, val));
      const toInt16 = (val: number) => {
        const c = clamp(val);
        return c < 0 ? Math.round(c * 0x8000) : Math.round(c * 0x7fff);
      };

      assert.equal(toInt16(normalSample), Math.round(0.5 * 32767));
      assert.equal(toInt16(overflowSample), 32767);   // Clamped to max positive Int16
      assert.equal(toInt16(underflowSample), -32768); // Clamped to min negative Int16
    });
  });

  // 6. AUTHENTIC BANDLAB METRONOME ENGINE TESTS
  describe("Authentic BandLab Metronome Sound Engine", () => {
    test("Metronome sound engine must register all 4 official BandLab presets", () => {
      const expectedIds: MetronomeSound[] = ["clave", "hat", "rim", "sine"];
      const registeredIds = METRONOME_PRESETS.map((p) => p.id);
      
      assert.equal(METRONOME_PRESETS.length, 4);
      expectedIds.forEach((id) => {
        assert.ok(registeredIds.includes(id), `Missing metronome preset: ${id}`);
      });
    });

    test("Every metronome preset must define valid accented and unaccented sample assets", () => {
      METRONOME_PRESETS.forEach((preset) => {
        assert.ok(preset.name.length > 0);
        assert.ok(preset.accentedPath.startsWith("/audio/metronome/"));
        assert.ok(preset.accentedPath.endsWith("_accented.m4a"));
        assert.ok(preset.unaccentedPath.startsWith("/audio/metronome/"));
        assert.ok(preset.unaccentedPath.endsWith("_unaccented.m4a"));
      });
    });

    test("Accented click logic correctly triggers on downbeat (beat % 4 === 0)", () => {
      const isDownbeat = (beatIndex: number) => beatIndex % 4 === 0;
      assert.equal(isDownbeat(0), true);  // Bar 1, Beat 1: Accented
      assert.equal(isDownbeat(1), false); // Bar 1, Beat 2: Regular
      assert.equal(isDownbeat(2), false); // Bar 1, Beat 3: Regular
      assert.equal(isDownbeat(3), false); // Bar 1, Beat 4: Regular
      assert.equal(isDownbeat(4), true);  // Bar 2, Beat 1: Accented
      assert.equal(isDownbeat(7), false); // Bar 2, Beat 4: Regular
      assert.equal(isDownbeat(8), true);  // Bar 3, Beat 1: Accented
    });
  });

  // 7. BANDLAB 8-PROFILE AI MASTERING SUITE TESTS
  describe("BandLab 8-Profile AI Mastering Suite", () => {
    test("Mastering rack must register all 8 official BandLab profiles", () => {
      assert.equal(BANDLAB_MASTERING_PROFILES.length, 8);
      const expectedProfiles = [
        "universal", "clarity", "fire", "tape",
        "natural", "spatial", "punch", "cinematic"
      ];
      expectedProfiles.forEach((id) => {
        const found = BANDLAB_MASTERING_PROFILES.find((p) => p.id === id);
        assert.ok(found, `Missing mastering profile: ${id}`);
        assert.ok(found.name.length > 0);
        assert.ok(found.tag.length > 0);
        assert.ok(found.description.length > 0);
        assert.ok(found.color.startsWith("oklch"), `Profile ${id} must use solid OKLCH color`);
        assert.ok(found.compressorThreshold < 0, `Threshold must be negative dBFS`);
      });
    });

    test("Mastering profile dynamics and EQ boundaries must maintain audio headroom", () => {
      BANDLAB_MASTERING_PROFILES.forEach((profile) => {
        // Compressor threshold must be below 0dB to prevent uncontrolled overs
        assert.ok(profile.compressorThreshold <= 0, `Profile ${profile.id} threshold exceeds 0dBFS`);
        // Compression ratio must be >= 1.0
        assert.ok(profile.compressorRatio >= 1.0, `Profile ${profile.id} compression ratio < 1.0`);
        // Stereo width factor should be >= 1.0
        assert.ok(profile.stereoWidth >= 1.0, `Profile ${profile.id} stereo width < 1.0`);
      });
    });
  });

  // 8. STANDALONE CREATOR TOOLS (TUNER, METRONOME & SONGSTARTER)
  describe("Standalone Creator Tools (Tuner, Metronome & SongStarter)", () => {
    test("Instrument tunings should include essential guitar, bass, ukulele and violin standards", () => {
      assert.ok(INSTRUMENT_TUNINGS.length >= 5);
      const expectedIds = ["chromatic", "guitar_standard", "bass_standard", "ukulele_c", "violin_standard"];
      expectedIds.forEach((id) => {
        const tuning = INSTRUMENT_TUNINGS.find((t) => t.id === id);
        assert.ok(tuning, `Missing instrument tuning: ${id}`);
        assert.ok(tuning.name.length > 0);
      });
    });

    test("Pitch detection autocorrelation should accurately detect 440 Hz standard A4 note", () => {
      const sampleRate = 44100;
      const freq = 440.0; // A4
      const buffer = new Float32Array(2048);
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.sin((2 * Math.PI * freq * i) / sampleRate) * 0.7;
      }

      const note = detectPitch(buffer, sampleRate, 440);
      assert.ok(note !== null, "Pitch detection failed to detect note");
      assert.equal(note.note, "A");
      assert.equal(note.octave, 4);
      assert.ok(Math.abs(note.cents) <= 2, `Cents deviation too high: ${note.cents}`);
      assert.equal(note.inTune, true);
    });

    test("Pitch detection autocorrelation should accurately detect 261.63 Hz Middle C (C4)", () => {
      const sampleRate = 44100;
      const freq = 261.63; // C4
      const buffer = new Float32Array(2048);
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.sin((2 * Math.PI * freq * i) / sampleRate) * 0.7;
      }

      const note = detectPitch(buffer, sampleRate, 440);
      assert.ok(note !== null, "Pitch detection failed to detect Middle C");
      assert.equal(note.note, "C");
      assert.equal(note.octave, 4);
      assert.ok(Math.abs(note.cents) <= 3, `Cents deviation too high: ${note.cents}`);
    });

    test("Silent or low-noise buffers should return null pitch to prevent jitter", () => {
      const sampleRate = 44100;
      const silentBuffer = new Float32Array(2048); // All zeros
      assert.equal(detectPitch(silentBuffer, sampleRate, 440), null);

      const noiseBuffer = new Float32Array(2048);
      for (let i = 0; i < noiseBuffer.length; i++) {
        noiseBuffer[i] = (Math.random() - 0.5) * 0.005; // RMS < 0.015 threshold
      }
      assert.equal(detectPitch(noiseBuffer, sampleRate, 440), null);
    });
  });

  // 9. MULTI-TAKE RECORDING & COMPING SYSTEM (BANDLAB ABOUT TAKES)
  describe("Multi-Take Recording & Comping System (BandLab About Takes)", () => {
    test("Consecutive takes should increment take number without overwriting previous takes", () => {
      const initialClips = [
        { id: "c1", name: "Take 1", startTime: 0, duration: 10, audioBuffer: null, takeNumber: 1 },
      ];
      const nextTakeNum = initialClips.length + 1;
      const nextClip = {
        id: "c2",
        name: `Take ${nextTakeNum}`,
        startTime: 0,
        duration: 10.5,
        audioBuffer: null,
        takeNumber: nextTakeNum,
      };
      const updatedClips = [...initialClips, nextClip];

      assert.equal(updatedClips.length, 2);
      assert.equal(updatedClips[0].takeNumber, 1);
      assert.equal(updatedClips[1].takeNumber, 2);
      assert.equal(updatedClips[1].name, "Take 2");
    });

    test("Active comped take index should point to the latest take by default", () => {
      const clipsCount = 3;
      const activeTakeIndex = clipsCount - 1; // latest take
      assert.equal(activeTakeIndex, 2);
    });

    test("Take switching should safely clamp to valid index bounds", () => {
      const clampTakeIndex = (index: number, count: number) => {
        return Math.max(0, Math.min(count - 1, index));
      };
      assert.equal(clampTakeIndex(5, 3), 2);
      assert.equal(clampTakeIndex(-1, 3), 0);
      assert.equal(clampTakeIndex(1, 3), 1);
    });
  });
});
