# Project State & Context: BandLab Mobile Flow & Android APK Verification
**Last Updated:** 2026-11-09 14:33:00

## 1. Project Overview
BandLab Clone is a high-precision multi-track digital audio workstation (DAW) for web and mobile Android. It features:
- Multi-screen authentic BandLab mobile UX flow: Landing View -> Auth Modal -> Projects Dashboard -> Mobile Studio DAW.
- Dedicated Mobile Tracks View (`TracksMobileView`) with touch faders (Volume 0-100%, Pan L50-R50), REC arm, Mute, Solo, and waveform summaries.
- Real-time AutoPitch vocal suite with Doppler granular pitch shifting (`PitchShifterNode`), LFO chorus/vibrato modulation, analog tube saturation, 4-band parametric EQ, compressor, and space reverb.
- Live microphone recording with live VU level monitoring and automatic track lane placement.
- 16-step beat machine with 8 synthesized drum channels (808 Bass, Kick, Snare, Clap, Closed Hat, Open Hat, Perc, Crash).
- Client-side faster-than-realtime multi-track mixdown export to 320kbps MP3 and 24-bit WAV ($0 cloud costs).
- Crash-proof Firebase authentication (Email/Password, Google OAuth, Instant Guest) with Android WebView safe storage.
- Strict `qwenton-ui` 60-30-10 solid OKLCH design with zero AI slop, zero gradients, and zero primary colors.

---

## 2. qwenton-ui Visual Design System & Zero AI Slop Audit
### Color Palette (Tri-Color 60-30-10 Hierarchy):
- **60% Dominant Canvas:** Cold Gunmetal Flint (`oklch(19% 0.018 220)`).
- **30% Secondary Structure:** Panel Slate (`oklch(24% 0.022 220)`), Elevated Keybeds (`oklch(29% 0.025 220)`), Seam Borders (`oklch(36% 0.022 220)`), Aluminum Chalk Text (`oklch(92% 0.008 220)`).
- **10% Accent:** Signal Mint / Electric Phosphor (`oklch(78% 0.16 168)`).
- **Zero Primary Colors:** Non-primary studio markers: Nordic Carmine (`oklch(64% 0.18 28)` for REC), Warm Ochre (`oklch(74% 0.14 85)` for Beats), Teal Slate (`oklch(76% 0.11 205)` for Instruments), Indigo Slate (`oklch(68% 0.10 240)` for 808s).
- **Zero Gradients:** Every background, border, button, and slider uses solid `oklch()`.

### Negative Constraints Enforced (qwenton-review compliance):
- **NO 3-card feature rows:** Landing hero replaced with Blueprint B (Split Stage + Live Audio DSP Pad demo).
- **NO Sparkles / AI fluff icons:** Replaced with engineering-grade icons (`Sliders`, `Radio`, `Activity`, `Wrench`).
- **NO Glassmorphism / `backdrop-blur-md`:** Solid opaque panel backgrounds (`bg-surface-1`).
- **NO Universal drop shadows:** Tactile beveled borders (`border-b-2 active:translate-y-px`).
- **NO Pure Black `#000000`:** Deep obsidian-flint base (`oklch(19% 0.018 220)`).
- **Skeletons Added:** `TrackCardSkeleton` and `ProjectCardSkeleton` added for instant async feedback.
- **Legal Compliance:** Footer with explicit Terms of Service and Privacy Policy links.

---

## 3. APK Inspection & Verification Results
1. **APK Archive Structure:**
   - Package: `com.qwenton.bandlabs`
   - Size: 4.71 MB (`app-debug.apk`)
   - Native DEX files: `classes.dex` through `classes6.dex`
   - Asset Manifest: `assets/capacitor.config.json`, `assets/native-bridge.js`, `assets/public/index.html`, and pre-rendered Next.js chunks (`4bd1b696`, `255`, `main-app`, `page-*.js`).
2. **Native Permissions:**
   - `android.permission.INTERNET`
   - `android.permission.RECORD_AUDIO` (verified: `BridgeWebChromeClient.java` triggers native runtime permission prompt when user arms or records).
   - `android.permission.MODIFY_AUDIO_SETTINGS`
   - `android.permission.READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE`
3. **Automated Verification:**
   - Unit tests: 11/11 passed (`npm test`).
   - Next.js static build: Succeeded (`npm run build`).
   - Capacitor Android Sync: Succeeded (`npx cap sync android`).
   - Local Gradle APK build: Succeeded (`gradlew assembleDebug` in 42s).

---

## 4. Current Status
- Next.js Web Studio & Audio DSP: **Verified (11/11 tests passing).**
- Multi-Screen Mobile Flow: **Complete & Verified.**
- Gunmetal & Signal Mint Redesign: **Complete (Zero AI Slop & Zero Gradients).**
- Android Debug APK: **Compiled Locally (4.71 MB) & Ready for GitHub Release v1.0.5.**
