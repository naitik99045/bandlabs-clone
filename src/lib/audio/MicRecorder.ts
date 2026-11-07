// Live Microphone Vocal Capture & Waveform Processor
import { audioEngine } from "./AudioEngine";
import { AudioClip } from "@/stores/useStudioStore";

export class MicRecorder {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private startTime: number = 0;
  private analyser: AnalyserNode | null = null;
  private isRecording: boolean = false;

  public async start(timelineStartTime: number = 0): Promise<boolean> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      const ctx = audioEngine.getContext();
      const source = ctx.createMediaStreamSource(this.mediaStream);
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 128;
      source.connect(this.analyser);

      // Record audio chunks
      this.chunks = [];
      this.startTime = timelineStartTime;
      this.mediaRecorder = new MediaRecorder(this.mediaStream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100); // 100ms slice
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error("Microphone access error:", err);
      return false;
    }
  }

  // Get current mic volume for live VU meter (0 to 1)
  public getLiveLevel(): number {
    if (!this.analyser || !this.isRecording) return 0;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum / (data.length * 255);
  }

  public async stop(): Promise<AudioClip | null> {
    if (!this.mediaRecorder || !this.isRecording) return null;

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        try {
          const blob = new Blob(this.chunks, { type: "audio/webm" });
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await audioEngine.decodeAudioData(arrayBuffer);
          const peaks = audioEngine.extractPeaks(audioBuffer, 200);

          const clip: AudioClip = {
            id: `vocal-take-${Date.now()}`,
            name: `Vocal Take ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
            startTime: this.startTime,
            duration: audioBuffer.duration,
            audioBuffer,
            audioBlob: blob,
            peaks,
          };

          // Release hardware mic stream
          this.mediaStream?.getTracks().forEach((track) => track.stop());
          this.isRecording = false;

          resolve(clip);
        } catch (err) {
          console.error("Failed to decode recorded audio take:", err);
          resolve(null);
        }
      };

      this.mediaRecorder!.stop();
    });
  }
}

export const micRecorder = new MicRecorder();
