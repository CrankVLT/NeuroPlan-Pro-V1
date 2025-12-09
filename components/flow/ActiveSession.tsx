import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FlowSessionType } from '../../types';
import { useAudio } from '../../hooks/useAudio';

const NSDR_SCRIPT = [
    { time: 4, text: "Bienvenido. Vamos a dedicar los próximos 20 minutos a un descanso profundo." },
    { time: 10, text: "Lo único que tienes que hacer es escuchar mi voz y seguir las instrucciones sencillas que te daré." },
    { time: 20, text: "Busca un lugar donde puedas recostarte cómodamente o sentarte en una silla reclinable." },
    { time: 30, text: "Acomoda tu cuerpo boca arriba. Deja que tus brazos descansen a los lados, con las palmas de las manos mirando hacia el techo si es posible." },
    { time: 45, text: "Separa un poco las piernas para que tus pies caigan relajados hacia los lados." },
    { time: 60, text: "Haz cualquier movimiento que necesites ahora para estar lo más cómodo posible, porque la idea es que tu cuerpo se quede quieto durante toda la sesión." },
    { time: 75, text: "Cierra los ojos suavemente. Imagina que apagas un interruptor interno." },
    { time: 90, text: "Tu cuerpo está seguro y sostenido por la superficie debajo de ti. No tienes que hacer nada, no tienes que ir a ningún lado. Solo estar aquí." },

    // Fase 2: Respiración (02:00 - 05:00)
    { time: 120, text: "Vamos a usar la respiración para indicarle a tu sistema nervioso que es hora de bajar el ritmo." },
    { time: 132, text: "Vamos a hacer una respiración especial: quiero que tomes aire por la nariz llenando tus pulmones, y al final, toma un poquito más de aire con una segunda inhalación corta." },
    { time: 148, text: "Ahora, suelta todo el aire muy despacio por la boca, como si estuvieras soplando suavemente a través de un popote o pajilla, hasta vaciarte por completo. Vamos a repetirlo." },
    { time: 165, text: "Inhala profundo por la nariz... toma ese segundo sorbo extra de aire... y ahora exhala largo y lento por la boca, dejando que tus hombros y tu espalda se derritan hacia el suelo." },
    { time: 200, text: "Hazlo una vez más a tu propio ritmo. Siente cómo con la salida del aire, cualquier tensión se va de tu cuerpo." },
    { time: 240, text: "Ahora, deja que tu respiración vuelva a ser normal. No intentes controlarla. Deja que tu cuerpo respire por sí solo, de forma natural y sin esfuerzo." },

    // Fase 3: Recorrido Corporal (05:00 - 12:00)
    { time: 300, text: "Vamos a hacer un viaje con tu atención por diferentes partes de tu cuerpo. No es necesario que muevas nada." },
    { time: 315, text: "Solo lleva tu mente a la zona que yo nombre, como si una luz suave la iluminara por un instante." },
    { time: 330, text: "Lleva tu atención a la mano derecha. Siente el dedo pulgar... el índice... el dedo medio... el anular... y el meñique." },
    { time: 350, text: "Siente la palma de la mano y la muñeca." },
    { time: 375, text: "Sube tu atención por el antebrazo derecho... el codo... el brazo... hasta llegar al hombro derecho. Siente cómo ese hombro se relaja completamente." },
    { time: 420, text: "Ahora cambia tu atención a la mano izquierda. Siente el pulgar... índice... medio... anular... y meñique." },
    { time: 440, text: "La palma de la mano... la muñeca. Sube por el antebrazo... codo... brazo... hasta el hombro izquierdo." },
    { time: 480, text: "Lleva tu mente hacia tus pies. Siente los dedos del pie derecho y del pie izquierdo. Los talones." },
    { time: 510, text: "Sube por las pantorrillas... las rodillas... y los muslos. Siente cómo tus piernas pesan, están muy relajadas." },
    { time: 570, text: "Enfócate en tu espalda. Siente cómo toda tu columna vertebral descansa sobre la superficie. Siente tu abdomen subiendo y bajando suavemente. Siente tu pecho." },
    { time: 645, text: "Finalmente, relaja el cuello. Suelta la mandíbula, deja que los dientes se separen un poco. Relaja la lengua, las mejillas y los ojos. Alisa tu frente. Todo tu cuerpo está en pausa." },

    // Fase 4: Sensaciones (12:00 - 16:00)
    { time: 720, text: "Ahora imagina que tu cuerpo es muy pesado. Como si estuvieras hecho de plomo o de piedra." },
    { time: 740, text: "Siente cómo la gravedad te atrae hacia abajo, hundiéndote cómodamente en el colchón o el suelo. Pesado y relajado." },
    { time: 810, text: "Ahora, imagina lo contrario. Siente que tu cuerpo se vuelve ligero, muy ligero. Como una pluma o una nube. Como si apenas tocaras la superficie donde estás." },
    { time: 870, text: "Quédate en este punto medio. Tu cuerpo está profundamente dormido, pero tú sigues aquí, escuchando, despierto y tranquilo." },
    { time: 900, text: "Si aparece algún pensamiento, no pelees con él; déjalo pasar como si fuera un pájaro cruzando el cielo y vuelve a escuchar mi voz." },
    { time: 930, text: "Disfruta de este momento de nada. Es como recargar una batería. Estás recuperando tu energía simplemente estando quieto." },

    // Fase 5: Regreso (16:00 - 18:00)
    { time: 960, text: "Lentamente, vamos a empezar a volver. Siente de nuevo el contacto de tu cuerpo con la superficie. Escucha los sonidos lejanos que pueda haber en la habitación." },
    { time: 1005, text: "Haz una inhalación un poco más profunda, llenándote de energía fresca. Siente cómo el aire despierta tu cuerpo por dentro." },
    { time: 1050, text: "Recuerda dónde estás y qué hora del día es. Prepárate para moverte, pero hazlo con calma, conservando esta sensación de tranquilidad." },

    // Fase 6: Despertar (18:00 - 20:00)
    { time: 1080, text: "Empieza moviendo muy suavemente los dedos de las manos y de los pies. Haz círculos suaves con tus muñecas y tobillos." },
    { time: 1125, text: "Si lo deseas, lleva tus brazos por encima de la cabeza y estírate como si acabaras de despertar de un sueño largo y reparador. Estira todo el cuerpo." },
    { time: 1170, text: "Cuando te sientas listo, abre despacio los ojos. Tómate un momento para acostumbrarte a la luz. Te has regalado un descanso profundo y efectivo." }
];

