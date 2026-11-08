# Project Execution Roadmap
**Status:** Active
**Instruction for Execution Agent:** Pick the first unchecked `[ ]` task in the current active phase, implement it completely without placeholders, verify it, and mark it `[x]`.

## Phase 1: Foundation, Config & Scaffolding
- [x] **Task 1.1: Project Initialization & Audio Stack Scaffolding**
  - *Action:* Initialized Next.js 15 (App Router, TypeScript, Tailwind CSS, Lucide icons, Zustand, Tone.js, @breezystack/lamejs, @supabase/supabase-js, firebase). Configured `tsconfig.json`, `next.config.ts`, `.env.example`, and `.env.local`.
  - *Target Files:* `package.json`, `tsconfig.json`, `next.config.ts`, `.env.example`, `.env.local`
  - *Done When:* `npm run build` succeeds and dev server starts with zero errors.
- [x] **Task 1.2: BandLab Studio Shell Layout & Dark Audio Tokens**
  - *Action:* Built the BandLab dark studio layout shell: Top Transport Bar, Left Track Header List, Central Timeline Arrangement View, and Bottom Vocal Setup & Beat Maker Dock.
  - *Target Files:* `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/daw/TransportBar.tsx`, `src/components/daw/StudioLayout.tsx`, `src/styles/globals.css`
  - *Done When:* Studio UI renders with high responsiveness, smooth transport bar, time ruler, and authentic BandLab dark DAW styling.

## Phase 2: Data Layer, State & Authentication
- [x] **Task 2.1: Supabase User Settings Store & Schema Client**
  - *Action:* Configured Supabase client using URL `https://vbggacgvdbgtgvtyupvo.supabase.co` and publishable key. Defined `UserSettings` TypeScript schema. Created SQL migration file `supabase/user_settings.sql` with RLS policies and implemented client-side fetch/sync helpers with local fallback.
  - *Target Files:* `src/types/settings.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/settingsService.ts`, `supabase/user_settings.sql`
  - *Done When:* User settings can be fetched, updated, and persisted to Supabase with TypeScript safety.
- [x] **Task 2.2: Firebase Auth Integration & User Profile Sync**
  - *Action:* Initialized Firebase Client SDK with project `bandlabs-clone` and API key. Implemented `AuthContext` supporting Google OAuth and 1-click Instant Guest login. Auto-provision default user settings in Supabase on login.
  - *Target Files:* `src/lib/firebase/config.ts`, `src/context/AuthContext.tsx`, `src/components/settings/UserSettingsModal.tsx`
  - *Done When:* User can authenticate seamlessly via Google or Guest; user UID links automatically to Supabase `user_settings`.

## Phase 3: Core Feature Modules (Iterative Build)
- [x] **Task 3.1: Web Audio Engine Core & Studio State Store**
  - *Action:* Built the core audio engine using Web Audio API: master `AudioContext` singleton, high-precision clock scheduler (BPM, metronome click generator, playhead tracking), and Zustand store (`useStudioStore`) managing tracks, playhead state, zoom, and active selections.
  - *Target Files:* `src/lib/audio/AudioEngine.ts`, `src/stores/useStudioStore.ts`
  - *Done When:* Audio engine boots on user gesture, metronome clicks accurately in time with adjustable BPM, and playhead position syncs smoothly at 60fps.
- [x] **Task 3.2: Vocal Recording, Mic Monitoring & Instrumental Beat Import**
  - *Action:* Implemented microphone audio capture readiness and drag-and-drop import of instrumental backing beats (MP3/WAV) onto dedicated tracks with automated waveform peak extraction and visualization.
  - *Target Files:* `src/components/daw/TrackLane.tsx`, `src/components/daw/TimelineView.tsx`, `src/lib/audio/AudioEngine.ts`
  - *Done When:* User can drop in a backing beat and record live vocals over it with instant waveform feedback and playback synchronization.
- [x] **Task 3.3: True Sound Modulations & Real-Time Pitch Shifter (AutoPitch DSP)**
  - *Action:* Upgraded `src/lib/audio/dsp/EffectsRack.ts` and created `PitchShifterNode.ts` and `ModulationNode.ts` with real-time granular pitch shifting, LFO-driven chorus/vibrato modulation (depth & rate), and analog tube saturation. Connected AutoPitch scale, root key, and correction speed knobs directly to the audio processing graph.
  - *Target Files:* `src/lib/audio/dsp/EffectsRack.ts`, `src/lib/audio/dsp/PitchShifterNode.ts`, `src/lib/audio/dsp/ModulationNode.ts`, `src/components/daw/VocalSuiteModal.tsx`
  - *Done When:* Audio shifts pitch to the selected musical key in real time, and chorus/vibrato modulations are audible during playback and recording.
