import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../hooks/useAudio';

interface StudyStep {
    id: number;
    title: string;
    description: string;
    action: string;
    duration: number; // in minutes (default)
    phase: 'warmup' | 'immersion' | 'execution';
}

const STUDY_FLOW: StudyStep[] = [
    // FASE 1: Calentamiento
    {
        id: 1,
        title: "El Podcast",
        description: "Audio Overview pasivo para engañar al cerebro y entrar en contexto.",
        action: "Sube tu archivo a NotebookLM, genera el 'Resumen de Audio' y escucha con los ojos cerrados.",
        duration: 10,
        phase: 'warmup'
    },
    {
        id: 2,
        title: "Mapa de Terreno",
        description: "Visualización de la estructura y jerarquía de conceptos.",
        action: "Pide a NotebookLM: 'Genera un mapa mental detallado jerarquizando conceptos'. Analiza el esquema.",
        duration: 5,
        phase: 'warmup'
    },
    // FASE 2: Inmersión
    {
        id: 3,
        title: "La Brújula",
        description: "Guía de estudio para separar lo importante de la paja.",
        action: "En NotebookLM selecciona 'Guía de Estudio'. Lee esto PRIMERO, antes del original.",
        duration: 10,
        phase: 'immersion'
    },
    {
        id: 4,
        title: "La Fuente",
        description: "Lectura enfocada del documento original para detalles finos.",
        action: "Lee el documento original (PDF/PPT). Busca los detalles técnicos que faltaron en el resumen.",
        duration: 45,
        phase: 'immersion'
    },
    // FASE 3: Ejecución
    {
        id: 5,
        title: "Práctica Real",
        description: "Validación de teoría con casos prácticos.",
        action: "Resuelve los ejercicios de tu material (IPLACEX/Libro). Intenta no mirar apuntes.",
        duration: 20,
        phase: 'execution'
    },
    {
        id: 6,
        title: "El Martillo",
        description: "Memorización a fuerza bruta de datos duros.",
        action: "Pide a NotebookLM: 'Crea flashcards de [Conceptos que fallaste]'. Repásalas.",
        duration: 10,
        phase: 'execution'
    },
    {
        id: 7,
        title: "Examen Final",
        description: "Ticket de salida para validar aprendizaje.",
        action: "Pide un cuestionario de selección múltiple sobre todo el texto en NotebookLM. Responde.",
        duration: 10,
        phase: 'execution'
    }
];

