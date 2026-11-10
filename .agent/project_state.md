# Project State & Context: BandLab Exact Mobile Replica & Architecture
**Last Updated:** 2026-11-10 10:55:00

## 1. Project Overview
BandLab Clone is a high-precision, production-grade 1-to-1 mobile digital audio workstation (DAW) and music creation suite reverse-engineered directly from **BandLab Android APK v11.35.3 (`com.bandlab.bandlab`)**. 

It replicates BandLab's complete mobile architecture, including:
- **5-Tab Mobile Navigation Shell (`NavigationActivity`):** Feed, Explore, Center Create (+), Projects Library, and Profile/Settings.
- **Mobile Studio DAW (`MixEditorActivity`):** Dual-view engine featuring vertical Mobile Track Cards (`mix_editor_tracks.xml`) with touch faders (Volume 0-100%, Pan L50-R50), Mute, Solo, Rec Arm, Track Color strip, and direct FX triggers; alongside horizontal Arrangement Timeline (`mix_editor_multitrack_view.xml`).
- **Native Bottom Transport Dock (`tool_transport_controls.xml`):** Hardware-grade tactile Play/Pause, red pulsing Record, Rewind, Loop toggle, Metronome with tap-tempo, sub-millisecond Timecode (`00:00.0`), and 1-tap view switcher.
- **Real-Time AutoPitch & 24 Vocal FX Presets:** Snapping vocals to 12 musical keys and scales (Major, Minor, Pentatonic, Chromatic) across 5 intensity levels (Off, Lightest, Light, Medium, Heavy, Classic Hard-tune), combined with authentic vocal presets (`Classic`, `Modern Rap`, `Amped`, `Robot`, `Big Harmony`, `Bitz`, `Futurescape`, `Voice Cleaner`, etc.).
- **Authentic Creator Tools Suite (`com.bandlab.tools.*`):**
  1. **Mastering Tool (`MasteringActivity`):** BandLab's 8 mastering algorithms (Universal, Clarity, Fire, Tape, Natural, Spatial, Punch, Cinematic) with A/B bypass and EQ fine-tuning.
  2. **Stem Splitter (`SplitterActivity`):** 4-stem audio extraction (Vocals, Drums, Bass, Instruments) with individual volume, solo, and direct DAW lane export.
  3. **Chromatic Tuner (`TunerActivity`):** Low-latency pitch detector with cents needle display and Hz readout.
  4. **Pro Metronome (`MetronomeActivity`):** Fullscreen metronome utilizing authentic BandLab audio samples (`clave`, `hat`, `rim`, `sineburst`).
  5. **SongStarter (`SongStarterActivity`):** AI-powered melodic and chord progression generator across Trap, Hip Hop, R&B, and Pop.
- **Client-Side Mixdown Exporter:** Web Audio `OfflineAudioContext` with 320kbps MP3 and 24-bit WAV rendering at $0 cloud cost.

---

## 2. Reverse-Engineered Architecture & Discovery (from `bandlabs.xapk`)
### APK Inspection Findings:
1. **Package Details:** `com.bandlab.bandlab`, Version Code `11350300`, Version `11.35.3`, Target SDK `37`, Min SDK `32`.
2. **Native DSP Engines:**
   - `libbandlab_audio_engine.so` (Core audio DSP and multi-track mixing).
   - `libBinauralizer.so` (Spatial 3D binaural stereo audio).
   - `libavcodec.so`, `libavformat.so`, `libswresample.so` (FFmpeg decoding and resampling pipeline).
   - `libonnxruntime.so` (ML model inference for AI Stem Splitter and AutoPitch).
3. **Official Audio Assets:**
   - Metronome sound samples extracted from APK and placed in `public/audio/metronome/`:
     * `clave_accented.m4a` / `clave_unaccented.m4a`
     * `hat_accented.m4a` / `hat_unaccented.m4a`
     * `rim_accented.m4a` / `rim_unaccented.m4a`
     * `sineburst_accented.m4a` / `sineburst_unaccented.m4a`
4. **BandLab 8 Official Mastering Presets:**
   - `Universal`: Balanced dynamic multi-band leveling for streaming.
   - `Clarity`: High-frequency air and vocal separation.
   - `Fire`: Heavy saturation, tube warmth, and maximized loudness.
   - `Tape`: Vintage analog warmth and smoothed transients.
   - `Natural`: Preserves dynamic range for acoustic and organic instrumentation.
   - `Spatial`: Binaural stereo field expansion.
   - `Punch`: Aggressive transient impact for trap drums and 808s.
   - `Cinematic`: Wide epic stereo image with sub-bass depth.
