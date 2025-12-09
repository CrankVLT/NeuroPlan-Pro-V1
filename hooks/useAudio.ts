import { useRef, useCallback, useEffect } from 'react';

export const useAudio = () => {
    const ctxRef = useRef<AudioContext | null>(null);
    const gainRef = useRef<GainNode | null>(null); // Master Gain (Mute)
    const voiceGainRef = useRef<GainNode | null>(null); // Voice/Tone Volume
    const bgGainRef = useRef<GainNode | null>(null); // Bg Volume
    const bgNodeRef = useRef<AudioNode | null>(null);
    const toneNodeRef = useRef<OscillatorNode | null>(null);
    const bowlBufferRef = useRef<AudioBuffer | null>(null);

    const isMutedRef = useRef(false);
    const volumeRef = useRef(0.5);
    const bgVolumeRef = useRef(0.2); // Default background volume

    const init = useCallback(async () => {
        // Create context if needed
        if (!ctxRef.current || ctxRef.current.state === 'closed') {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            ctxRef.current = new AudioContext();

            // Master Gain (connects to destination)
            gainRef.current = ctxRef.current.createGain();
            gainRef.current.connect(ctxRef.current.destination);
            gainRef.current.gain.value = 1; // Default 1 (Unmuted)

            // Voice Gain (connects to Master)
            voiceGainRef.current = ctxRef.current.createGain();
            voiceGainRef.current.connect(gainRef.current);
            voiceGainRef.current.gain.value = volumeRef.current;
        }

        // Resume if suspended
        if (ctxRef.current.state === 'suspended') {
            try {
                await ctxRef.current.resume();
            } catch (e) { console.warn("Audio resume failed", e); }
        }

        // Wait for running state to ensure sync
        if (ctxRef.current.state !== 'running') {
            // Poll briefly
            for (let i = 0; i < 10; i++) {
                if (ctxRef.current.state === 'running') break;
                await new Promise(r => setTimeout(r, 50));
            }
        }
    }, []);

    const setVolume = useCallback((val: number) => {
        volumeRef.current = val;
        // Update Voice Gain
        if (voiceGainRef.current && ctxRef.current && ctxRef.current.state === 'running') {
            try {
                voiceGainRef.current.gain.setTargetAtTime(val, ctxRef.current.currentTime, 0.1);
            } catch (e) { console.warn(e); }
        }
    }, []);

    const setBgVolume = useCallback((val: number) => {
        bgVolumeRef.current = val;
        if (bgGainRef.current && ctxRef.current && ctxRef.current.state === 'running') {
            try {
                bgGainRef.current.gain.setTargetAtTime(val, ctxRef.current.currentTime, 0.1);
            } catch (e) { console.warn(e); }
        }
    }, []);

    const toggleMute = useCallback(() => {
        isMutedRef.current = !isMutedRef.current;
        // Update Master Gain (0 or 1)
        if (gainRef.current && ctxRef.current && ctxRef.current.state === 'running') {
            try {
                const target = isMutedRef.current ? 0 : 1;
                gainRef.current.gain.setTargetAtTime(target, ctxRef.current.currentTime, 0.1);
            } catch (e) { console.warn(e); }
        }
        return isMutedRef.current;
    }, []);

    const stopNoise = useCallback(() => {
        if (bgGainRef.current) {
            try { bgGainRef.current.disconnect(); } catch (e) { }
            bgGainRef.current = null;
        }

        if (bgNodeRef.current) {
            try {
                if ((bgNodeRef.current as any).stop) (bgNodeRef.current as any).stop();
                else if ((bgNodeRef.current as any).disconnect) (bgNodeRef.current as any).disconnect();
            } catch (e) { console.warn("StopBg error", e); }
            bgNodeRef.current = null;
        }
    }, []);

    const stopTone = useCallback(() => {
        if (toneNodeRef.current) {
            try {
                toneNodeRef.current.stop();
                toneNodeRef.current.disconnect();
            } catch (e) { }
            toneNodeRef.current = null;
        }
    }, []);

    // Synchronous playTone (removed async/await) to eliminate start latency
    const playTone = useCallback((type: 'in' | 'out' | 'hold', duration: number) => {
        if (isMutedRef.current) return;

        init(); // Fire and forget (ActiveSession.handleStart should have awaited it already)
        stopTone(); // Stop any previous tone
        if (!ctxRef.current || !voiceGainRef.current || ctxRef.current.state !== 'running') return;

        try {
            const o = ctxRef.current.createOscillator();
            const g = ctxRef.current.createGain();
            o.connect(g).connect(voiceGainRef.current!); // Connect to Voice Gain

            const t = ctxRef.current.currentTime;
            const startFreq = type === 'in' ? 180 : 300;
            const endFreq = type === 'in' ? 300 : 150;

            o.frequency.setValueAtTime(startFreq, t);
            if (type !== 'hold') {
                o.frequency.linearRampToValueAtTime(endFreq, t + duration);
            } else {
                o.frequency.setValueAtTime(200, t);
            }

            // Increased Gain (0.4)
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.4, t + 0.1);
            g.gain.linearRampToValueAtTime(0, t + duration);

            o.start(t);
            o.stop(t + duration + 0.1);
            toneNodeRef.current = o;
        } catch (e) { console.warn("PlayTone error", e); }
    }, [init, stopTone]);

    const playBrownNoise = useCallback(() => {
        init();
        stopNoise();
        if (!ctxRef.current || !gainRef.current || ctxRef.current.state !== 'running') return;

        try {
            const bufferSize = ctxRef.current.sampleRate * 2;
            const buffer = ctxRef.current.createBuffer(1, bufferSize, ctxRef.current.sampleRate);
            const data = buffer.getChannelData(0);
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5;
            }

            const noise = ctxRef.current.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;

            const filter = ctxRef.current.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400;

            const bgGain = ctxRef.current.createGain();
            bgGain.gain.value = bgVolumeRef.current;
            bgGainRef.current = bgGain;

            // Connect: Noise -> bgGain -> Master Gain
            noise.connect(filter).connect(bgGain).connect(gainRef.current);
            noise.start();
            bgNodeRef.current = noise;
        } catch (e) { console.warn("BrownNoise error", e); }
    }, [init, stopNoise]);

    const playBinaural = useCallback((baseFreq = 200) => {
        init();
        stopNoise();
        if (!ctxRef.current || !gainRef.current || ctxRef.current.state !== 'running') return;

        try {
            const oscL = ctxRef.current.createOscillator();
            const oscR = ctxRef.current.createOscillator();
            const merger = ctxRef.current.createChannelMerger(2);

            oscL.frequency.value = baseFreq;
            oscR.frequency.value = baseFreq + 40;

            oscL.connect(merger, 0, 0);
            oscR.connect(merger, 0, 1);

            const bgGain = ctxRef.current.createGain();
            bgGain.gain.value = bgVolumeRef.current;
            bgGainRef.current = bgGain;

            // Connect: Binaural -> bgGain -> Master Gain
            merger.connect(bgGain).connect(gainRef.current);

            oscL.start();
            oscR.start();

            bgNodeRef.current = {
                disconnect: () => {
                    try {
                        oscL.stop();
                        oscR.stop();
                        merger.disconnect();
                        bgGain.disconnect();
                    } catch (e) { }
                }
            } as unknown as AudioNode;
        } catch (e) { console.warn("Binaural error", e); }
    }, [init, stopNoise]);

    const playBeep = useCallback(() => {
        if (isMutedRef.current) return;
        init();
        if (!ctxRef.current || !gainRef.current || ctxRef.current.state !== 'running') return;

        try {
            const o = ctxRef.current.createOscillator();
            const g = ctxRef.current.createGain();
            o.frequency.value = 440;
            g.gain.value = 0.3; // Increased

            // Beep also uses Master Gain directly? Or Voice Gain?
            // Let's use Voice Gain for consistent control
            if (voiceGainRef.current) {
                o.connect(g).connect(voiceGainRef.current);
            } else {
                o.connect(g).connect(gainRef.current);
            }

            o.start();
            g.gain.exponentialRampToValueAtTime(0.001, ctxRef.current.currentTime + 0.5);
            o.stop(ctxRef.current.currentTime + 0.5);
        } catch (e) { console.warn("Beep error", e); }
    }, [init]);

    const getVoices = useCallback(() => {
        if ('speechSynthesis' in window) {
            return window.speechSynthesis.getVoices();
        }
        return [];
    }, []);

    const speak = useCallback((text: string, voiceURI?: string, rate?: number, pitch?: number): Promise<void> => {
        return new Promise((resolve) => {
            if (isMutedRef.current) {
                resolve();
                return;
            }
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(text);

                // Default settings
                u.lang = 'es-ES';
                u.rate = rate || 0.9;
                u.pitch = pitch || 1;
                u.volume = volumeRef.current; // Uses Guide volume

                // Voice selection
                const voices = window.speechSynthesis.getVoices();
                if (voiceURI) {
                    const selectedVoice = voices.find(v => v.voiceURI === voiceURI);
                    if (selectedVoice) u.voice = selectedVoice;
                } else {
                    // Auto-select Google Español if available and no specific voice requested
                    const googleVoice = voices.find(v => v.name.toLowerCase().includes('google') && (v.lang.includes('es') || v.lang.includes('ES')));
                    if (googleVoice) u.voice = googleVoice;
                }

                u.onend = () => resolve();
                u.onerror = (e) => {
                    console.warn("Speech error", e);
                    resolve();
                };

                window.speechSynthesis.speak(u);
            } else {
                resolve();
            }
        });
    }, []);

    const playBowl = useCallback(async () => {
        init();
        stopNoise();
        if (!ctxRef.current || !gainRef.current || ctxRef.current.state !== 'running') return;

        try {
            let audioBuffer = bowlBufferRef.current;

            if (!audioBuffer) {
                const response = await fetch('/sounds/cuencos.mp3');
                const arrayBuffer = await response.arrayBuffer();
                if (!ctxRef.current) return;
                audioBuffer = await ctxRef.current.decodeAudioData(arrayBuffer);
                bowlBufferRef.current = audioBuffer;
            }

            if (!ctxRef.current) return;

            const source = ctxRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = true;

            const bgGain = ctxRef.current.createGain();
            bgGain.gain.value = bgVolumeRef.current;
            bgGainRef.current = bgGain;

            // Connect: Bowl -> bgGain -> Master Gain
            source.connect(bgGain).connect(gainRef.current);
            source.start();

            bgNodeRef.current = source;
        } catch (e) {
            console.warn("Bowl MP3 error", e);
        }
    }, [init, stopNoise]);

    const stopBg = useCallback(() => {
        stopNoise();
        stopTone();
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }, [stopNoise, stopTone]);

    const pauseSpeech = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.pause();
        }
    }, []);

    const resumeSpeech = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.resume();
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopBg();
            if (ctxRef.current) {
                try {
                    if (ctxRef.current.state !== 'closed') {
                        ctxRef.current.close();
                    }
                } catch (e) { console.warn("Cleanup error", e); }
                ctxRef.current = null;
                gainRef.current = null;
                bgGainRef.current = null;
                voiceGainRef.current = null;
            }
        }
    }, [stopBg]);

    return {
        init,
        setVolume,
        setBgVolume,
        toggleMute,
        playTone,
        playBrownNoise,
        playBinaural,
        playBowl,
        playBeep,
        speak,
        pauseSpeech,
        resumeSpeech,
        getVoices,
        stopBg,
        stopNoise,
        stopTone
    };
};