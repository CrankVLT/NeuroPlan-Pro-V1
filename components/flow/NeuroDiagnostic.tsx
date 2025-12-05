import React, { useState } from 'react';
import { FlowSessionType } from '../../types';

interface NeuroDiagnosticProps {
    onRecommend: (type: FlowSessionType, reason: string) => void;
    onClose: () => void;
}

export const NeuroDiagnostic: React.FC<NeuroDiagnosticProps> = ({ onRecommend, onClose }) => {
    const [step, setStep] = useState<'energy' | 'anxiety' | 'result'>('energy');
    const [energyLevel, setEnergyLevel] = useState(5);
    const [anxietyLevel, setAnxietyLevel] = useState(5);

    const analyze = () => {
        // Logic based on LC-NA modes (Locus Coeruleus)
        // Low Energy + Low Anxiety = Hypo-arousal (Needs Activation) -> Active/Tummo
        // High Anxiety = Hyper-arousal (Needs Calm) -> Calm/Panoramic
        // High Energy + Low Anxiety = Optimal (Phasic) -> Focus
        // Low Energy + High Anxiety = Tired but Wired (Burnout?) -> NSDR

        let rec: FlowSessionType = 'focus';
        let reason = "Estás en estado óptimo.";

        if (anxietyLevel > 7) {
            rec = 'calm';
            reason = "Detectamos alta excitación (Hiper-arousal). Necesitas reducir la 'fricción límbica' antes de trabajar.";
        } else if (energyLevel < 4) {
            if (anxietyLevel > 5) {
                rec = 'nsdr';
                reason = "Estado de 'cansado pero alerta'. Tu batería está baja. Recupera dopamina antes de quemarte.";
            } else {
                rec = 'active';
                reason = "Detectamos baja energía (Hipo-arousal). Necesitas adrenalina para arrancar.";
            }
        } else {
            // Good energy, low anxiety
            rec = 'focus';
            reason = "Tu sistema Locus Coeruleus parece estar en modo Fásico. Es el momento perfecto para el Trabajo Profundo.";
        }

        onRecommend(rec, reason);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-fadeIn">
            <div className="w-full max-w-md bg-neuro-card border border-slate-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-neuro-purple/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10">
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Neuro-Chequeo</h3>
                    <p className="text-slate-400 text-sm mb-8">Diagnóstico rápido del sistema autonómico.</p>

                    {step === 'energy' && (
                        <div className="animate-slideUp">
                            <label className="block text-sm font-bold text-white mb-4">¿Cómo sientes tu nivel de ENERGÍA física?</label>
                            <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono">
                                <span>LETARGIA (1)</span>
                                <span>HIPERACTIVIDAD (10)</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" max="10" 
                                value={energyLevel} 
                                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                                className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-neuro-cyan mb-8"
                            />
                            <div className="text-center text-4xl font-black text-neuro-cyan mb-8">{energyLevel}</div>
                            <button 
                                onClick={() => setStep('anxiety')}
                                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                SIGUIENTE
                            </button>
                        </div>
                    )}

                    {step === 'anxiety' && (
                        <div className="animate-slideUp">
                            <label className="block text-sm font-bold text-white mb-4">¿Cómo sientes tu nivel de AGITACIÓN mental?</label>
                            <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono">
                                <span>ZEN (1)</span>
                                <span>PÁNICO (10)</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" max="10" 
                                value={anxietyLevel} 
                                onChange={(e) => setAnxietyLevel(Number(e.target.value))}
                                className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-neuro-red mb-8"
                            />
                            <div className="text-center text-4xl font-black text-neuro-red mb-8">{anxietyLevel}</div>
                            <button 
                                onClick={analyze}
                                className="w-full py-4 bg-neuro-purple text-white font-bold rounded-xl hover:brightness-110 transition-colors shadow-[0_0_20px_rgba(112,0,255,0.4)]"
                            >
                                DIAGNOSTICAR
                            </button>
                        </div>
                    )}
                    
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
                </div>
            </div>
        </div>
    );
};