- [x] **Task 3.4: Live Microphone Capture & Take Placer**
  - *Action:* Built `src/lib/audio/MicRecorder.ts` with `navigator.mediaDevices.getUserMedia` and `MediaRecorder`. Connected the Transport bar `REC` button to capture vocal takes with live VU level monitoring, automatically decoding takes into waveform `AudioClip`s on the armed vocal track.
  - *Target Files:* `src/lib/audio/MicRecorder.ts`, `src/components/daw/TransportBar.tsx`
  - *Done When:* User can record their live voice from mic/headset, see it populate as a clip on the vocal track, and play it back with all vocal FX applied.
- [x] **Task 3.5: 16-Step Beat Maker & Drum Machine**
  - *Action:* Created a 16-step grid drum sequencer module supporting 8 channels (Kick, Snare, Clap, Closed Hat, Open Hat, 808 Bass, Perc, Crash). Included synthesized drum sound engine, step velocity, and real-time loop preview.
  - *Target Files:* `src/components/daw/BeatMakerModal.tsx`, `src/lib/audio/AudioEngine.ts`, `src/stores/useStudioStore.ts`
  - *Done When:* User can program drum patterns on the 16-step grid, audition sounds, and loop them seamlessly in sync with the master project BPM.
- [x] **Task 3.6: "Download / Install Music" Mixdown Engine**
  - *Action:* Implemented client-side `OfflineAudioContext` multi-track render engine. When user clicks "Download Music", it gathers all active vocal additions (with AutoPitch and FX applied), imported beats, and drum patterns, renders the final mixdown faster-than-realtime, and encodes to 320kbps MP3 or 24-bit WAV using `@breezystack/lamejs`. Triggers instant browser file download.
  - *Target Files:* `src/lib/audio/MixdownExporter.ts`, `src/lib/audio/WavEncoder.ts`, `src/components/daw/TransportBar.tsx`
  - *Done When:* User can click "Download Music" and instantly receive the fully rendered audio file containing all their vocal additions, beat customizations, and effect preferences baked in.

## Phase 4: UI Polish, Error Recovery & Android Stability
- [x] **Task 4.1: `qwenton-ui` Redesign & Zero AI Slop Implementation**
  - *Action:* Converted all DAW styling to solid 60-30-10 OKLCH tokens (`globals.css`, `tailwind.config.ts`), removed all gradients, eliminated neon glows, applied monospace numbers, added track skeleton loaders, and included Terms of Service / Privacy Policy links.
  - *Target Files:* `src/styles/globals.css`, `tailwind.config.ts`, `src/components/daw/TrackLane.tsx`, `src/components/daw/TimelineView.tsx`, `src/components/daw/VocalSuiteModal.tsx`, `src/components/daw/BeatMakerModal.tsx`, `src/components/settings/UserSettingsModal.tsx`
  - *Done When:* DAW has authentic studio hardware aesthetics with strictly zero gradients and 11 passing automated tests.
- [x] **Task 4.2: Android Client-Side Exception Fix & Studio Recovery Guard**
  - *Action:* Fixed `auth/invalid-api-key` crash on Android WebView startup by making Firebase initialization crash-proof with fallback to offline guest session. Added top-level React `ErrorBoundary` and protected `localStorage` calls with safe storage wrappers.
  - *Target Files:* `src/lib/firebase/config.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/settingsService.ts`, `src/context/AuthContext.tsx`, `src/components/common/ErrorBoundary.tsx`, `src/app/page.tsx`
  - *Done When:* APK launches into DAW workspace on Android devices without throwing client-side exception or showing black error screen.
- [x] **Task 4.3: BandLab 1-to-1 Multi-Screen Mobile Flow & Studio Verification**
  - *Action:* Built authentic 4-screen BandLab mobile architecture: (1) Landing View with hero & direct access; (2) Authentication Modal with Email/Password + Google + Guest; (3) Dashboard creation hub with "+ Create New Project", Quick Launch tools, starter templates (Trap, Pop, Drill), project library, and bottom navigation with central red "+" button; (4) Mobile-first Studio with vertical track cards (`TracksMobileView`), touch faders, pan, rec arm, waveform clips, and Timeline view switcher.
  - *Target Files:* `src/stores/useStudioStore.ts`, `src/components/landing/LandingView.tsx`, `src/components/auth/AuthModal.tsx`, `src/components/dashboard/DashboardView.tsx`, `src/components/dashboard/CreateTrackSheet.tsx`, `src/components/daw/TracksMobileView.tsx`, `src/components/daw/StudioLayout.tsx`, `src/components/daw/TransportBar.tsx`, `src/app/page.tsx`
  - *Done When:* Complete end-to-end user navigation flow is verified on mobile emulation, all 11 automated unit/DSP tests pass, Next.js static build succeeds with zero errors, and native APK is compiled locally and published to GitHub Releases (v1.0.3).

## Phase 5: Cloud Compilation & Release
- [ ] **Task 5.1: Push Fixes, Tag v1.0.2 & Publish Release**
  - *Action:* Commit changes to git, tag as `v1.0.2`, push to GitHub, and verify GitHub Actions builds and publishes the new APK release.
  - *Target Files:* `.github/workflows/build-and-release.yml`
  - *Done When:* GitHub Release v1.0.2 is live with downloadable `app-debug.apk`.
