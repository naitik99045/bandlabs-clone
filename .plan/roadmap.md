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

## Phase 3: Core Feature Modules (Reverse-Engineered BandLab Exact Replica)
- [x] **Task 3.1: Wire Authentic BandLab Metronome Sound Engine**
  - *Action:* Connect the 8 extracted BandLab audio files (`public/audio/metronome/clave_*.m4a`, `hat_*.m4a`, `rim_*.m4a`, `sineburst_*.m4a`) into `AudioEngine.ts`. Implement sound preset switcher (Clave, Hi-Hat, Rimshot, Sine Burst) with high/low accented clicks and zero playback latency.
  - *Target Files:* `src/lib/audio/AudioEngine.ts`, `src/stores/useStudioStore.ts`, `src/components/daw/TransportBar.tsx`, `src/components/settings/UserSettingsModal.tsx`, `tests/daw.test.ts`
  - *Done When:* Metronome plays authentic BandLab sound samples with seamless looping, audio buffer caching, and 14/14 automated tests passing.
- [x] **Task 3.2: Expand AutoPitch to 24 Authentic BandLab Vocal FX Presets**
  - *Action:* Upgraded `EffectsRack.ts`, `vocalPresets.ts`, and `VocalSuiteModal.tsx` with all 24 presets discovered in `com.bandlab.bandlab`: *Classic*, *Modern Rap*, *Amped*, *Robot*, *Big Harmony*, *Bitz*, *Chip*, *Drone*, *Duet*, *Futurescape*, *Gorgon*, *Halo*, *Hyper*, *Krafty*, *Natural*, *Ocean*, *Phone*, *Simulacrum*, *Stone*, *Third*, *Ultrashift*, *Voice Cleaner*, *De-Reverb*, *Noise Gate*. Configured specific DSP parameters (pitch quantization speed, interval shifts, saturation drive, chorus wet, filter cutoff).
  - *Target Files:* `src/lib/audio/dsp/EffectsRack.ts`, `src/lib/audio/presets/vocalPresets.ts`, `src/components/daw/VocalSuiteModal.tsx`, `tests/daw.test.ts`
  - *Done When:* All 24 presets appear in the vocal modal with real-time audio routing, category filtering, and 16/16 passing automated tests.
- [x] **Task 3.3: BandLab 8-Profile AI Mastering Suite (`MasteringActivity`)**
  - *Action:* Created `src/lib/audio/dsp/MasteringRack.ts` and `src/components/tools/MasteringModal.tsx` replicating BandLab's official mastering suite. Implemented 8 profiles: *Universal*, *Clarity*, *Fire*, *Tape*, *Natural*, *Spatial*, *Punch*, and *Cinematic*. Includes real-time A/B bypass switch, Low/High EQ trims, intensity slider, timeline scrubbing, and instant mixdown mastering export.
  - *Target Files:* `src/lib/audio/dsp/MasteringRack.ts`, `src/components/tools/MasteringModal.tsx`, `src/stores/useStudioStore.ts`, `src/components/dashboard/DashboardView.tsx`, `src/components/dashboard/CreateTrackSheet.tsx`, `tests/daw.test.ts`
  - *Done When:* User can audition master tracks with all 8 profiles in real time, toggle A/B comparison, and export mastered audio. Verified with 18/18 passing tests and clean Android APK build.
