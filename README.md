# 🎛️ BandLab Clone — Exact Mobile Replica & Cloud DAW

A high-performance, 100% free multi-track Digital Audio Workstation (DAW), vocal production workstation, and creator tools suite reverse-engineered directly from **BandLab Android APK v11.35.3 (`com.bandlab.bandlab`)**. Built for musicians, vocalists, and beatmakers to record, tune, produce beats, master tracks, and export studio-quality music with zero server compute costs.

[![Latest Release](https://img.shields.io/github/v/release/naitik99045/bandlabs-clone?label=Latest%20APK%20Release&color=00d2ff)](https://github.com/naitik99045/bandlabs-clone/releases/latest)
[![Tests Passing](https://img.shields.io/badge/Tests-25%20passing-success)](tests/daw.test.ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

### 📱 Download Android APK
👉 **[Download app-debug.apk (v1.1.1)](https://github.com/naitik99045/bandlabs-clone/releases/download/v1.1.1/app-debug.apk)** (5.04 MB)  
👉 **[View GitHub Release v1.1.1 Notes](https://github.com/naitik99045/bandlabs-clone/releases/tag/v1.1.1)**

---

## ✨ Features

### 🎛️ 5-Tab Mobile Navigation Shell (`NavigationActivity` Replica)
- **Feed:** Community music stream with waveform preview players, like/comment counters, and 1-tap **"Fork into Studio"** remixing.
- **Explore:** Search bar, genre chips (Trap, UK Drill, Lo-Fi, Hip Hop, Pop), and free royalty-free sound packs (*808 Heatwave Mafia*, *Smokey Dusty Rhodes*, *London Drill Arsenal*, *AutoPitch Vocal Chops*).
- **Create (+):** Centered elevated tactile hardware launcher opening the 8 creator tools.
- **Library:** Full multi-project manager with search, track counts, BPM/Key badges, and studio DAW open.
- **Profile:** Producer profile, engine diagnostics (0.0ms Web Audio core), and offline audio cache manager.

### 🎙️ All 24 Official BandLab Vocal FX Presets & AutoPitch
- Snapping vocals to 12 musical keys and scales across 5 intensity levels (Subtle to Hard-tune).
- Complete vocal suite (*Classic*, *Modern Rap*, *Amped*, *Robot*, *Big Harmony*, *Bitz*, *Chip*, *Drone*, *Duet*, *Futurescape*, *Gorgon*, *Halo*, *Hyper*, *Krafty*, *Natural*, *Ocean*, *Phone*, *Simulacrum*, *Stone*, *Third*, *Ultrashift*, *Voice Cleaner*, *De-Reverb*, *Noise Gate*).
- Real-time tube saturation drive, chorus shimmer, and semitone interval shifts.

### 🎚️ BandLab 8-Profile AI Mastering Suite (`MasteringActivity` Replica)
- Universal, Clarity, Fire, Tape, Natural, Spatial, Punch, and Cinematic algorithms.
- Real-time A/B bypass comparison switch, Intensity fader, Bass/Treble trim, timeline scrubbing, and offline master export.

### 🧰 Standalone Creator Tools Suite (`com.bandlab.tools` Replicas)
- **Chromatic Tuner:** Autocorrelation pitch detection (±3¢ Signal Mint in-tune indicator) with Guitar, Bass, Ukulele, and Violin presets.
- **Pro Metronome:** Fullscreen pendulum, tap-tempo calculator, time signatures (2/4 to 7/8), subdivisions, and 4 authentic BandLab APK audio samples (`clave`, `hat`, `rim`, `sineburst`).
- **AI SongStarter:** Instant chord progressions, key, BPM, and drum groove generation with 1-click studio DAW seeding.

### 🎙️ Multi-Take Vocal Recording & Comping (`About Takes`)
- Non-destructive vocal take tracking on track lanes with interactive Take pills (`Take 1`, `Take 2`, `Take 3...`), solo take auditioning (▶), and master comp promotion (★).

### 🎹 Multi-Track DAW Timeline & Audio Import
- Multi-channel timeline with track mute (`M`), solo (`S`), volume, pan faders, and track color coding.
- **Drag & Drop Audio Import:** Drop any instrumental backing beat (MP3/WAV) onto dedicated tracks with automated waveform peak rendering.
- **Live Microphone Capture:** `MicRecorder` with low-latency monitoring, live VU level meters, and automatic take placement onto vocal track lanes.
- Synchronized vertical playhead with sub-millisecond precision, time display (MM:SS.ms), adjustable BPM, and metronome click.

### 🥁 16-Step Beat Maker & Drum Machine
- 16-step matrix sequencer across 8 synthesized drum sounds:
  - Kick 808
  - Trap Snare
  - Bright Clap
  - Closed Hat
  - Open Hat
  - Sub 808 Bass
  - Rim / Perc
  - Crash Cymbal
- Live loop preview with step position indicator and automatic integration with the master mixdown.

### ⬇️ One-Click Client-Side "Download Music" (MP3 / WAV)
- Traditional DAWs render audio on expensive cloud server farms. This app reverse-engineers rendering to execute **faster-than-realtime directly inside the browser / device** via Web Audio `OfflineAudioContext`.
- Bakes imported backing beats, vocal takes with AutoPitch & effects, and drum machine patterns into:
  - **320 kbps MP3** (encoded via WebAssembly `@breezystack/lamejs`)
  - **24-bit PCM WAV** (uncompressed studio quality)
- Download starts instantly to the user's phone or computer with **$0 server cost**.

### 🔐 Supabase User Settings & Firebase Auth
- **Firebase Authentication:** Google OAuth, Email/Password, and 1-click Instant Guest mode.
- **Supabase PostgreSQL:** Dedicated `user_settings` table persisting user profile, default studio BPM/Key, vocal preset preferences, and export quality options with Row Level Security (RLS).

---

## 🏗️ Tech Stack & Architecture

```
[ Browser / Android Client ]
      │
      ├── Web Audio API + AudioWorklet (Real-Time DSP, AutoPitch, Mixer, Transport)
      ├── 60fps HTML5 Canvas (Waveform Visualization & Real-time Meters)
      ├── Firebase Client SDK (Auth, Sign-in with Google, Guest Session)
      │
      ├── Client-Side OfflineAudioContext ──► Instant MP3 / WAV Download
      │
      ▼
[ Supabase PostgreSQL ] (Stores User Preferences & Vocal Defaults with RLS)
```

| Layer | Technology |
| :--- | :--- |
| **Frontend DAW** | Next.js 15 (App Router, React 19, TypeScript) |
| **Styling & Theme** | Tailwind CSS, Radix UI, Lucide Icons (Dark Studio Theme) |
| **State Management** | Zustand (Atomic stores for Transport, Tracks, Mixer, Presets) |
| **Audio Core & DSP** | Web Audio API, Tone.js, Granular Pitch Shifter, LFO Chorus |
| **Mixdown Engine** | `OfflineAudioContext` + `@breezystack/lamejs` (WebAssembly) |
| **Authentication** | Firebase Authentication (Client SDK) |
| **User Settings DB** | Supabase (PostgreSQL with Row Level Security) |
| **Native Mobile App** | Capacitor Android (Java 17, Gradle 8.14, SDK 36) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm or pnpm

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/naitik99045/bandlabs-clone.git
cd bandlabs-clone
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase and Firebase configuration:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_project_number
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Compiling the Android Application

This repository includes a fully configured native Android project inside `android/` with hardware microphone and audio permissions.

### Build Android APK via Terminal:
```bash
# 1. Build and export the web bundle
npm run build

# 2. Sync web assets with Capacitor
npx cap sync android

# 3. Compile the Android APK
cd android
.\gradlew.bat assembleDebug
```
The compiled installable APK will be generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Open in Android Studio:
```bash
npx cap open android
```
From Android Studio, click **Run** to launch directly on an emulator or plugged-in Android device.

---

## 🗄️ Supabase Database Schema

To set up your `user_settings` table in Supabase, execute [`supabase/user_settings.sql`](./supabase/user_settings.sql) in your **Supabase Dashboard > SQL Editor**.

```sql
CREATE TABLE IF NOT EXISTS public.user_settings (
  id TEXT PRIMARY KEY, -- Linked to Firebase Auth UID
  email TEXT,
  display_name TEXT DEFAULT 'Producer',
  default_bpm NUMERIC DEFAULT 120.0,
  default_key TEXT DEFAULT 'C Major',
  default_vocal_preset TEXT DEFAULT 'Studio Rap',
  vocal_preferences JSONB,
  beat_preferences JSONB,
  export_preferences JSONB,
  saved_presets JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
```

---

## ⌨️ DAW Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `Space` | Play / Pause |
| `Esc` | Close active modal |
| `Click on Ruler` | Seek playhead |

---

## 📄 License
MIT License. Built for creators and developers worldwide.
