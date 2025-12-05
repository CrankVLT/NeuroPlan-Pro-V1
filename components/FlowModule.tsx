import React, { useState } from 'react';
import { FlowState, FlowSessionType } from '../types';
import { ActiveSession } from './flow/ActiveSession';
import { SettingsModal } from './flow/SettingsModal';
import { NeuroDiagnostic } from './flow/NeuroDiagnostic';

const DEFAULT_FLOW_STATE: FlowState = {
    gaze: { duration: 45 }, 
    active: { inhale: 1.5, exhale: 1.0, hold1: 0, hold2: 0, cycles: 30 },
    tummo: { inhale: 1.5, exhale: 1.0, hold1: 0, hold2: 15, cycles: 30 }, 
    focus: { duration: 90 }, 
    calm: { inhale: 4, hold1: 7, exhale: 8, hold2: 0, cycles: 15, double: true },
    nsdr: { duration: 20 }, 
    panoramic: { duration: 120 }, 
    custom: { inhale: 4, hold1: 4, exhale: 4, hold2: 4, cycles: 10 }
};

const TOOLS = [
    { 
        id: 'active', 
        title: 'Activación', 
        color: 'red', 
        time: '3 min',
        desc: 'Hiperventilación controlada. Eleva la adrenalina para eliminar la fatiga y el letargo.',
        btnText: 'text-white'
    },
    { 
        id: 'gaze', 
        title: 'Enfoque Visual', 
        color: 'cyan', 
        time: '45 seg',
        desc: 'Suprime las microsacadas (movimientos oculares involuntarios) para activar el Locus Coeruleus y preparar la atención.',
        btnText: 'text-black' 
    },
    { 
        id: 'focus', 
        title: 'Trabajo Profundo', 
        color: 'purple', 
        time: '90 min',
        desc: 'Ciclo Ultradiano. El límite biológico máximo para mantener la capacidad cognitiva sostenida y la neuroplasticidad.',
        btnText: 'text-white'
    },
    { 
        id: 'tummo', 
        title: 'Tummo (Wim Hof)', 
        color: 'red', 
        time: '5 min',
        desc: 'Respiración intensa + Retención. Entrena el sistema nervioso para adaptarse a altos niveles de estrés.',
        btnText: 'text-white'
    },
    { 
        id: 'panoramic', 
        title: 'Visión Panorámica', 
        color: 'blue', 
        time: '2 min',
        desc: 'Dilatación de la mirada hacia el horizonte. Desactiva el estrés visual y mental (parasimpático) al instante.',
        btnText: 'text-white'
    },
    { 
        id: 'calm', 
        title: 'Recuperación', 
        color: 'blue', 
        time: '5 min',
        desc: 'Suspiro fisiológico (doble inhalación). La herramienta más rápida conocida para reducir la ansiedad en tiempo real.',
        btnText: 'text-white'
    },
    { 
        id: 'nsdr', 
        title: 'NSDR', 
        color: 'green', 
        time: '20 min',
        desc: 'Descanso Profundo Sin Dormir. Restaura la dopamina en el cuerpo estriado y consolida el aprendizaje.',
        btnText: 'text-black'
    },
];

const ROUTINES = [
    {
        title: "Energía Máxima (Mañana)",
        desc: "Protocolo para iniciar el día con alta dopamina y enfoque láser.",
        steps: ['active', 'gaze', 'focus']
    },
    {
        title: "Rescate de Estrés",
        desc: "Cuando sientes ansiedad o sobrecarga mental.",
        steps: ['panoramic', 'calm', 'nsdr']
    },
    {
        title: "Preparación para Dormir",
        desc: "Desactiva el sistema simpático para un sueño profundo.",
        steps: ['calm', 'nsdr']
    }
];

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

const PRESETS = [
    { name: "Box Breathing", desc: "Estabilización táctica (Navy SEALs).", pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4, cycles: 12 } },
    { name: "4-7-8 Relax", desc: "Inducción al sueño parasimpático.", pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0, cycles: 10 } },
    { name: "Coherencia", desc: "Sincronía cardio-cerebral.", pattern: { inhale: 5.5, hold1: 0, exhale: 5.5, hold2: 0, cycles: 30 } }
];

// --- MAIN MODULE (EXPORTED LAST) ---

interface FlowModuleProps {
    onSessionComplete?: (energyChange: number) => void;
}

