# Project State & Context: BandLab Mobile Flow & Android APK Verification
**Last Updated:** 2026-11-08 17:35:00

## 1. Project Overview
BandLab Clone is a high-precision multi-track digital audio workstation (DAW) for web and mobile Android. It features:
- Multi-screen authentic BandLab mobile UX flow: Landing View -> Auth Modal -> Projects Dashboard -> Mobile Studio DAW.
- Dedicated Mobile Tracks View (`TracksMobileView`) with touch faders (Volume 0-100%, Pan L50-R50), REC arm, Mute, Solo, and waveform summaries.
- Real-time AutoPitch vocal suite with Doppler granular pitch shifting (`PitchShifterNode`), LFO chorus/vibrato modulation, analog tube saturation, 4-band parametric EQ, compressor, and space reverb.
- Live microphone recording with live VU level monitoring and automatic track lane placement.
- 16-step beat machine with 8 synthesized drum channels (808 Bass, Kick, Snare, Clap, Closed Hat, Open Hat, Perc, Crash).
- Client-side faster-than-realtime multi-track mixdown export to 320kbps MP3 and 24-bit WAV ($0 cloud costs).
- Crash-proof Firebase authentication (Email/Password, Google OAuth, Instant Guest) with Android WebView safe storage.
- Strict `qwenton-ui` 60-30-10 solid OKLCH design with zero AI slop and zero gradients.

---

## 2. Brainstormed Ideas & Architecture: Mobile APK Verification & Debugging Pass
### Deep APK Inspection Results:
1. **APK Archive Structure:**
   - Package: `com.qwenton.bandlabs`
   - Size: 4.71 MB (`app-debug.apk`)
   - Native DEX files: `classes.dex` through `classes6.dex`
   - Asset Manifest: `assets/capacitor.config.json`, `assets/native-bridge.js`, `assets/public/index.html`, and pre-rendered Next.js chunks (`4bd1b696`, `255`, `main-app`, `page-27eb2ac83a78c58d.js`).
2. **Native Permissions:**
   - `android.permission.INTERNET`
   - `android.permission.RECORD_AUDIO` (verified: `BridgeWebChromeClient.java` triggers native runtime permission prompt when user arms or records).
   - `android.permission.MODIFY_AUDIO_SETTINGS`
   - `android.permission.READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE`
3. **Runtime Web Inspection & Emulation:**
   - Served static export on `http://localhost:3000` and attached DevTools on mobile viewport (390x844 Pixel 7 / Galaxy S21 emulation).
   - **Landing Page:** Renders instantly in static HTML.
   - **Auth Modal:** Sign In / Sign Up tabs switch cleanly. Guest mode bypasses cloud auth without blocking.
   - **Dashboard Creation Hub:** Displays "+ Create New Project", Quick Launch tools, My Projects list, starter templates, and centered floating red "+" button.
   - **Mobile Tracks View:** Vertical cards with volume and pan sliders replace cramped desktop timelines.
   - **Switcher:** 1-tap toggling between mobile Tracks view and horizontal multitrack Timeline view.
   - **Console Errors:** ZERO runtime JavaScript exceptions.

---

## 3. Current Progress
- Next.js Web Studio & Audio DSP: **Verified (11/11 automated tests passed).**
- Multi-Screen Mobile Flow: **Complete & Verified via Headless DevTools.**
- Android Debug APK: **Compiled Locally & Published on GitHub Releases (v1.0.3).**
- Cloud CI/CD: **GitHub Actions run `42476175712` completed with status `success`.**

---

## 4. Pending Work & Next Steps
- Verify user feedback on physical Android phone installation.
- Add PWA install manifest if browser standalone launch is desired alongside APK.
- Add sample audio stems to starter templates for instant preview.