export const CortexModule: React.FC = () => {
    const audio = useAudio();
    const [activeStep, setActiveStep] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    const timerRef = useRef<number | null>(null);

    // Timer Logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = window.setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        audio.playBeep();
                        setIsRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            if(timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [isRunning, timeLeft]);

    const startStep = (step: StudyStep) => {
        setActiveStep(step.id);
        setTimeLeft(step.duration * 60);
        setIsRunning(true);
    };

    const toggleTimer = () => setIsRunning(!isRunning);

    const completeStep = (id: number) => {
        if (!completedSteps.includes(id)) {
            setCompletedSteps([...completedSteps, id]);
        }
        setActiveStep(null);
        setIsRunning(false);
        audio.playBeep();
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const getPhaseColor = (phase: string) => {
        if (phase === 'warmup') return 'neuro-blue';
        if (phase === 'immersion') return 'neuro-purple';
        return 'neuro-green';
    };

    const currentStepObj = STUDY_FLOW.find(s => s.id === activeStep);

    return (
        <div className="pb-24 animate-fadeIn">
            <h2 className="text-3xl font-black text-white mb-2">Cortex <span className="text-neuro-cyan text-sm align-top">BETA</span></h2>
            <p className="text-slate-400 text-sm mb-6">Suite de estudio optimizada por energía. Companion para NotebookLM.</p>

            {/* Active Step Overlay */}
            {currentStepObj && (
                <div className="fixed inset-0 z-[100] bg-neuro-bg flex flex-col items-center justify-center p-6 animate-slideUp">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-${getPhaseColor(currentStepObj.phase)}`}></div>
                    
                    <div className="text-center max-w-lg w-full">
                        <span className={`text-xs font-bold uppercase tracking-widest text-${getPhaseColor(currentStepObj.phase)} mb-4 block`}>
                            FASE: {currentStepObj.phase.toUpperCase()}
                        </span>
                        <h1 className="text-4xl font-black text-white mb-6">{currentStepObj.title}</h1>
                        
                        <div className="glass p-6 rounded-xl border border-slate-700 mb-8 text-left">
                            <h3 className="text-slate-300 font-bold mb-2">INSTRUCCIÓN:</h3>
                            <p className="text-white text-lg leading-relaxed">{currentStepObj.action}</p>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <span className="text-xs text-slate-500 uppercase">HERRAMIENTA REQUERIDA:</span>
                                <div className="flex items-center gap-2 mt-1 text-neuro-cyan font-bold">
                                    <span>🧠 NotebookLM / Material Original</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-7xl font-mono font-bold text-white mb-8 tabular-nums">
                            {formatTime(timeLeft)}
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button 
                                onClick={toggleTimer}
                                className={`px-8 py-4 rounded-full font-bold text-sm transition-all ${isRunning ? 'bg-slate-800 text-white border border-slate-600' : 'bg-white text-black hover:bg-slate-200'}`}
                            >
                                {isRunning ? 'PAUSAR' : 'REANUDAR'}
                            </button>
                            <button 
                                onClick={() => completeStep(currentStepObj.id)}
                                className="px-8 py-4 rounded-full bg-neuro-green text-black font-bold text-sm hover:brightness-110 shadow-[0_0_20px_rgba(0,255,157,0.3)]"
                            >
                                COMPLETAR
                            </button>
                            <button 
                                onClick={() => setActiveStep(null)}
                                className="px-4 py-4 rounded-full text-slate-500 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Steps List */}
            <div className="space-y-8 relative">
                {/* Connector Line */}
                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-800 -z-10"></div>

                {['warmup', 'immersion', 'execution'].map((phase, idx) => (
                    <div key={phase}>
                        <h3 className={`text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 pl-16 flex items-center gap-2`}>
                            <span className={`w-2 h-2 rounded-full bg-${getPhaseColor(phase)}`}></span>
                            FASE {idx + 1}: {phase === 'warmup' ? 'CALENTAMIENTO' : phase === 'immersion' ? 'INMERSIÓN' : 'EJECUCIÓN'}
                        </h3>
                        
                        <div className="space-y-4">
                            {STUDY_FLOW.filter(s => s.phase === phase).map((step) => {
                                const isCompleted = completedSteps.includes(step.id);
                                const isLocked = step.id > 1 && !completedSteps.includes(step.id - 1);

                                return (
                                    <div 
                                        key={step.id}
                                        className={`relative flex items-start gap-4 p-4 rounded-xl border transition-all ${
                                            isCompleted ? 'bg-slate-900/30 border-neuro-green/30 opacity-75' : 
                                            isLocked ? 'bg-slate-900/20 border-slate-800 opacity-50 grayscale' : 
                                            'glass border-slate-700 hover:border-white/30'
                                        }`}
                                    >
                                        {/* Status Icon */}
                                        <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center font-bold text-lg border-2 z-10 ${
                                            isCompleted ? 'bg-neuro-green text-black border-neuro-green' : 
                                            isLocked ? 'bg-slate-900 text-slate-600 border-slate-700' : 
                                            `bg-slate-900 text-${getPhaseColor(phase)} border-${getPhaseColor(phase)}`
                                        }`}>
                                            {isCompleted ? '✓' : step.id}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className={`font-bold text-lg ${isCompleted ? 'text-neuro-green line-through' : 'text-white'}`}>{step.title}</h4>
                                                <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded">{step.duration} min</span>
                                            </div>
                                            <p className="text-sm text-slate-400 mt-1 mb-3">{step.description}</p>
                                            
                                            {!isCompleted && !isLocked && (
                                                <button 
                                                    onClick={() => startStep(step)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-${getPhaseColor(phase)} text-white hover:brightness-110 shadow-[0_0_10px_rgba(0,0,0,0.3)]`}
                                                >
                                                    INICIAR BLOQUE
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-center">
                 <p className="text-xs text-slate-500 mb-2">ESTADO DE LA SESIÓN</p>
                 <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-neuro-cyan transition-all duration-500" 
                        style={{ width: `${(completedSteps.length / STUDY_FLOW.length) * 100}%` }}
                     ></div>
                 </div>
                 <p className="text-xs text-neuro-cyan font-bold mt-2">{Math.round((completedSteps.length / STUDY_FLOW.length) * 100)}% COMPLETADO</p>
            </div>
        </div>
    );
};