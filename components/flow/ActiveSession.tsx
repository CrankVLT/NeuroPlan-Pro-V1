import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FlowSessionType } from '../../types';
import { useAudio } from '../../hooks/useAudio';

const NSDR_SCRIPT = [
    { time: 0, text: "Bienvenido a NSDR. Encuentra una posición cómoda." },
    { time: 15, text: "Cierra los ojos. Inhala profundamente... y suelta." },
    { time: 45, text: "Lleva tu atención a tus pies. Relájalos completamente." },
    { time: 90, text: "Sube la atención a tus piernas. Déjalas caer pesadamente." },
    { time: 150, text: "Relaja el abdomen. Respiración natural." },
    { time: 240, text: "Siente el peso de tus brazos y hombros." },
    { time: 330, text: "Relaja la mandíbula y los ojos. Rostro sin expresión." },
    { time: 600, text: "Visualízate flotando en un espacio seguro." },
    { time: 1100, text: "Lentamente, comienza a mover los dedos." },
    { time: 1180, text: "Abre los ojos. Te sientes renovado." }
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
    const [audioMode, setAudioMode] = useState<'brown' | '40hz' | 'silent'>('brown');
    const [isResting, setIsResting] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

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
        if (type !== 'focus') return;

        if (status === 'paused' || status === 'idle' || isResting) {
            audio.stopBg();
            return;
        }

        const t = setTimeout(() => {
            if (audioMode === 'brown') audio.playBrownNoise();
            else if (audioMode === '40hz') audio.playBinaural();
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

    const handleStart = async () => {
        audio.init();
        if (!isStopwatch) setPhase('Preparado');

        if (type === 'nsdr') {
            setActiveSubtitle("Iniciando sesión de descanso profundo sin dormir.");
            await audio.speak("Iniciando sesión de descanso profundo sin dormir.", config.voiceURI, config.rate, config.pitch);
        }

        setStatus('running');

        if (type === 'panoramic') {
            setActiveSubtitle("Expande tu visión. Mira al horizonte. Disuelve tu enfoque.");
        }
    };

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
                <div className="flex gap-4">
                    <button
                        onClick={toggleMute}
                        className={`text-2xl transition-all duration-300 ${isMuted ? 'text-slate-600 scale-90' : 'text-white scale-110'}`}
                    >
                        {isMuted ? '🔇' : '🔊'}
                    </button>
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

                        {type === 'focus' && !isResting && (
                            <div className="flex flex-col gap-4 items-center">
                                <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-700">
                                    <button onClick={() => setAudioMode('brown')} className={`px-3 py-1 text-xs font-mono rounded ${audioMode === 'brown' ? 'bg-neuro-purple text-white' : 'text-slate-400'}`}>RUIDO CAFÉ</button>
                                    <button onClick={() => setAudioMode('40hz')} className={`px-3 py-1 text-xs font-mono rounded ${audioMode === '40hz' ? 'bg-neuro-purple text-white' : 'text-slate-400'}`}>40HZ</button>
                                    <button onClick={() => setAudioMode('silent')} className={`px-3 py-1 text-xs font-mono rounded ${audioMode === 'silent' ? 'bg-neuro-purple text-white' : 'text-slate-400'}`}>SILENCIO</button>
                                </div>
                                <p className="text-[10px] text-slate-400 text-center max-w-[250px] leading-tight min-h-[2.5em]">
                                    {audioMode === 'brown' && "Ruido de baja frecuencia. Enmascara el entorno y calma la amígdala."}
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
                    className="bg-slate-800 text-white border border-slate-600 px-6 py-3 rounded-full font-bold text-sm hover:bg-slate-700 transition-colors shadow-lg"
                >
                    REINICIAR
                </button>

                {status !== 'idle' ? (
                    <button
                        onClick={() => {
                            if (status === 'paused') {
                                handleStart();
                            } else {
                                setStatus(s => s === 'running' || s === 'rest' ? 'paused' : (isResting ? 'rest' : 'running'));
                            }
                        }}
                        className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors shadow-lg"
                    >
                        {status === 'paused' ? 'INICIAR / CONTINUAR' : 'PAUSAR'}
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