import React, { useState, useEffect } from 'react';
import { useAudio } from '../hooks/useAudio';
import { FlowSessionType } from '../types';
import { ActiveSession } from './flow/ActiveSession';

// --- GAMING ROUTINES (MOVED FROM FLOW) ---
const GAMER_ROUTINES = [
    {
        title: "Inmersión Acción (FPS/Horror)",
        desc: "Simula el estado de alerta del personaje. Apaga el análisis, enciende el instinto.",
        steps: ['calm', 'gaze', 'active']
    },
    {
        title: "Inmersión Rol (RPG/Open World)",
        desc: "Entra en el mundo con calma y presencia. Ideal para juegos de historia.",
        steps: ['calm', 'gaze', 'panoramic']
    },
    {
        title: "Tilt Reset / Frustración",
        desc: "Úsalo cuando mueras repetidamente o te pierdas. Baja la ira, mantén el foco.",
        steps: ['calm', 'panoramic']
    }
];

// --- STUDY FLOW TYPES & DATA ---
interface StudyPhase {
    id: number;
    title: string;
    description: string;
    steps: StudyStep[];
}

interface StudyStep {
    id: string;
    label: string;
    instruction?: string;
    type: 'checkbox' | 'timer' | 'input';
    timerType?: FlowSessionType;
    duration?: number; // minutes for timer
}

const DEEP_STUDY_FLOW: StudyPhase[] = [
    {
        id: 0,
        title: "Fase 0: Configuración",
        description: "Checklist manual de pre-requisitos.",
        steps: [
            { id: 's0_1', label: "Fuente cargada en NotebookLM", type: 'checkbox' },
            { id: 's0_2', label: "Chat como 'Guía de aprendizaje'", type: 'checkbox' },
            { id: 's0_3', label: "Audio Overview generado", instruction: "Prompt: Enfócate en procesos logísticos y legales, omite historia", type: 'checkbox' },
            { id: 's0_4', label: "Video Overview generado (Opcional)", type: 'checkbox' },
            { id: 's0_5', label: "Infografía generada", type: 'checkbox' },
            { id: 's0_6', label: "Mapa Mental generado", type: 'checkbox' },
            { id: 's0_7', label: "Guía de Estudio generada", type: 'checkbox' },
            { id: 's0_8', label: "Flashcards generadas", instruction: "Prompt: Genera tarjetas solo sobre el vocabulario técnico", type: 'checkbox' },
            { id: 's0_9', label: "Cuestionario generado", instruction: "Prompt: Genera preguntas sobre vocabulario y conceptos clave", type: 'checkbox' }
        ]
    },
    {
        id: 1,
        title: "Fase 1: Neuro-Priming",
        description: "Gatillo biológico de entrada.",
        steps: [
            { id: 's1_1', label: "Enfoque Visual (45s)", type: 'timer', timerType: 'gaze' },
            { id: 's1_2', label: "Activación (3 min)", type: 'timer', timerType: 'active' }
        ]
    },
    {
        id: 2,
        title: "Fase 2: Ingesta Pasiva",
        description: "Consumo de baja fricción.",
        steps: [
            { id: 's2_1', label: "Audio Overview Escuchado", type: 'checkbox' },
            { id: 's2_2', label: "Video Overview Visto", type: 'checkbox' }
        ]
    },
    {
        id: 3,
        title: "Fase 3: Estructuración Activa",
        description: "Deep Work: Procesamiento y decodificación.",
        steps: [
            { id: 's3_1', label: "Infografía Analizada", type: 'checkbox' },
            { id: 's3_2', label: "Mapa Mental Procesado", instruction: "Genera notas por cada nodo en NotebookLM", type: 'checkbox' },
            { id: 's3_3', label: "Lectura Inicial: Guía de Estudio", type: 'checkbox' },
            { id: 's3_4', label: "Lectura Profunda: Documento Original", instruction: "Responder preguntas de la guía mientras se lee", type: 'checkbox' }
        ]
    },
    {
        id: 4,
        title: "Fase 4: Verificación",
        description: "Testing Effect y Active Recall.",
        steps: [
            { id: 's4_1', label: "Ejercicios Originales Resueltos", type: 'checkbox' },
            { id: 's4_2', label: "Sesión de Flashcards (Mental)", instruction: "Si fallas, anota para repaso", type: 'checkbox' },
            { id: 's4_3', label: "Cuestionario Final (NotebookLM)", instruction: "Requiere puntaje máximo. Si falla, vuelve a leer.", type: 'checkbox' }
        ]
    },
    {
        id: 5,
        title: "Fase 5: Protocolo de Cierre",
        description: "Consolidación neuroplástica.",
        steps: [
            { id: 's5_1', label: "Visión Panorámica (2 min)", type: 'timer', timerType: 'panoramic' },
            { id: 's5_2', label: "Respiración Fisiológica (5 min)", type: 'timer', timerType: 'calm' },
            { id: 's5_3', label: "NSDR (20 min)", type: 'timer', timerType: 'nsdr' }
        ]
    }
];