- [x] **Task 3.4: Standalone Creator Tools Suite (Tuner, Metronome & SongStarter)**
  - *Action:* Implemented standalone creator tools matching BandLab's `com.bandlab.tools`:
    1. **Chromatic Tuner (`TunerModal.tsx` & `PitchDetector.ts`):** Web Audio pitch autocorrelation detecting fundamental frequency (Hz), note name (e.g., A4), and visual cents offset needle (±3¢ in-tune Signal Mint zone) across Chromatic, Guitar, Bass, Ukulele, and Violin presets with reference tone playback.
    2. **Pro Metronome (`MetronomeModal.tsx`):** Fullscreen metronome with visual pendulum pulse, tap-tempo button, time signatures (2/4 to 7/8), subdivisions (1/4 to 1/16), and BandLab sound picker with 4 authentic APK sample profiles.
    3. **AI SongStarter (`SongStarterModal.tsx`):** Beat & melody inspiration generator for Trap, Hip Hop, Pop, R&B, Lo-Fi, and UK Drill that generates chord voicings, key, BPM, and drum matrix grooves with 1-click studio DAW seeding.
  - *Target Files:* `src/lib/audio/dsp/PitchDetector.ts`, `src/components/tools/TunerModal.tsx`, `src/components/tools/MetronomeModal.tsx`, `src/components/tools/SongStarterModal.tsx`, `src/components/dashboard/CreateTrackSheet.tsx`, `src/components/dashboard/DashboardView.tsx`, `src/components/daw/StudioLayout.tsx`, `tests/daw.test.ts`
  - *Done When:* All three standalone tools can be launched from the Create (+) Sheet and Studio, backed by 22/22 passing automated tests and clean Android APK build.
- [ ] **Task 3.5: 5-Tab Mobile Navigation Shell (`NavigationActivity`)**
  - *Action:* Build BandLab's authentic bottom navigation bar in `src/components/navigation/BottomTabBar.tsx`: **Feed** (community tracks & waveform player), **Explore** (trending genres & sound packs), **Create (+)** (pulsing red studio launcher), **Library** (my projects & templates), and **Profile** (user stats & settings).
  - *Target Files:* `src/components/navigation/BottomTabBar.tsx`, `src/app/page.tsx`, `src/stores/useStudioStore.ts`
  - *Done When:* Mobile shell seamlessly switches between the 5 tabs, keeping the DAW accessible in 1 tap from the center Create button.

## Phase 4: UI Polish, Edge Cases & Android Stability
- [x] **Task 4.1: `qwenton-ui` Redesign & Zero AI Slop Implementation**
  - *Action:* Converted all DAW styling to solid 60-30-10 OKLCH tokens (`globals.css`), removed all gradients, eliminated neon glows, applied monospace numbers, added track skeleton loaders, and included Terms of Service / Privacy Policy links.
  - *Done When:* DAW has authentic studio hardware aesthetics with strictly zero gradients and 11 passing automated tests.
- [x] **Task 4.2: Android Client-Side Exception Fix & Studio Recovery Guard**
  - *Action:* Fixed `auth/invalid-api-key` crash on Android WebView startup by making Firebase initialization crash-proof with fallback to offline guest session. Added top-level React `ErrorBoundary` and protected `localStorage` calls with safe storage wrappers.
  - *Done When:* APK launches into DAW workspace on Android devices without throwing client-side exception or showing black error screen.
- [ ] **Task 4.3: Multi-Take Vocal Recording & Comping System (`About Takes`)**
  - *Action:* Implement multi-take recording on vocal tracks. When recording over an existing clip, save as Take 2, Take 3, etc., allowing the user to audition takes, swipe between takes, and comp the best vocal performance.
  - *Target Files:* `src/lib/audio/MicRecorder.ts`, `src/components/daw/TracksMobileView.tsx`, `src/stores/useStudioStore.ts`
  - *Done When:* Consecutive vocal recordings on the same track lane generate selectable takes without overwriting previous takes.

## Phase 5: Cloud Compilation & Release
- [ ] **Task 5.1: Build, Test, Sync & Publish Release v1.1.0**
  - *Action:* Run full test suite (`npm test`), build static export (`npm run build`), sync Capacitor Android (`npx cap sync android`), compile APK locally (`gradlew assembleDebug`), push tag `v1.1.0` to GitHub, and verify GitHub Actions publishes the release APK.
  - *Target Files:* `.github/workflows/build-and-release.yml`
  - *Done When:* GitHub Release v1.1.0 is published with downloadable `app-debug.apk`.