5. **BandLab 24 Vocal FX Presets Discovered in Resource Table:**
   - `ic_audio_effect_classic` (Classic)
   - `ic_audio_effect_modern_rap` (Modern Rap)
   - `ic_audio_effect_amped` (Amped)
   - `ic_audio_effect_robot` (Robot)
   - `ic_audio_effect_big_harmony` (Big Harmony)
   - `ic_audio_effect_bitz` (Bitz)
   - `ic_audio_effect_chip` (Chipmunk)
   - `ic_audio_effect_drone` (Drone)
   - `ic_audio_effect_duet` (Duet)
   - `ic_audio_effect_futurescape` (Futurescape)
   - `ic_audio_effect_gorgon` (Gorgon)
   - `ic_audio_effect_halo` (Halo)
   - `ic_audio_effect_hyper` (Hyperpop)
   - `ic_audio_effect_krafty` (Krafty)
   - `ic_audio_effect_natural` (Natural)
   - `ic_audio_effect_ocean` (Ocean)
   - `ic_audio_effect_phone` (Phone)
   - `ic_audio_effect_simulacrum` (Simulacrum)
   - `ic_audio_effect_stone` (Stone)
   - `ic_audio_effect_third` (Third)
   - `ic_audio_effect_ultrashift` (Ultrashift)
   - `ic_audio_effect_voice_cleaner` (Voice Cleaner)
   - `ic_audio_de_reverb` (De-Reverb)
   - `ic_audio_denoise` (Noise Gate)

---

## 3. Current Progress
- **Visual Design System:** Clean solid 60-30-10 OKLCH theme (Gunmetal Flint base, Slate structure, Signal Mint accent) with strictly zero gradients and zero AI slop.
- **Audio DSP Core:** `PitchShifterNode`, `ModulationNode`, `EffectsRack`, `MixdownExporter`, `WavEncoder`, and 16-step beat machine.
- **Authentic BandLab Metronome Sound Engine:** Connected 8 extracted `.m4a` files (`clave`, `hat`, `rim`, `sineburst`) with real-time buffer caching, sound preset cycling in Mobile Transport Dock and Desktop Header, and audition tester in User Settings.
- **Complete 24 BandLab Vocal FX Presets:** Upgraded `VocalSuiteModal.tsx` and `vocalPresets.ts` with all 24 official BandLab presets, category filters (Lead & Rap, Harmonizer, Modulation & Space, Cleanup), Tube Drive, Chorus Shimmer, and semitone interval shifts.
- **BandLab 8-Profile AI Mastering Suite:** Fully implemented `MasteringRack.ts` and `MasteringModal.tsx` (`MasteringActivity` replica) with all 8 official algorithms (Universal, Clarity, Fire, Tape, Natural, Spatial, Punch, Cinematic), real-time A/B bypass, Intensity fader, Bass/Treble trim, timeline scrubber, and offline WAV/MP3 master export.
- **Standalone Creator Tools Suite (`com.bandlab.tools`):** Fully implemented Chromatic Tuner (`TunerModal.tsx` with autocorrelation pitch detection, needle gauge, and instrument presets), Pro Fullscreen Metronome (`MetronomeModal.tsx` with tap tempo, 2/4 to 7/8 signatures, and 4 authentic APK samples), and AI SongStarter (`SongStarterModal.tsx` with genre/vibe chords, audition synth, and 1-click DAW seeding).
- **5-Tab Mobile Navigation Shell (`NavigationActivity`):** Rebuilt authentic BandLab mobile shell with `BottomTabBar.tsx`, `FeedTab.tsx` (waveform players & Fork into Studio action), `ExploreTab.tsx` (royalty-free sound packs & genre filters), `CreateTrackSheet.tsx` (8-tool creator launcher), `LibraryTab.tsx` (project management & search), and `ProfileTab.tsx` (diagnostics & settings).
- **Multi-Take Vocal Recording & Comping System (`About Takes`):** Non-destructive vocal take tracking on track lanes with interactive Take pills (`Take 1`, `Take 2`, `Take 3...`), solo take auditioning (▶), master comp promotion (★), and waveform peaks visualization.
- **Automated Tests:** 25/25 automated unit/DSP tests passing (`npm test`).
- **Android Compilation:** Static build passes, Capacitor Android sync verified, debug APK compiled locally (4.76 MB).

---

## 4. Pending Work & Next Steps
1. **Build & Release v1.1.0 (Task 5.1):** Push tag and publish release APK to GitHub with downloadable `app-debug.apk`.