export const FlowModule: React.FC<FlowModuleProps> = ({ onSessionComplete }) => {
    const [activeSession, setActiveSession] = useState<{ type: FlowSessionType, config: any } | null>(null);
    const [editingTool, setEditingTool] = useState<{ id: string, config: any } | null>(null);
    const [tab, setTab] = useState<'tools' | 'routines' | 'gaming'>('tools');
    const [showDiagnostic, setShowDiagnostic] = useState(false);

    const startSession = (type: FlowSessionType, config?: any) => {
        const finalConfig = config ? config : DEFAULT_FLOW_STATE[type as keyof FlowState];
        setActiveSession({ type, config: finalConfig });
        setEditingTool(null);
    };

    const handleExit = () => {
        setActiveSession(null);
    };

    const handleComplete = (type: FlowSessionType) => {
        let energyChange = 0;
        switch(type) {
            case 'focus': energyChange = -15; break; 
            case 'active': 
            case 'tummo': energyChange = -5; break; 
            case 'gaze': energyChange = -2; break; 
            case 'calm': 
            case 'panoramic': energyChange = 10; break; 
            case 'nsdr': energyChange = 25; break; 
            default: energyChange = 5;
        }
        
        if (onSessionComplete) onSessionComplete(energyChange);
        setTimeout(() => setActiveSession(null), 1500); 
    };

    const openSettings = (e: React.MouseEvent, toolId: string) => {
        e.stopPropagation();
        setEditingTool({ id: toolId, config: { ...DEFAULT_FLOW_STATE[toolId as keyof FlowState] } });
    };

    const handleDiagnosticResult = (type: FlowSessionType, reason: string) => {
        setShowDiagnostic(false);
        if(confirm(`RECOMENDACIÓN: ${reason}\n\n¿Iniciar sesión de ${type.toUpperCase()}?`)) {
            startSession(type);
        }
    };

    if (activeSession) {
        return <ActiveSession type={activeSession.type} config={activeSession.config} onExit={handleExit} onComplete={() => handleComplete(activeSession.type)} />;
    }

    return (
        <div className="pb-8 animate-fadeIn">
            <div className="flex justify-between items-start mb-2">
                 <h2 className="text-3xl font-black text-white">Flow Tools</h2>
                 <button 
                    onClick={() => setShowDiagnostic(true)}
                    className="bg-neuro-purple/20 border border-neuro-purple text-neuro-purple px-4 py-2 rounded-lg text-xs font-bold hover:bg-neuro-purple hover:text-white transition-all flex items-center gap-2 animate-pulse"
                 >
                     <span>⚡</span> DIAGNÓSTICO
                 </button>
            </div>
            <p className="text-slate-400 text-sm mb-6">Ingeniería del estado mental.</p>
            
            <div className="flex border-b border-slate-800 mb-6 overflow-x-auto">
                <button 
                    onClick={() => setTab('tools')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${tab === 'tools' ? 'border-neuro-purple text-neuro-purple' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    HERRAMIENTAS
                </button>
                <button 
                    onClick={() => setTab('routines')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${tab === 'routines' ? 'border-neuro-purple text-neuro-purple' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    RUTINAS
                </button>
                <button 
                    onClick={() => setTab('gaming')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${tab === 'gaming' ? 'border-neuro-purple text-neuro-purple' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    GAMING 🎮
                </button>
            </div>
            
            {tab === 'tools' && (
                <div className="grid md:grid-cols-2 gap-4">
                    {TOOLS.map((tool) => (
                        <div key={tool.id} className={`glass p-5 rounded-xl border-l-4 border-neuro-${tool.color} relative group hover:bg-slate-800/80 transition-all overflow-hidden`}>
                            {/* Background gradient hint */}
                            <div className={`absolute inset-0 bg-neuro-${tool.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between mb-2 items-start">
                                    <h3 className="text-xl font-bold text-white">{tool.title}</h3>
                                    <button 
                                        onClick={(e) => openSettings(e, tool.id)}
                                        className="text-slate-500 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                                    >
                                        ⚙️
                                    </button>
                                </div>
                                <span className={`text-[10px] font-mono font-bold text-neuro-${tool.color} bg-slate-900/50 px-2 py-1 rounded mb-3 inline-block`}>
                                    {tool.time}
                                </span>
                                <p className="text-sm text-slate-400 mb-6 min-h-[40px] leading-relaxed">{tool.desc}</p>
                                <div className="flex justify-between items-center mt-auto">
                                    <button 
                                        onClick={() => startSession(tool.id as FlowSessionType)}
                                        className={`bg-neuro-${tool.color} hover:brightness-110 ${tool.btnText || 'text-white'} px-6 py-3 rounded-lg text-xs font-bold transition-transform active:scale-95 w-full shadow-[0_0_15px_rgba(0,0,0,0.3)] tracking-wider uppercase border border-white/10`}
                                    >
                                        COMENZAR
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Lab Section Inline */}
                    <div className="glass p-5 rounded-xl border border-dashed border-slate-700">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                             ⚗️ Laboratorio
                        </h3>
                         <div className="grid grid-cols-1 gap-2 mb-4">
                            {PRESETS.map((preset, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => startSession('custom', preset.pattern)}
                                    className="text-left p-2 rounded border border-slate-800 bg-slate-900/30 hover:bg-neuro-purple/10 hover:border-neuro-purple transition-colors"
                                >
                                    <div className="font-bold text-slate-300 text-xs">{preset.name}</div>
                                </button>
                            ))}
                        </div>
                        <button onClick={(e) => openSettings(e, 'custom')} className="w-full py-2 bg-slate-800 text-slate-300 rounded-lg font-bold text-xs hover:bg-slate-700">
                            + PERSONALIZAR
                        </button>
                    </div>
                </div>
            )}

            {tab === 'routines' && (
                <div className="space-y-4">
                    {ROUTINES.map((routine, idx) => (
                        <div key={idx} className="glass p-6 rounded-xl border-l-4 border-white/20">
                            <h3 className="text-xl font-bold text-white mb-1">{routine.title}</h3>
                            <p className="text-sm text-slate-400 mb-4">{routine.desc}</p>
                            
                            <div className="flex flex-col gap-2 relative">
                                {/* Connector Line */}
                                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-800 -z-10"></div>
                                
                                {routine.steps.map((stepId, stepIdx) => {
                                    const tool = TOOLS.find(t => t.id === stepId);
                                    if (!tool) return null;
                                    return (
                                        <div key={stepIdx} className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors">
                                            <div className={`w-8 h-8 rounded-full bg-neuro-${tool.color}/20 flex items-center justify-center text-[10px] font-bold text-neuro-${tool.color} border border-neuro-${tool.color}/50`}>
                                                {stepIdx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-200 text-sm">{tool.title}</h4>
                                                <span className="text-[10px] text-slate-500">{tool.time}</span>
                                            </div>
                                            <button 
                                                onClick={() => startSession(tool.id as FlowSessionType)}
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

            {tab === 'gaming' && (
                <div className="space-y-4 animate-slideUp">
                    <div className="bg-gradient-to-r from-neuro-purple/20 to-neuro-cyan/20 p-4 rounded-xl border border-white/10 mb-6">
                        <h3 className="font-bold text-white mb-2">🧠 Modo Inmersión</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                            Simula la "mente de niño" apagando la corteza prefrontal (juicio) y activando la amígdala (emoción). 
                            Usa estos protocolos antes de iniciar tu sesión de juego para romper la barrera de incredulidad.
                        </p>
                    </div>

                    {GAMER_ROUTINES.map((routine, idx) => (
                        <div key={idx} className="glass p-6 rounded-xl border-l-4 border-neuro-cyan">
                            <h3 className="text-xl font-bold text-white mb-1">{routine.title}</h3>
                            <p className="text-sm text-slate-400 mb-4">{routine.desc}</p>
                            
                            <div className="flex flex-col gap-2 relative">
                                {/* Connector Line */}
                                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-800 -z-10"></div>
                                
                                {routine.steps.map((stepId, stepIdx) => {
                                    const tool = TOOLS.find(t => t.id === stepId);
                                    if (!tool) return null;
                                    return (
                                        <div key={stepIdx} className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors">
                                            <div className={`w-8 h-8 rounded-full bg-neuro-${tool.color}/20 flex items-center justify-center text-[10px] font-bold text-neuro-${tool.color} border border-neuro-${tool.color}/50`}>
                                                {stepIdx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-200 text-sm">{tool.title}</h4>
                                                <span className="text-[10px] text-slate-500">{tool.time}</span>
                                            </div>
                                            <button 
                                                onClick={() => startSession(tool.id as FlowSessionType)}
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
                    
                    <div className="mt-8 p-4 border border-dashed border-slate-700 rounded-xl">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">CHECKLIST DE INMERSIÓN</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li className="flex items-center gap-2"><span className="text-neuro-green">✓</span> HUD / Minimapa Desactivado</li>
                            <li className="flex items-center gap-2"><span className="text-neuro-green">✓</span> Audio en Rango Dinámico Alto</li>
                            <li className="flex items-center gap-2"><span className="text-neuro-green">✓</span> FOV a 90-100 (Visión Periférica)</li>
                            <li className="flex items-center gap-2"><span className="text-neuro-green">✓</span> Sin Viaje Rápido (Permadeath Mental)</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* Settings Modal */}
            {editingTool && (
                <SettingsModal 
                    tool={editingTool} 
                    onClose={() => setEditingTool(null)} 
                    onSave={(newConfig) => startSession(editingTool.id as FlowSessionType, newConfig)} 
                />
            )}

            {/* Diagnostic Modal */}
            {showDiagnostic && (
                <NeuroDiagnostic 
                    onRecommend={handleDiagnosticResult} 
                    onClose={() => setShowDiagnostic(false)} 
                />
            )}
        </div>
    );
};