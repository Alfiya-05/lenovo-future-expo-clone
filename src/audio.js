/**
 * Lenovo Future Expo - Synthesized & Authentic Web Audio Manager
 * Provides lightweight, zero-latency spatial SFX, authentic game sounds,
 * background crowd chatter, and expo ambiance.
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientGain = null;
    this.masterGain = null;
    this.crowdGain = null;
    this.crowdAudio = null;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Subtle expo ambient drone
    this.startAmbient();

    // Background convention crowd chatter
    this.startCrowdChatter();
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 1.0, this.ctx.currentTime);
    }
    if (this.crowdAudio) {
      this.crowdAudio.muted = this.isMuted;
    }
    return this.isMuted;
  }

  startAmbient() {
    if (!this.ctx || this.ambientGain) return;
    
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.035, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);

    // Dual oscillator deep drone
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A
    osc2.frequency.setValueAtTime(110, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, this.ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(this.ambientGain);

    osc1.start();
    osc2.start();
  }

  /**
   * Background convention crowd chatter
   * Seamlessly loops authentic room murmur & conversational chatter at gentle volume
   */
  startCrowdChatter() {
    if (this.crowdAudio) return;

    try {
      this.crowdAudio = new Audio('./assets/audio/expo_crowd_chatter.ogg');
      this.crowdAudio.loop = true;
      this.crowdAudio.volume = 0.08; // Gentle, pleasant ambient room chatter
      this.crowdAudio.muted = this.isMuted;

      const playPromise = this.crowdAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback to MP3 or retry on user gesture
          if (this.crowdAudio) {
            this.crowdAudio.src = './assets/audio/expo_crowd_chatter.mp3';
            this.crowdAudio.volume = 0.08;
            this.crowdAudio.play().catch(() => {});
          }
        });
      }
    } catch (e) {
      console.warn("Could not start background crowd chatter audio:", e);
    }
  }

  stopCrowdChatter() {
    if (this.crowdAudio) {
      this.crowdAudio.pause();
      this.crowdAudio = null;
    }
  }

  duckCrowdChatter() {
    if (this.crowdAudio) {
      this.crowdAudio.volume = 0.02;
    }
  }

  restoreCrowdChatter() {
    if (this.crowdAudio) {
      this.crowdAudio.volume = 0.07;
    }
  }

  playClick() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playLaserHit() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.14);
  }

  playAIChime() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(this.ctx.currentTime + idx * 0.07);
      osc.stop(this.ctx.currentTime + idx * 0.07 + 0.35);
    });
  }

  playModeSwitch() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playDataTransmit() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }

  playXRActivate() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.7);
  }

  playFinale() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C major
      [349.23, 440.00, 523.25, 698.46], // F major
      [392.00, 493.88, 587.33, 783.99], // G major
      [523.25, 659.25, 783.99, 1046.50] // C higher
    ];
    chords.forEach((chord, cIdx) => {
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + cIdx * 0.4);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + cIdx * 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + cIdx * 0.4 + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(this.ctx.currentTime + cIdx * 0.4);
        osc.stop(this.ctx.currentTime + cIdx * 0.4 + 0.6);
      });
    });
  }

  /**
   * Minecraft Villager Voice & Sound Effect
   * Directly plays the authentic sound from the YouTube video: https://www.youtube.com/watch?v=fiwRZ_j61Dc
   * Boosted volume for crystal clarity; continues with dialogue seamlessly.
   */
  playVillagerHmm(onComplete = null) {
    if (this.isMuted) {
      if (onComplete) onComplete();
      return;
    }
    this.resume();

    let finished = false;
    const triggerComplete = () => {
      if (!finished) {
        finished = true;
        if (onComplete) onComplete();
      }
    };

    try {
      // Prioritize the direct YouTube audio rip or original OGG
      const audioSources = [
        './assets/audio/villager_youtube.mp3',
        './assets/audio/villager_idle.ogg',
        './assets/audio/villager_idle.mp3'
      ];

      let attemptIdx = 0;
      const tryNextSource = () => {
        if (attemptIdx >= audioSources.length) {
          triggerComplete();
          return;
        }

        const src = audioSources[attemptIdx++];
        const audio = new Audio(src);
        audio.volume = 1.0; // Boosted to full volume

        // Attempt Web Audio gain boosting if context is active
        try {
          if (this.ctx && this.masterGain && !audio._boosted) {
            const track = this.ctx.createMediaElementSource(audio);
            const boostGain = this.ctx.createGain();
            boostGain.gain.setValueAtTime(1.5, this.ctx.currentTime); // 1.5x volume boost
            track.connect(boostGain);
            boostGain.connect(this.masterGain);
            audio._boosted = true;
          }
        } catch (e) {
          // Fallback to standard audio element volume
        }

        audio.onended = triggerComplete;

        const p = audio.play();
        if (p !== undefined) {
          p.then(() => {
            // Auto complete after sound duration
            setTimeout(triggerComplete, 1400);
          }).catch(() => {
            tryNextSource();
          });
        } else {
          setTimeout(triggerComplete, 1400);
        }
      };

      tryNextSource();
    } catch (e) {
      triggerComplete();
    }
  }

  /**
   * Robloxian Avatar "OOF" & Bloxy Chimes
   */
  playRobloxOof(onComplete = null) {
    if (this.isMuted) {
      if (onComplete) onComplete();
      return;
    }
    this.resume();

    let finished = false;
    const triggerComplete = () => {
      if (!finished) {
        finished = true;
        if (onComplete) onComplete();
      }
    };

    try {
      const audio = new Audio('./assets/audio/roblox_oof.ogg');
      audio.volume = 0.95;
      audio.onended = triggerComplete;
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => {
          setTimeout(triggerComplete, 450);
        }).catch(() => {
          const mp3Audio = new Audio('./assets/audio/roblox_oof.mp3');
          mp3Audio.volume = 0.95;
          mp3Audio.play().then(() => setTimeout(triggerComplete, 450)).catch(() => {
            this.synthRobloxOof();
            setTimeout(triggerComplete, 350);
          });
        });
      } else {
        setTimeout(triggerComplete, 450);
      }
    } catch (e) {
      this.synthRobloxOof();
      setTimeout(triggerComplete, 350);
    }
  }

  synthRobloxOof() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  playRobloxChatBoing() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * Terraria Guide Opening Chime & 16-Bit NPC Dialogue Blips
   */
  playTerrariaChime(onComplete = null) {
    if (this.isMuted) {
      if (onComplete) onComplete();
      return;
    }
    this.resume();

    let finished = false;
    const triggerComplete = () => {
      if (!finished) {
        finished = true;
        if (onComplete) onComplete();
      }
    };

    try {
      const audio = new Audio('./assets/audio/terraria_open.ogg');
      audio.volume = 0.95;
      audio.onended = triggerComplete;
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => {
          setTimeout(triggerComplete, 550);
        }).catch(() => {
          const wavAudio = new Audio('./assets/audio/terraria_open.wav');
          wavAudio.volume = 0.95;
          wavAudio.play().then(() => setTimeout(triggerComplete, 550)).catch(() => {
            this.synthTerrariaChime();
            setTimeout(triggerComplete, 500);
          });
        });
      } else {
        setTimeout(triggerComplete, 550);
      }
    } catch (e) {
      this.synthTerrariaChime();
      setTimeout(triggerComplete, 500);
    }
  }

  synthTerrariaChime() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, now + i * 0.04);
      gain.gain.setValueAtTime(0.09, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.12);
    });
  }

  /**
   * Retro 16-bit NPC Dialogue Blip (authentic Terraria text-speech sound)
   */
  playTerrariaBlip() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    const pitch = 380 + Math.random() * 80;
    osc.frequency.setValueAtTime(pitch, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playPortalSummon() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.45);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  playFootstep() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }
}

export const soundManager = new SoundManager();
