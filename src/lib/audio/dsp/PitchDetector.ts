// Chromatic Pitch Detection & Instrument Tuning DSP (TunerActivity Replica)

export interface NoteInfo {
  note: string; // e.g. "A", "C#"
  octave: number; // e.g. 4
  frequency: number; // Detected Hz
  targetFrequency: number; // Ideal Hz for note
  cents: number; // -50 to +50 cents deviation
  inTune: boolean; // Math.abs(cents) <= 3
  clarity: number; // 0.0 to 1.0 (correlation confidence)
}

export interface InstrumentTuning {
  id: string;
  name: string;
  instrument: string;
  notes: { note: string; octave: number; freq: number }[];
}

export const INSTRUMENT_TUNINGS: InstrumentTuning[] = [
  {
    id: "chromatic",
    name: "Chromatic",
    instrument: "All Instruments",
    notes: [], // All notes accepted
  },
  {
    id: "guitar_standard",
    name: "Guitar (Standard)",
    instrument: "Guitar (E A D G B E)",
    notes: [
      { note: "E", octave: 2, freq: 82.41 },
      { note: "A", octave: 2, freq: 110.0 },
      { note: "D", octave: 3, freq: 146.83 },
      { note: "G", octave: 3, freq: 196.0 },
      { note: "B", octave: 3, freq: 246.94 },
      { note: "E", octave: 4, freq: 329.63 },
    ],
  },
  {
    id: "bass_standard",
    name: "Bass (Standard)",
    instrument: "Bass (E A D G)",
    notes: [
      { note: "E", octave: 1, freq: 41.2 },
      { note: "A", octave: 1, freq: 55.0 },
      { note: "D", octave: 2, freq: 73.42 },
      { note: "G", octave: 2, freq: 98.0 },
    ],
  },
  {
    id: "ukulele_c",
    name: "Ukulele (Standard C)",
    instrument: "Ukulele (G C E A)",
    notes: [
      { note: "G", octave: 4, freq: 392.0 },
      { note: "C", octave: 4, freq: 261.63 },
      { note: "E", octave: 4, freq: 329.63 },
      { note: "A", octave: 4, freq: 440.0 },
    ],
  },
  {
    id: "violin_standard",
    name: "Violin",
    instrument: "Violin (G D A E)",
    notes: [
      { note: "G", octave: 3, freq: 196.0 },
      { note: "D", octave: 4, freq: 293.66 },
      { note: "A", octave: 4, freq: 440.0 },
      { note: "E", octave: 5, freq: 659.25 },
    ],
  },
];

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/**
 * Autocorrelation Pitch Detection with Parabolic Peak Interpolation
 * Detects fundamental frequency f0 within range 30Hz - 1500Hz
 */
export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
  a4Ref: number = 440
): NoteInfo | null {
  // Check RMS energy to avoid detecting noise floor
  let sumSquares = 0;
  for (let i = 0; i < buffer.length; i++) {
    sumSquares += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(sumSquares / buffer.length);
  if (rms < 0.015) {
    return null; // Signal too quiet
  }

  // Frequency range constraints (30 Hz to 1500 Hz)
  const minPeriod = Math.floor(sampleRate / 1500);
  const maxPeriod = Math.floor(sampleRate / 30);

  // Autocorrelation calculation
  const bufferLen = buffer.length;
  let bestPeriod = -1;
  let maxCorrelation = 0;

  for (let period = minPeriod; period <= maxPeriod && period < bufferLen / 2; period++) {
    let correlation = 0;
    for (let i = 0; i < bufferLen - period; i++) {
      correlation += buffer[i] * buffer[i + period];
    }

    if (correlation > maxCorrelation) {
      maxCorrelation = correlation;
      bestPeriod = period;
    }
  }

  if (bestPeriod === -1 || maxCorrelation <= 0) {
    return null;
  }

  // Parabolic interpolation for sub-sample accuracy
  let periodPrecise = bestPeriod;
  if (bestPeriod > 0 && bestPeriod < bufferLen - 1) {
    let s0 = 0;
    let s1 = maxCorrelation;
    let s2 = 0;
    for (let i = 0; i < bufferLen - (bestPeriod - 1); i++) {
      s0 += buffer[i] * buffer[i + (bestPeriod - 1)];
    }
    for (let i = 0; i < bufferLen - (bestPeriod + 1); i++) {
      s2 += buffer[i] * buffer[i + (bestPeriod + 1)];
    }

    const delta = (s0 - s2) / (2 * (s0 - 2 * s1 + s2));
    if (Math.abs(delta) < 1) {
      periodPrecise = bestPeriod + delta;
    }
  }

  const frequency = sampleRate / periodPrecise;
  if (frequency < 30 || frequency > 1500) {
    return null;
  }

  // Convert frequency to MIDI note and cents offset
  // midi = 69 + 12 * log2(freq / a4Ref)
  const midiNumber = 69 + 12 * Math.log2(frequency / a4Ref);
  const roundedMidi = Math.round(midiNumber);
  const noteIndex = ((roundedMidi % 12) + 12) % 12;
  const octave = Math.floor(roundedMidi / 12) - 1;
  const noteName = NOTE_NAMES[noteIndex];

  // Target frequency for this exact MIDI note
  const targetFrequency = a4Ref * Math.pow(2, (roundedMidi - 69) / 12);
  const cents = Math.round(1200 * Math.log2(frequency / targetFrequency));

  return {
    note: noteName,
    octave,
    frequency: Math.round(frequency * 10) / 10,
    targetFrequency: Math.round(targetFrequency * 10) / 10,
    cents: Math.max(-50, Math.min(50, cents)),
    inTune: Math.abs(cents) <= 3,
    clarity: Math.min(1.0, maxCorrelation / sumSquares),
  };
}
