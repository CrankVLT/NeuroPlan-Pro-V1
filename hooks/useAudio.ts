import { useRef, useCallback, useEffect } from 'react';

export const useAudio = () => {
    const ctxRef = useRef<AudioContext | null>(null);
    const gainRef = useRef<GainNode | null>(null);
    const bgNodeRef = useRef<AudioNode | null>(null);
    const isMutedRef = useRef(false);
    const volumeRef = useRef(0.5);

    const init = useCallback(() => {
        // Si no existe o está cerrado, crear uno nuevo
        if (!ctxRef.current || ctxRef.current.state === 'closed') {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            ctxRef.current = new AudioContext();
            gainRef.current = ctxRef.current.createGain();
            gainRef.current.connect(ctxRef.current.destination);
            gainRef.current.gain.value = volumeRef.current;
        }
        // Si está suspendido (política de navegadores), reanudar
        if (ctxRef.current.state === 'suspended') {
            ctxRef.current.resume().catch(e => console.warn("Audio resume failed", e));
        }
    }, []);

    const setVolume = useCallback((val: number) => {
        volumeRef.current = val;
        if (gainRef.current && ctxRef.current && ctxRef.current.state === 'running') {
            try {
                gainRef.current.gain.setTargetAtTime(isMutedRef.current ? 0 : val, ctxRef.current.currentTime, 0.1);
            } catch (e) { console.warn(e); }
        }
    }, []);

    const toggleMute = useCallback(() => {
        isMutedRef.current = !isMutedRef.current;
        if (gainRef.current && ctxRef.current && ctxRef.current.state === 'running') {
            try {
                const target = isMutedRef.current ? 0 : volumeRef.current;
                gainRef.current.gain.setTargetAtTime(target, ctxRef.current.currentTime, 0.1);
            } catch (e) { console.warn(e); }
        }
        return isMutedRef.current;
    }, []);

    const playTone = useCallback((type: 'in' | 'out' | 'hold', duration: number) => {
        if (isMutedRef.current) return;
        init();
        if (!ctxRef.current || !gainRef.current || ctxRef.current.state !== 'running') return;

        try {
            const o = ctxRef.current.createOscillator();
            const g = ctxRef.current.createGain();
            o.connect(g).connect(gainRef.current);

            const t = ctxRef.current.currentTime;
            const startFreq = type === 'in' ? 180 : 300;
            const endFreq = type === 'in' ? 300 : 150;

            o.frequency.setValueAtTime(startFreq, t);
            if (type !== 'hold') {
                o.frequency.linearRampToValueAtTime(endFreq, t + duration);
            } else {
                o.frequency.setValueAtTime(200, t);
            }

            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.1, t + 0.1);
            g.gain.linearRampToValueAtTime(0, t + duration);

            o.start(t);
            o.stop(t + duration + 0.1);
        } catch (e) { console.warn("PlayTone error", e); }
    }, [init]);

    const playBrownNoise = useCallback(() => {
        init();
        stopBg();
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

            noise.connect(filter).connect(gainRef.current);
            noise.start();
            bgNodeRef.current = noise;
        } catch (e) { console.warn("BrownNoise error", e); }
    }, [init]);

    const playBinaural = useCallback((baseFreq = 200) => {
        init();
        stopBg();
        if (!ctxRef.current || !gainRef.current || ctxRef.current.state !== 'running') return;

        try {
            const oscL = ctxRef.current.createOscillator();
            const oscR = ctxRef.current.createOscillator();
            const merger = ctxRef.current.createChannelMerger(2);

            oscL.frequency.value = baseFreq;
            oscR.frequency.value = baseFreq + 40;

            oscL.connect(merger, 0, 0);
            oscR.connect(merger, 0, 1);
            merger.connect(gainRef.current);

            oscL.start();
            oscR.start();

            bgNodeRef.current = {
                disconnect: () => {
                    try {
                        oscL.stop();
                        oscR.stop();
                        merger.disconnect();
                    } catch (e) { }
                }
            } as unknown as AudioNode;
        } catch (e) { console.warn("Binaural error", e); }
    }, [init]);

    const playBeep = useCallback(() => {
        if (isMutedRef.current) return;
        init();
        if (!ctxRef.current || !gainRef.current || ctxRef.current.state !== 'running') return;

        try {
            const o = ctxRef.current.createOscillator();
            const g = ctxRef.current.createGain();
            o.frequency.value = 440;
            g.gain.value = 0.1;
            o.connect(g).connect(gainRef.current);
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

    const speak = useCallback((text: string, voiceURI?: string, rate?: number, pitch?: number) => {
        if (isMutedRef.current) return;
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);

            // Default settings
            u.lang = 'es-ES';
            u.rate = rate || 0.9;
            u.pitch = pitch || 1;
            u.volume = volumeRef.current;

            // Voice selection
            if (voiceURI) {
                const voices = window.speechSynthesis.getVoices();
                const selectedVoice = voices.find(v => v.voiceURI === voiceURI);
                if (selectedVoice) u.voice = selectedVoice;
            }

            window.speechSynthesis.speak(u);
        }
    }, []);

    const stopBg = () => {
        if (bgNodeRef.current) {
            try {
                if ((bgNodeRef.current as any).stop) (bgNodeRef.current as any).stop();
                else if ((bgNodeRef.current as any).disconnect) (bgNodeRef.current as any).disconnect();
            } catch (e) { console.warn("StopBg error", e); }
            bgNodeRef.current = null;
        }
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };

    // Cleanup on unmount - CRITICAL FIX
    useEffect(() => {
        return () => {
            stopBg();
            if (ctxRef.current) {
                try {
                    // Check state before closing to avoid errors
                    if (ctxRef.current.state !== 'closed') {
                        ctxRef.current.close();
                    }
                } catch (e) { console.warn("Cleanup error", e); }
                ctxRef.current = null; // Remove reference immediately
                gainRef.current = null;
            }
        }
    }, []);

    return {
        init,
        setVolume,
        toggleMute,
        playTone,
        playBrownNoise,
        playBinaural,
        playBeep,
        speak,
        getVoices,
        stopBg
    };
};