interface SessionLog {
    id: string;
    name: string;
    date: string;
    type: string;
    duration: string;
}

export const CortexModule: React.FC = () => {
    const [tab, setTab] = useState<'study' | 'gaming'>('study');

    // Study State
    const [studyProgress, setStudyProgress] = useState<string[]>([]);
    const [activeTimer, setActiveTimer] = useState<{type: FlowSessionType, duration?: number, stepId?: string} | null>(null);
    const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);

    // Global Session Tracking
    const [activeSessionStartTime, setActiveSessionStartTime] = useState<number | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [sessionName, setSessionName] = useState("");

    // Default configs for breathing sessions
    const DEFAULT_CONFIGS: Record<string, any> = {
        active: { inhale: 1.5, exhale: 1.0, hold1: 0, hold2: 0, cycles: 30 },
        tummo: { inhale: 1.5, exhale: 1.0, hold1: 0, hold2: 15, cycles: 30 },
        calm: { inhale: 4, hold1: 7, exhale: 8, hold2: 0, cycles: 15, double: true },
        panoramic: { duration: 120 },
        gaze: { duration: 45 },
        focus: { duration: 90 },
        nsdr: { duration: 20 }
    };

    useEffect(() => {
        const saved = localStorage.getItem('cortex_study_flow');
        if (saved) {
            setStudyProgress(JSON.parse(saved));
        }
        const savedLogs = localStorage.getItem('cortex_session_logs');
        if (savedLogs) {
            setSessionLogs(JSON.parse(savedLogs));
        }
        const savedSessionStart = localStorage.getItem('cortex_active_session_start');
        if (savedSessionStart) {
            setActiveSessionStartTime(Number(savedSessionStart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cortex_study_flow', JSON.stringify(studyProgress));
    }, [studyProgress]);

    useEffect(() => {
        localStorage.setItem('cortex_session_logs', JSON.stringify(sessionLogs));
    }, [sessionLogs]);

    useEffect(() => {
        if (activeSessionStartTime) {
            localStorage.setItem('cortex_active_session_start', String(activeSessionStartTime));
        } else {
            localStorage.removeItem('cortex_active_session_start');
        }
    }, [activeSessionStartTime]);

    const toggleStep = (id: string) => {
        setStudyProgress(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const isPhaseUnlocked = (phaseId: number) => {
        if (phaseId === 0) return true;
        const prevPhase = DEEP_STUDY_FLOW.find(p => p.id === phaseId - 1);
        if (!prevPhase) return true;
        return prevPhase.steps.every(s => studyProgress.includes(s.id));
    };

    const calculateProgress = () => {
        const totalSteps = DEEP_STUDY_FLOW.reduce((acc, p) => acc + p.steps.length, 0);
        return Math.round((studyProgress.length / totalSteps) * 100);
    };

    const resetProgress = () => {
        if(confirm("¿Estás seguro de que quieres reiniciar el progreso de Deep Study? Se desmarcarán todas las casillas.")) {
            setStudyProgress([]);
        }
    };

    const handleSessionComplete = () => {
        if (activeTimer) {
            // Auto-check step
            if (activeTimer.stepId && !studyProgress.includes(activeTimer.stepId)) {
                toggleStep(activeTimer.stepId);
            }
            // Just close, do not log individually
            setActiveTimer(null);
        }
    };

    const toggleGlobalSession = () => {
        if (activeSessionStartTime) {
            // End Session
            setSessionName("");
            setShowSaveModal(true);
        } else {
            // Start Session
            setActiveSessionStartTime(Date.now());
        }
    };

    const saveSessionLog = () => {
        if (!activeSessionStartTime) return;

        const durationMs = Date.now() - activeSessionStartTime;
        const minutes = Math.floor(durationMs / 60000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

        const newLog: SessionLog = {
            id: Date.now().toString(),
            name: sessionName || "Sesión de Estudio",
            date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            type: "DEEP STUDY",
            duration: durationStr
        };
        setSessionLogs(prev => [newLog, ...prev]);
        setShowSaveModal(false);
        setActiveSessionStartTime(null);
    };

    if (activeTimer) {
        const config = {
            ...(DEFAULT_CONFIGS[activeTimer.type] || {}),
            ...(activeTimer.duration ? { duration: activeTimer.duration } : {})
        };

        return (
            <ActiveSession
                type={activeTimer.type}
                config={config}
                onExit={() => setActiveTimer(null)}
                onComplete={handleSessionComplete}
            />
        );
    }

    return (
        <div className="pb-24 animate-fadeIn relative">
            {/* Save Session Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-full max-w-sm shadow-2xl animate-scaleIn">
                        <h3 className="text-xl font-bold text-white mb-2">Sesión Completada</h3>
                        <p className="text-sm text-slate-400 mb-4">¿Cómo quieres llamar a esta sesión?</p>

                        <input
                            type="text"
                            value={sessionName}
                            onChange={(e) => setSessionName(e.target.value)}
                            placeholder="Ej: Matemáticas Avanzadas..."
                            className="w-full bg-slate-800 border border-slate-700 text-white rounded p-3 mb-4 focus:outline-none focus:border-neuro-purple"
                            autoFocus
                        />

                        <div className="flex gap-3">
                            <button 
                                onClick={() => { setShowSaveModal(false); setActiveSessionStartTime(null); }}
                                className="flex-1 py-2 rounded text-slate-400 font-bold text-xs hover:bg-slate-800"
                            >
                                DESCARTAR
                            </button>
                            <button 
                                onClick={saveSessionLog}
                                className="flex-1 py-2 rounded bg-neuro-purple text-white font-bold text-xs hover:brightness-110"
                            >
                                GUARDAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-3xl font-black text-white mb-2">Cortex <span className="text-neuro-cyan text-sm align-top">BETA</span></h2>
            <div className="flex border-b border-slate-800 mb-6">
                <button
                    onClick={() => setTab('study')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${tab === 'study' ? 'border-neuro-cyan text-neuro-cyan' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    DEEP STUDY FLOW
                </button>
                <button
                    onClick={() => setTab('gaming')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${tab === 'gaming' ? 'border-neuro-purple text-neuro-purple' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    GAMING MODE
                </button>
            </div>

            {tab === 'study' ? (
                <div className="space-y-8 relative">

                    {/* Global Session Control */}
                    <div className="flex gap-4">
                        <button
                            onClick={toggleGlobalSession}
                            className={`flex-1 py-4 rounded-xl font-bold text-sm tracking-wider shadow-lg transition-all active:scale-95 ${activeSessionStartTime ? 'bg-neuro-red text-white animate-pulse' : 'bg-neuro-purple text-white hover:brightness-110'}`}
                        >
                            {activeSessionStartTime ? 'FINALIZAR SESIÓN DE ESTUDIO' : 'INICIAR SESIÓN DE ESTUDIO'}
                        </button>
                    </div>

                    {/* Overall Progress */}
                    <div className="glass p-4 rounded-xl border border-slate-700 mb-8 sticky top-0 z-40 backdrop-blur-md mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Progreso del Proyecto</span>
                            <div className="flex gap-4 items-center">
                                <button onClick={resetProgress} className="text-[10px] text-neuro-red font-bold hover:underline">REINICIAR</button>
                                <span className="text-neuro-cyan font-mono font-bold">{calculateProgress()}%</span>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-neuro-blue to-neuro-cyan transition-all duration-1000"
                                style={{ width: `${calculateProgress()}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="absolute left-[19px] top-36 bottom-0 w-0.5 bg-slate-800 z-0"></div>

                    {DEEP_STUDY_FLOW.map((phase) => {
                        const unlocked = isPhaseUnlocked(phase.id);
                        const allDone = phase.steps.every(s => studyProgress.includes(s.id));

                        return (
                            <div key={phase.id} className={`relative z-10 transition-opacity duration-500 ${unlocked ? 'opacity-100' : 'opacity-30 blur-[2px] pointer-events-none'}`}>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 shrink-0 ${allDone ? 'bg-neuro-green text-black border-neuro-green' : unlocked ? 'bg-neuro-bg text-neuro-cyan border-neuro-cyan' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>
                                        {allDone ? '✓' : phase.id}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${allDone ? 'text-neuro-green' : 'text-white'}`}>{phase.title}</h3>
                                        <p className="text-xs text-slate-400">{phase.description}</p>
                                    </div>
                                </div>

                                <div className="pl-14 space-y-3">
                                    {phase.steps.map(step => {
                                        const checked = studyProgress.includes(step.id);
                                        return (
                                            <div
                                                key={step.id}
                                                className={`p-3 rounded-lg border flex items-center gap-3 transition-colors ${checked ? 'bg-slate-900/50 border-neuro-green/30' : 'bg-slate-800/20 border-slate-700 hover:border-slate-500'}`}
                                            >
                                                <button 
                                                    onClick={() => toggleStep(step.id)}
                                                    className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${checked ? 'bg-neuro-green border-neuro-green text-black' : 'bg-transparent border-slate-500 hover:border-white'}`}
                                                >
                                                    {checked && '✓'}
                                                </button>

                                                <div className="flex-1">
                                                    <span className={`text-sm font-medium block ${checked ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                                        {step.label}
                                                    </span>
                                                    {step.instruction && (
                                                        <span className="text-[10px] text-neuro-cyan block mt-1 font-mono">
                                                            {step.instruction}
                                                        </span>
                                                    )}
                                                </div>

                                                {step.type === 'timer' && !checked && (
                                                    <button
                                                        onClick={() => setActiveTimer({ type: step.timerType!, duration: step.duration, stepId: step.id })}
                                                        className="px-3 py-1 bg-neuro-purple/20 text-neuro-purple border border-neuro-purple/50 rounded text-xs font-bold hover:bg-neuro-purple hover:text-white transition-colors"
                                                    >
                                                        INICIAR
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}

                    {/* Session History Log */}
                    <div className="mt-12 pt-8 border-t border-slate-800">
                        <h3 className="text-lg font-bold text-white mb-4">📜 Historial de Sesiones</h3>
                        {sessionLogs.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">No hay sesiones registradas aún.</p>
                        ) : (
                            <div className="space-y-2">
                                {sessionLogs.map(log => (
                                    <div key={log.id} className="bg-slate-900/40 p-3 rounded-lg flex justify-between items-center border border-slate-800 hover:border-slate-700">
                                        <div>
                                            <h4 className="font-bold text-slate-300 text-sm">{log.name}</h4>
                                            <div className="flex gap-2 text-[10px] text-slate-500 font-mono mt-1">
                                                <span>{log.date}</span>
                                                <span>•</span>
                                                <span className="uppercase">{log.type}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold text-neuro-purple bg-neuro-purple/10 px-2 py-1 rounded">
                                            {log.duration}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-12"></div>
                </div>
            ) : (
                <div className="space-y-4 animate-slideUp">
                    <div className="bg-gradient-to-r from-neuro-purple/20 to-neuro-cyan/20 p-4 rounded-xl border border-white/10 mb-6">
                        <h3 className="font-bold text-white mb-2">🧠 Modo Inmersión</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Simula la "mente de niño" apagando la corteza prefrontal (juicio) y activando la amígdala (emoción).
                            Usa estos protocolos antes de iniciar tu sesión de juego para romper la barrera de incredulidad.
                        </p>
                    </div>

                    {/* Moved Checklist to Top */}
                    <div className="mb-8 p-4 border border-dashed border-slate-700 rounded-xl bg-slate-900/30">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">CHECKLIST DE INMERSIÓN</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li className="flex items-center gap-2"><span className="text-neuro-green">✓</span> HUD / Minimapa Desactivado</li>
                            <li className="flex items-center gap-2"><span className="text-neuro-green">✓</span> Audio en Rango Dinámico Alto</li>
                            <li className="flex items-center gap-2"><span className="text-neuro-green">✓</span> FOV a 90-100 (Visión Periférica)</li>
                            <li className="flex items-center gap-2"><span className="text-neuro-green">✓</span> Sin Viaje Rápido (Permadeath Mental)</li>
                        </ul>
                    </div>

                    {[...GAMER_ROUTINES, {
                        title: "Calentamiento Motor (Reflejos)",
                        desc: "Sincronización óculo-manual. Prepara los reflejos antes de partidas competitivas.",
                        steps: ['gaze', 'active']
                    }].map((routine, idx) => (
                        <div key={idx} className="glass p-6 rounded-xl border-l-4 border-neuro-cyan">
                            <h3 className="text-xl font-bold text-white mb-1">{routine.title}</h3>
                            <p className="text-sm text-slate-400 mb-4">{routine.desc}</p>

                            <div className="flex flex-col gap-2 relative">
                                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-800 -z-10"></div>

                                {routine.steps.map((stepId, stepIdx) => {
                                    // Map step IDs to nice names/times
                                    const getToolInfo = (id: string) => {
                                        switch(id) {
                                            case 'calm': return { title: 'Recuperación', time: '5 min' };
                                            case 'gaze': return { title: 'Enfoque Visual', time: '45 seg' };
                                            case 'active': return { title: 'Activación', time: '3 min' };
                                            case 'panoramic': return { title: 'Visión Panorámica', time: '2 min' };
                                            default: return { title: id, time: '' };
                                        }
                                    };
                                    const info = getToolInfo(stepId);

                                    return (
                                        <div key={stepIdx} className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-neuro-cyan border border-slate-700">
                                                {stepIdx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-200 text-sm">{info.title}</h4>
                                                <span className="text-[10px] text-slate-500">{info.time}</span>
                                            </div>
                                            <button
                                                onClick={() => setActiveTimer({ type: stepId as FlowSessionType })}
                                                className="px-4 py-1.5 bg-slate-800 hover:bg-white text-white hover:text-black rounded text-xs font-bold transition-colors"
                                            >
                                                IR
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};