import { Howl, HowlOptions } from 'howler';

export class AudioManager {
    private static instance: AudioManager;
    private howls: Map<string, Howl> = new Map();
    private soundEnabled = true;
    private synthCtx: AudioContext | null = null;
    private currentOsc: OscillatorNode | null = null;

    private constructor() {
        this.initSynth();
        this.preloadSounds();
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    private initSynth() {
        if (typeof window !== 'undefined') {
            this.synthCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    setEnabled(enabled: boolean) {
        this.soundEnabled = enabled;
    }

    isEnabled() {
        return this.soundEnabled;
    }

    play(soundId: string, options: { pitch?: number; volume?: number } = {}) {
        if (!this.soundEnabled) return;

        const howl = this.howls.get(soundId);
        if (howl) {
            const soundId = howl.rate(options.pitch || 1);
            howl.volume(options.volume || 1);
            howl.play();
            return;
        }

        // Fallback synth for merges
        if (soundId.startsWith('merge')) {
            this.playSynthMerge(options.pitch || 4);
        } else if (soundId === 'spawn') {
            this.playSynthPop();
        }
    }

    private playSynthMerge(value: number) {
        if (!this.synthCtx) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        const freq = isFinite(value) ? 200 * Math.pow(1.3, Math.log2(Math.max(value, 2))) : 400;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
    }

    private playSynthPop() {
        if (!this.synthCtx) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    }

    private preloadSounds() {
        // Free/open sfx URLs (fallback synth)
        const sounds: Record<string, HowlOptions> = {
            swipe: { src: ['/sounds/swipe.mp3'], volume: 0.5 }, // Add to public/
            win: { src: ['/sounds/win.mp3'], volume: 0.8 },
            gameover: { src: ['/sounds/gameover.mp3'], volume: 0.6 },
        };

        Object.entries(sounds).forEach(([id, opts]) => {
            this.howls.set(id, new Howl(opts));
        });
    }
}

export const audio = AudioManager.getInstance();

