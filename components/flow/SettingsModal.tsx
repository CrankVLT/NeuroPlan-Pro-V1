import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const SettingRow: React.FC<{ label: string, value: number, min: number, max: number, step: number, onChange: (v: number) => void }> = ({ label, value, min, max, step, onChange }) => (
    <div className="flex justify-between items-center">
        <label className="text-xs text-slate-400">{label}</label>
        <div className="flex items-center gap-2">
            <button
                onClick={() => {
                    const newValue = Math.max(min, value - step);
                    onChange(Number(newValue.toFixed(1)));
                }}
                className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 transition-colors"
            >
                -
            </button>
            <span className="w-10 text-center text-sm font-mono">{Number(value).toFixed(1).replace(/\.0$/, '')}</span>
            <button
                onClick={() => {
                    const newValue = Math.min(max, value + step);
                    onChange(Number(newValue.toFixed(1)));
                }}
                className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 transition-colors"
            >
                +
            </button>
        </div>
    </div>
);

export const SettingsModal: React.FC<{ tool: { id: string, config: any }, onClose: () => void, onSave: (c: any) => void }> = ({ tool, onClose, onSave }) => {
    const [cfg, setCfg] = useState(tool.config);
    const [voices, setVoices] = useState<any[]>([]);

    useEffect(() => {
        const loadVoices = () => {
            const vs = window.speechSynthesis.getVoices();
            const spanish = vs.filter(v => v.lang.includes('es') || v.lang.includes('ES'));
            setVoices(spanish);

            // Auto-select Google voice if no voice is selected
            if (!cfg.voiceURI && spanish.length > 0) {
                const googleVoice = spanish.find(v => v.name.toLowerCase().includes('google'));
                if (googleVoice) {
                    setCfg((prev: any) => ({ ...prev, voiceURI: googleVoice.voiceURI }));
                } else {
                    setCfg((prev: any) => ({ ...prev, voiceURI: spanish[0].voiceURI }));
                }
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    const isBreathing = !['focus', 'nsdr', 'gaze', 'panoramic'].includes(tool.id);

    // CRITICAL: Lock body scroll to prevent background scrolling/rubber-banding
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const estDuration = isBreathing
        ? Math.round(((cfg.inhale + (cfg.hold1 || 0) + cfg.exhale + (cfg.hold2 || 0)) * cfg.cycles) / 60 * 10) / 10
        : (tool.id === 'gaze' || tool.id === 'panoramic' ? cfg.duration : cfg.duration);

    return createPortal(
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            {/* Bottom Sheet for Mobile, Center Modal for Desktop */}
            <div
                className="w-full sm:w-auto sm:min-w-[360px] bg-neuro-card border-t sm:border border-slate-700 rounded-t-2xl sm:rounded-xl p-6 shadow-2xl animate-slideUp sm:animate-fadeIn pb-8 sm:pb-6"
                onClick={e => e.stopPropagation()}
            >
                {/* Mobile Drag Handle Visual */}
                <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto mb-6 sm:hidden opacity-50"></div>

                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide">Configurar {tool.id}</h3>
                    <button onClick={onClose} className="sm:hidden p-2 text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto hide-scrollbar">
                    {tool.id === 'nsdr' && (
                        <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                            <label className="text-xs text-neuro-green font-bold uppercase tracking-wider mb-3 block">Voz del Guía</label>

                            <select
                                value={cfg.voiceURI || ''}
                                onChange={(e) => setCfg({ ...cfg, voiceURI: e.target.value })}
                                className="w-full bg-slate-800 text-white text-sm rounded p-2 border border-slate-700 mb-4 focus:border-neuro-green outline-none"
                            >
                                <option value="">Automático (Predeterminado)</option>
                                {voices.map((v: any) => (
                                    <option key={v.voiceURI} value={v.voiceURI}>
                                        {v.name}
                                    </option>
                                ))}
                            </select>

                            <SettingRow label="Velocidad" value={cfg.rate || 0.9} min={0.5} max={1.5} step={0.1} onChange={v => setCfg({ ...cfg, rate: v })} />
                            <SettingRow label="Tono" value={cfg.pitch || 1} min={0.5} max={1.5} step={0.1} onChange={v => setCfg({ ...cfg, pitch: v })} />

                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    const u = new SpeechSynthesisUtterance("Hola. Estoy listo para guiar tu descanso profundo.");
                                    const v = voices.find((v: any) => v.voiceURI === cfg.voiceURI);
                                    if (v) u.voice = v;
                                    u.rate = cfg.rate || 0.9;
                                    u.pitch = cfg.pitch || 1;
                                    u.lang = 'es-ES';
                                    window.speechSynthesis.cancel();
                                    window.speechSynthesis.speak(u);
                                }}
                                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-neuro-green text-xs font-bold rounded border border-slate-700 mt-2 flex items-center justify-center gap-2"
                            >
                                🔊 PROBAR VOZ
                            </button>
                        </div>
                    )}

                    {isBreathing ? (
                        <>
                            <SettingRow label="Ciclos (Reps)" value={cfg.cycles} min={1} max={100} step={1} onChange={v => setCfg({ ...cfg, cycles: v })} />
                            <SettingRow label="Inhalación (s)" value={cfg.inhale} min={0.5} max={10} step={0.5} onChange={v => setCfg({ ...cfg, inhale: v })} />
                            <SettingRow label="Retención 1 (s)" value={cfg.hold1 || 0} min={0} max={120} step={0.5} onChange={v => setCfg({ ...cfg, hold1: v })} />
                            <SettingRow label="Exhalación (s)" value={cfg.exhale} min={0.5} max={10} step={0.5} onChange={v => setCfg({ ...cfg, exhale: v })} />
                            <SettingRow label="Retención 2 (s)" value={cfg.hold2 || 0} min={0} max={120} step={0.5} onChange={v => setCfg({ ...cfg, hold2: v })} />
                        </>
                    ) : (
                        <SettingRow
                            label={`Duración (${['gaze', 'panoramic'].includes(tool.id) ? 'seg' : 'min'})`}
                            value={cfg.duration}
                            min={1}
                            max={300}
                            step={1}
                            onChange={v => setCfg({ ...cfg, duration: v })}
                        />
                    )}
                </div>

                <div className="bg-slate-900/50 p-3 rounded mb-4 text-center border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Tiempo Estimado</span>
                    <span className="text-xl font-mono text-neuro-cyan font-bold">
                        {estDuration} {['gaze', 'panoramic'].includes(tool.id) && !isBreathing ? 'seg' : 'min'}
                    </span>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-lg text-slate-400 hover:bg-slate-800 font-bold text-sm border border-transparent hover:border-slate-700 transition-all">Cancelar</button>
                    <button onClick={() => onSave(cfg)} className="flex-1 py-3 rounded-lg bg-neuro-purple hover:brightness-110 text-white font-bold text-sm shadow-[0_0_20px_rgba(112,0,255,0.3)] transition-all">COMENZAR</button>
                </div>
            </div>
        </div>,
        document.body
    );
};