import { Audio, AVPlaybackStatus } from 'expo-av';
import { Track, RepeatMode } from '@/src/types';

Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  staysActiveInBackground: true,
  playThroughEarpieceAndroid: false,
});

export type PlayerStatusCallback = (status: PlayerStatus) => void;

export interface PlayerStatus {
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  isLoaded: boolean;
  error: string | null;
}

class AudioPlayerService {
  private sound: Audio.Sound | null = null;
  private statusCallback: PlayerStatusCallback | null = null;
  private currentUrl: string | null = null;
  private shouldPlayOnLoad: boolean = false;

  onStatusChange(callback: PlayerStatusCallback): void {
    this.statusCallback = callback;
  }

  private emit(status: PlayerStatus): void {
    this.statusCallback?.(status);
  }

  private async ensureUnloaded(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch (err) {
        console.warn('[audio] Error unloading previous sound:', err);
      }
      this.sound = null;
      this.currentUrl = null;
    }
  }

  async loadTrack(track: Track, autoPlay: boolean = true): Promise<boolean> {
    if (!track.previewUrl) {
      this.emit({
        isPlaying: false,
        positionMs: 0,
        durationMs: 0,
        isLoaded: false,
        error: 'No preview available for this track',
      });
      return false;
    }

    // If same URL and already loaded, just play/pause
    if (this.currentUrl === track.previewUrl && this.sound) {
      if (autoPlay) {
        await this.play();
      }
      return true;
    }

    await this.ensureUnloaded();
    this.shouldPlayOnLoad = autoPlay;
    this.currentUrl = track.previewUrl;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.previewUrl },
        { shouldPlay: autoPlay, progressUpdateIntervalMillis: 500 },
        this.onPlaybackStatusUpdate.bind(this)
      );
      this.sound = sound;
      this.emit({
        isPlaying: autoPlay,
        positionMs: 0,
        durationMs: track.durationMs || 0,
        isLoaded: true,
        error: null,
      });
      return true;
    } catch (err) {
      console.warn('[audio] Failed to load track:', err);
      this.sound = null;
      this.currentUrl = null;
      this.emit({
        isPlaying: false,
        positionMs: 0,
        durationMs: 0,
        isLoaded: false,
        error: 'Failed to load audio. This preview may be unavailable.',
      });
      return false;
    }
  }

  private onPlaybackStatusUpdate(status: AVPlaybackStatus): void {
    if (!status.isLoaded) {
      if (status.error) {
        this.emit({
          isPlaying: false,
          positionMs: 0,
          durationMs: 0,
          isLoaded: false,
          error: status.error,
        });
      }
      return;
    }

    this.emit({
      isPlaying: status.isPlaying,
      positionMs: status.positionMillis,
      durationMs: status.durationMillis || status.playableDurationMillis || 0,
      isLoaded: true,
      error: null,
    });
  }

  async play(): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.playAsync();
    } catch (err) {
      console.warn('[audio] Play error:', err);
    }
  }

  async pause(): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.pauseAsync();
    } catch (err) {
      console.warn('[audio] Pause error:', err);
    }
  }

  async togglePlayPause(): Promise<void> {
    if (!this.sound) return;
    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await this.pause();
      } else {
        await this.play();
      }
    } catch (err) {
      console.warn('[audio] Toggle error:', err);
    }
  }

  async seekTo(positionMs: number): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.setStatusAsync({ positionMillis: positionMs, shouldPlay: true });
    } catch (err) {
      console.warn('[audio] Seek error:', err);
    }
  }

  async setPosition(positionMs: number): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.setStatusAsync({ positionMillis: positionMs });
    } catch (err) {
      console.warn('[audio] SetPosition error:', err);
    }
  }

  async setVolume(volume: number): Promise<void> {
    if (!this.sound) return;
    try {
      await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
    } catch (err) {
      console.warn('[audio] Volume error:', err);
    }
  }

  async stopAndRelease(): Promise<void> {
    await this.ensureUnloaded();
  }

  getCurrentUrl(): string | null {
    return this.currentUrl;
  }

  isLoaded(): boolean {
    return this.sound !== null;
  }
}

export const audioPlayer = new AudioPlayerService();