export const ActiveSession: React.FC<{ type: FlowSessionType; config: any; onExit: () => void; onComplete: () => void }> = ({ type, config, onExit, onComplete }) => {
    const audio = useAudio();
    const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'rest'>('paused');

    // Time State
    const [timeLeft, setTimeLeft] = useState(0); // For Countdown
    const [elapsedTime, setElapsedTime] = useState(0); // For Stopwatch
    const [totalDuration, setTotalDuration] = useState(0);

    const [phase, setPhase] = useState<string>('Listo');
    const [cycleCount, setCycleCount] = useState(0);
    const [scale, setScale] = useState(1);
    const [stepDuration, setStepDuration] = useState(1);

    // UI Visuals
    const [activeSubtitle, setActiveSubtitle] = useState("Toca INICIAR para comenzar");
    const [audioMode, setAudioMode] = useState<'brown' | '40hz' | 'bowl' | 'silent'>('brown');
    const [isResting, setIsResting] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [bgVolume, setBgVolume] = useState(0.2);
    const [voiceVolume, setVoiceVolume] = useState(0.5); // New state for Voice Volume
    const [showVolume, setShowVolume] = useState(false);
    const [isAudioReady, setIsAudioReady] = useState(false); // Gate controls while audio inits

    // Refs
    const timerRef = useRef<number | null>(null);
    const breathingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMountedRef = useRef(true);

    const isStopwatch = config.mode === 'stopwatch';

    // Mute Handler
    const toggleMute = () => {
        audio.toggleMute();
        setIsMuted(prev => !prev);
    };

    // Audio Effect Logic
    useEffect(() => {
        if (!isMountedRef.current) return;
        if (type !== 'focus' && type !== 'nsdr') return; // Enable for NSDR too

        if (status === 'paused' || status === 'idle' || isResting) {
            audio.stopBg();
            return;
        }

        const t = setTimeout(() => {
            if (audioMode === 'brown') audio.playBrownNoise();
            else if (audioMode === '40hz') audio.playBinaural();
            else if (audioMode === 'bowl') audio.playBowl();
            else audio.stopBg();
        }, 100);
        return () => clearTimeout(t);
    }, [audioMode, status, isResting, type]);

    // Initialization Logic
    useEffect(() => {
        isMountedRef.current = true;
        let duration = 0;

        if (['gaze', 'panoramic'].includes(type)) {
            duration = Number(config.duration) || 60;
        } else if (type === 'focus' || type === 'nsdr') {
            duration = (Number(config.duration) || 20) * 60;
        } else if (config.duration) {
            duration = Number(config.duration) * 60;
        }

        setTimeLeft(duration);
        setTotalDuration(duration);
        setElapsedTime(0);
        setCycleCount(0);
        setIsResting(false);

        if (isStopwatch) {
            setPhase("Modo Libre (Cronómetro)");
        }

        return () => {
            isMountedRef.current = false;
            if (timerRef.current) clearInterval(timerRef.current);
            if (breathingTimeoutRef.current) clearTimeout(breathingTimeoutRef.current);
            audio.stopBg();
        };
    }, []);

    const isAtStart = isStopwatch ? elapsedTime === 0 : timeLeft === totalDuration;

    const handleStart = async () => {
        // audio.init() is pre-warmed on mount, but we ensure it here just in case (non-blocking)
        audio.init();
        if (!isStopwatch) setPhase('Preparado');

        // Only play intro if starting from the beginning
        if (type === 'nsdr' && isAtStart) {
            setActiveSubtitle("Iniciando sesión de descanso profundo sin dormir.");
            audio.speak("Iniciando sesión de descanso profundo sin dormir.", config.voiceURI, config.rate, config.pitch);
        }

        setStatus('running');

        if (type === 'panoramic') {
            setActiveSubtitle("Expande tu visión. Mira al horizonte. Disuelve tu enfoque.");
        }
    };

    // Pre-warm Audio Engine on Mount
    useEffect(() => {
        // Enforce a minimum visible delay (3.5s) so user perceives initialization
        const minDelay = new Promise(resolve => setTimeout(resolve, 3500));
        const audioInit = audio.init();

        Promise.all([audioInit, minDelay]).then(() => {
            console.log("Audio Engine Ready");
            setIsAudioReady(true);
        }).catch(e => {
            console.warn("Audio Init Failed", e);
            setIsAudioReady(true); // Enable anyway
        });
    }, []);

    // Audio Pause/Resume Sync
    useEffect(() => {
        if (status === 'paused') {
            audio.pauseSpeech();
            if (audio.stopTone) audio.stopTone(); // Stop breathing tones
            if (audio.stopNoise) audio.stopNoise(); // Stop bg noise
            else audio.stopBg();
        } else if (status === 'running') {
            audio.resumeSpeech();
            // Bg noise resumes via its own effect
        }
    }, [status]);

    // Timer Logic
    useEffect(() => {
        if ((status === 'running' || status === 'rest') && !isBreathingSession) {
            timerRef.current = window.setInterval(() => {
                if (!isMountedRef.current) return;

                if (isStopwatch && !isResting) {
                    // Stopwatch Mode
                    setElapsedTime(prev => prev + 1);
                } else {
                    // Countdown Mode
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            clearInterval(timerRef.current!);
                            audio.playBeep();
                            if (type === 'focus' && !isResting) {
                                setPhase("Tiempo de Enfoque Completado");
                                setStatus('idle');
                                setTimeout(() => onComplete(), 0);
                            } else {
                                setStatus('idle');
                                setPhase("Sesión Completada");
                                setActiveSubtitle("Sesión finalizada. Abre los ojos suavemente.");
                                setTimeout(() => onComplete(), 0);
                            }
                            return 0;
                        }

                        if (type === 'nsdr' && status === 'running') {
                            const elapsed = totalDuration - prev;
                            const step = NSDR_SCRIPT.find(s => Math.abs(s.time - elapsed) < 1);
                            if (step) {
                                audio.speak(step.text, config.voiceURI, config.rate, config.pitch);
                                setActiveSubtitle(step.text);
                            }
                        }
                        return prev - 1;
                    });
                }
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [status, timeLeft, isResting, type, totalDuration, isStopwatch]);

    const startRest = () => {
        setIsResting(true);
        setTimeLeft(20 * 60);
        setTotalDuration(20 * 60);
        setStatus('rest');
        setPhase("Recuperación Pasiva");
        audio.stopBg();
    };

    const resetSession = () => {
        audio.stopBg();
        let duration = 0;

        if (['gaze', 'panoramic'].includes(type)) {
            duration = Number(config.duration) || 60;
        } else if (type === 'focus' || type === 'nsdr') {
            duration = (Number(config.duration) || 20) * 60;
        } else if (config.duration) {
            duration = Number(config.duration) * 60;
        }

        setTimeLeft(duration);
        setTotalDuration(duration);
        setElapsedTime(0);
        setCycleCount(0);
        setStatus('paused');
        setPhase(isStopwatch ? 'Modo Libre' : 'Listo');
        setIsResting(false);
        setActiveSubtitle("Toca INICIAR para comenzar");
    };

    // Breathing Logic (Only for countdown/breathing sessions)
    useEffect(() => {
        if (['focus', 'nsdr', 'gaze', 'panoramic'].includes(type) || status !== 'running' || isStopwatch) return;
        if (config.duration && type !== 'active' && type !== 'tummo' && type !== 'calm' && type !== 'custom') return;

        const breathConfig = config;

        const runStep = (text: string, s: number, dur: number, tone: 'in' | 'out' | 'hold', next: () => void) => {
            if (!isMountedRef.current || status !== 'running') return;
            setPhase(text);
            setStepDuration(dur);
            setScale(s);
            audio.playTone(tone, dur);
            breathingTimeoutRef.current = setTimeout(() => next(), dur * 1000);
        };

        const cycle = () => {
            if (!isMountedRef.current || status !== 'running') return;
            if (cycleCount >= breathConfig.cycles) {
                setStatus('idle');
                audio.playBeep();
                setPhase("Completado");
                setTimeout(() => onComplete(), 0);
                return;
            }
            if (breathConfig.double) {
                runStep("INHALA (80%)", 1.3, 1.5, 'in', () =>
                    runStep("INHALA (100%)", 1.5, 0.8, 'in', () =>
                        runStep("EXHALA", 1.0, breathConfig.exhale, 'out', () =>
                            runStep("ESPERA", 1.0, 1.0, 'hold', () => {
                                setCycleCount(c => c + 1);
                                cycle();
                            })
                        )
                    )
                );
            } else {
                const h1 = breathConfig.hold1 || 0;
                const h2 = breathConfig.hold2 || 0;
                runStep("INHALA", 1.5, breathConfig.inhale, 'in', () => {
                    const step2 = () => runStep("EXHALA", 1.0, breathConfig.exhale, 'out', () => {
                        const step3 = () => { setCycleCount(c => c + 1); cycle(); };
                        if (h2 > 0) runStep("VACÍO", 1.0, h2, 'hold', step3);
                        else step3();
                    });
                    if (h1 > 0) runStep("RETÉN", 1.5, h1, 'hold', step2);
                    else step2();
                });
            }
        };

        cycle();
        return () => { if (breathingTimeoutRef.current) clearTimeout(breathingTimeoutRef.current); };
    }, [status, type, cycleCount, isStopwatch]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const getColor = () => {
        if (type === 'active' || type === 'tummo') return 'neuro-red';
        if (type === 'focus') return 'neuro-purple';
        if (type === 'calm' || type === 'panoramic') return 'neuro-blue';
        if (type === 'nsdr') return 'neuro-green';
        return 'neuro-cyan';
    };

    const colorClass = getColor();
    const borderClass = `border-${colorClass}`;
    const bgClass = `bg-${colorClass}`;
    const hexColor = (() => {
        if (type === 'active' || type === 'tummo') return '#ff003c';
        if (type === 'focus') return '#7000ff';
        if (type === 'calm' || type === 'panoramic') return '#3b82f6';
        if (type === 'nsdr') return '#00ff9d';
        return '#00f0ff';
    })();

    const getSessionTitle = () => {
        const map: any = {
            'gaze': 'ENFOQUE VISUAL',
            'active': 'ACTIVACIÓN',
            'tummo': 'TUMMO',
            'focus': 'TRABAJO PROFUNDO',
            'calm': 'CALMA',
            'nsdr': 'NSDR',
            'panoramic': 'VISIÓN PANORÁMICA',
            'custom': 'PERSONALIZADO'
        };
        return map[type] || type.toUpperCase();
    };

    const isBreathingSession = !['focus', 'nsdr', 'gaze', 'panoramic'].includes(type) && !config.duration && !isStopwatch;

    return createPortal(
        <div className="fixed inset-0 z-[200] bg-neuro-bg flex flex-col items-center justify-center p-6 animate-fadeIn">
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${bgClass} rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse-slow pointer-events-none`}></div>

            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 pt-24 md:pt-6">
                <div className="flex flex-col">
                    <h3 className="text-xs font-mono font-bold tracking-[0.2em] text-slate-500 uppercase">
                        SESIÓN {getSessionTitle()} {isResting ? '(DESCANSO)' : ''}
                    </h3>
                    {isStopwatch && <span className="text-[10px] text-neuro-cyan font-bold uppercase tracking-wider">MODO LIBRE (CRONÓMETRO)</span>}
                </div>
                <div className="flex gap-4 items-start z-50">
                    <div className="relative">
                        <button
                            onClick={() => setShowVolume(!showVolume)}
                            className={`text-2xl transition-all duration-300 ${isMuted ? 'text-slate-600' : 'text-white'} hover:scale-110 active:scale-95`}
                        >
                            {isMuted ? '🔇' : '🔊'}
                        </button>

                        {/* Volume Popover (Click to toggle) */}
                        {showVolume && (
                            <div className="absolute top-full right-0 mt-4 bg-slate-900/95 border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-4 shadow-2xl backdrop-blur-md animate-fadeIn z-50 min-w-[140px]">
                                <div className="flex gap-4">
                                    {/* Voice Slider */}
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-[10px] font-mono text-neuro-purple font-bold tracking-widest writing-vertical">VOZ</span>
                                        <div className="h-32 flex items-center justify-center relative py-2">
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                value={voiceVolume}
                                                onChange={(e) => {
                                                    const v = parseFloat(e.target.value);
                                                    setVoiceVolume(v);
                                                    if (audio.setVolume) audio.setVolume(v);
                                                }}
                                                className="w-1.5 h-28 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-neuro-purple [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                                style={{ writingMode: 'vertical-lr', direction: 'rtl' } as any}
                                            />
                                        </div>
                                    </div>

                                    {/* Background Slider */}
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-[10px] font-mono text-slate-400 font-bold tracking-widest writing-vertical">FONDO</span>
                                        <div className="h-32 flex items-center justify-center relative py-2">
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                value={bgVolume}
                                                onChange={(e) => {
                                                    const v = parseFloat(e.target.value);
                                                    setBgVolume(v);
                                                    if (audio.setBgVolume) audio.setBgVolume(v);
                                                }}
                                                className="w-1.5 h-28 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-slate-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                                                style={{ writingMode: 'vertical-lr', direction: 'rtl' } as any}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={toggleMute}
                                    className="text-[10px] uppercase font-bold text-slate-400 hover:text-white border-t border-slate-700 pt-3 w-full transition-colors"
                                >
                                    {isMuted ? 'UNMUTE' : 'MUTE'}
                                </button>
                            </div>
                        )}
                    </div>

                    <button onClick={onExit} className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700 text-white">✕</button>
                </div>
            </div>

            {/* Main Visualizer */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-lg mb-32">
                {!isBreathingSession ? (
                    <div className="text-center w-full relative">
                        <div className={`${['gaze', 'panoramic'].includes(type) ? 'fixed bottom-8 right-8 text-2xl opacity-30 hover:opacity-100' : 'text-8xl mb-8'} font-black text-white font-mono tracking-tighter tabular-nums transition-all duration-500`}>
                            {isStopwatch ? formatTime(elapsedTime) : formatTime(timeLeft)}
                        </div>

                        {(type === 'focus' || type === 'nsdr') && !isResting && (
                            <div className="flex flex-col gap-4 items-center">
                                <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-700">
                                    <button onClick={() => setAudioMode('brown')} className={`px-3 py-1 text-xs font-mono rounded ${audioMode === 'brown' ? 'bg-neuro-purple text-white' : 'text-slate-400'}`}>RUIDO CAFÉ</button>
                                    <button onClick={() => setAudioMode('bowl')} className={`px-3 py-1 text-xs font-mono rounded ${audioMode === 'bowl' ? 'bg-neuro-purple text-white' : 'text-slate-400'}`}>CUENCOS</button>
                                    <button onClick={() => setAudioMode('40hz')} className={`px-3 py-1 text-xs font-mono rounded ${audioMode === '40hz' ? 'bg-neuro-purple text-white' : 'text-slate-400'}`}>40HZ</button>
                                    <button onClick={() => setAudioMode('silent')} className={`px-3 py-1 text-xs font-mono rounded ${audioMode === 'silent' ? 'bg-neuro-purple text-white' : 'text-slate-400'}`}>SILENCIO</button>
                                </div>
                                <p className="text-[10px] text-slate-400 text-center max-w-[250px] leading-tight min-h-[2.5em]">
                                    {audioMode === 'brown' && "Ruido de baja frecuencia. Enmascara el entorno y calma la amígdala."}
                                    {audioMode === 'bowl' && "Resonancia armónica. Induce estados meditativos profundos."}
                                    {audioMode === '40hz' && "Ondas Gamma. Sincroniza la actividad neuronal para máxima concentración."}
                                    {audioMode === 'silent' && "Ausencia de estímulos. Ideal si tu entorno ya es silencioso."}
                                </p>
                            </div>
                        )}
                        {/* NSDR */}
                        {type === 'nsdr' && (
                            <div className="w-full mt-8 px-4">
                                <div className="min-h-[60px] flex items-center justify-center mb-6">
                                    <p className="text-neuro-green font-medium text-center leading-relaxed text-lg animate-[fadeIn_0.5s]">
                                        {activeSubtitle}
                                    </p>
                                </div>
                                <div className="h-1 bg-slate-800 rounded-full w-full relative">
                                    <div
                                        className="h-full bg-neuro-green absolute left-0 top-0 transition-all duration-1000"
                                        style={{ width: `${((totalDuration - timeLeft) / totalDuration) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        {type === 'panoramic' && (
                            <div className="mt-8 px-8">
                                <p className="text-neuro-blue font-medium text-center mb-8 animate-pulse">
                                    {activeSubtitle}
                                </p>
                                <div className="relative w-64 h-32 mx-auto overflow-hidden">
                                    <div className="absolute left-0 bottom-0 w-full h-full border-b-4 border-neuro-blue rounded-[50%] animate-[pulse_4s_ease-in-out_infinite] opacity-50"></div>
                                    <div className="absolute left-[-20%] bottom-[-20%] w-[140%] h-[140%] border-b-2 border-cyan-400 rounded-[50%] animate-[pulse_5s_ease-in-out_infinite] opacity-30"></div>
                                </div>
                            </div>
                        )}
                        {type === 'gaze' && (
                            <div className="mt-12 relative w-12 h-12 mx-auto">
                                <div className="absolute inset-0 bg-neuro-cyan rounded-full animate-ping opacity-20"></div>
                                <div className="relative w-full h-full bg-neuro-cyan rounded-full shadow-[0_0_30px_cyan]"></div>
                            </div>
                        )}
                    </div>
                ) : (
                    // Breathing Visualizer
                    <>
                        <div
                            className={`w-56 h-56 rounded-full border-4 ${borderClass} flex flex-col items-center justify-center transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)]`}
                            style={{
                                transform: `scale(${scale})`,
                                transitionDuration: `${stepDuration}s`,
                                transitionTimingFunction: 'ease-in-out',
                                borderColor: scale > 1.2 ? 'white' : undefined,
                                boxShadow: scale > 1.2 ? `0 0 80px ${hexColor}` : 'none'
                            }}
                        >
                            <span className="text-xl font-bold text-slate-300 uppercase tracking-widest mb-1 text-center px-2 leading-tight">{phase}</span>
                        </div>
                        <div className="absolute -bottom-16 font-mono text-slate-500 pointer-events-none z-20">
                            CICLO <span className="text-white text-xl">{cycleCount}</span> <span className="text-xs">/ {config.cycles}</span>
                        </div>
                    </>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-32 flex gap-4 z-20">
                <button
                    onClick={resetSession}
                    disabled={!isAudioReady}
                    className={`bg-slate-800 text-white border border-slate-600 px-6 py-3 rounded-full font-bold text-sm transition-colors shadow-lg ${!isAudioReady ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700'}`}
                >
                    REINICIAR
                </button>

                {status !== 'idle' ? (
                    <button
                        onClick={() => {
                            if (!isAudioReady) return;
                            if (status === 'paused') {
                                handleStart();
                            } else {
                                setStatus(s => s === 'running' || s === 'rest' ? 'paused' : (isResting ? 'rest' : 'running'));
                            }
                        }}
                        disabled={!isAudioReady}
                        className={`bg-white text-black px-8 py-3 rounded-full font-bold text-sm transition-colors shadow-lg min-w-[140px] flex items-center justify-center gap-2 ${!isAudioReady ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200'}`}
                    >
                        {!isAudioReady && <span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                        {status === 'paused' ? (isAtStart ? 'INICIAR' : 'CONTINUAR') : 'PAUSAR'}
                    </button>
                ) : null}

                {isStopwatch && (
                    <button
                        onClick={() => onComplete()}
                        className="bg-neuro-purple text-white px-6 py-3 rounded-full font-bold text-sm hover:brightness-110 transition-colors shadow-lg"
                    >
                        TERMINAR
                    </button>
                )}

                {type === 'focus' && !isResting && !isStopwatch && (
                    <button
                        onClick={startRest}
                        className="bg-neuro-blue text-white px-6 py-3 rounded-full font-bold text-sm hover:brightness-110 transition-colors shadow-lg"
                    >
                        DESCANSAR (20m)
                    </button>
                )}
            </div>
        </div>,
        document.body
    );
};