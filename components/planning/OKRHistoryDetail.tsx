import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Goal } from '../../types';

interface OKRHistoryDetailProps {
    goal: Goal;
    threshold: number;
    onClose: () => void;
}

export const OKRHistoryDetail: React.FC<OKRHistoryDetailProps> = ({ goal, threshold, onClose }) => {
    const [expandedKR, setExpandedKR] = useState<number | null>(null);

    // Calculate Progress
    const progress = React.useMemo(() => {
        if (!goal.keyResults || goal.keyResults.length === 0) return 0;
        const total = goal.keyResults.reduce((acc, kr) => {
            const p = kr.target > 0 ? (kr.current / kr.target) : 0;
            return acc + Math.min(1, p);
        }, 0);
        return Math.round((total / goal.keyResults.length) * 100);
    }, [goal]);

    // Color Logic matches PlanningModule
    const getProgressColor = () => {
        if (progress >= threshold) return 'text-neuro-green';
        if (progress >= (threshold / 2)) return 'text-yellow-400';
        return 'text-neuro-red';
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col bg-neuro-bg/95 backdrop-blur-xl animate-[slideIn_0.2s_ease-out]">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 pt-14 md:pt-4">
                <button onClick={onClose} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold text-sm">
                    ← VOLVER ATRÁS
                </button>
                <div className="flex flex-col items-end">
                    <div className="font-mono text-[10px] text-slate-500 font-bold uppercase tracking-widest block">
                        OBJETIVO COMPLETADO
                    </div>
                    <div className={`font-mono text-xl font-black ${getProgressColor()}`}>
                        {progress}%
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full pb-32 hide-scrollbar">

                {/* Title Section */}
                <div className="mb-8">
                    <label className="text-[10px] text-neuro-purple font-mono font-bold tracking-widest uppercase mb-2 block">OBJETIVO PRINCIPAL</label>
                    <h1 className="text-xl md:text-3xl font-bold text-slate-300 line-through decoration-neuro-green decoration-2">
                        {goal.title}
                    </h1>
                    <div className="mt-4 flex gap-4 text-xs font-mono text-slate-500">
                        <div>
                            <span className="block text-[10px] uppercase mb-1 opacity-50">Inicio</span>
                            <span className="text-white">{goal.startDate}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase mb-1 opacity-50">Completado</span>
                            <span className="text-neuro-green">{goal.completedDate}</span>
                        </div>
                    </div>
                </div>

                {/* Key Results Section */}
                <div>
                    <div className="flex justify-between items-end mb-4 border-b border-slate-800 pb-2">
                        <h3 className="text-white font-bold flex items-center gap-2">
                            <span className="text-neuro-cyan">◈</span> RESULTADOS CLAVE (KRs)
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {(goal.keyResults || []).map(kr => {
                            const isExpanded = expandedKR === kr.id;
                            const progressPercent = kr.target > 0 ? Math.min(100, (kr.current / kr.target) * 100) : 0;

                            return (
                                <div key={kr.id} className="glass rounded-xl overflow-hidden border border-slate-800/50">
                                    {/* KR Header */}
                                    <div className="p-4 bg-slate-900/40">
                                        <div className="flex justify-between items-start gap-2 mb-3">
                                            <div className="font-bold text-slate-300 text-sm md:text-base">
                                                {kr.title}
                                            </div>
                                            <div className="text-neuro-green font-mono text-xs font-bold bg-neuro-green/10 px-2 py-1 rounded">
                                                {kr.current} / {kr.target} {kr.unit}
                                            </div>
                                        </div>

                                        {/* Progress Bar Display */}
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-2">
                                            <div
                                                className="h-full bg-neuro-cyan transition-all"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Tasks Toggle */}
                                    {kr.tasks.length > 0 && (
                                        <div className="border-t border-slate-800/50">
                                            <button
                                                onClick={() => setExpandedKR(isExpanded ? null : kr.id)}
                                                className="w-full py-2 px-4 flex justify-between items-center text-xs font-bold text-slate-500 hover:bg-white/5 transition-colors"
                                            >
                                                <span>TAREAS ({kr.tasks.filter(t => t.completed).length}/{kr.tasks.length})</span>
                                                <span>{isExpanded ? '▲' : '▼'}</span>
                                            </button>

                                            {isExpanded && (
                                                <div className="p-4 bg-slate-900/60 animate-[fadeIn_0.3s]">
                                                    <div className="space-y-2">
                                                        {kr.tasks.map(task => (
                                                            <div key={task.id} className="flex items-center gap-3">
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${task.completed ? 'bg-neuro-green border-neuro-green text-black' : 'border-slate-600 bg-slate-800'}`}>
                                                                    {task.completed && '✓'}
                                                                </div>
                                                                <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-400'}`}>
                                                                    {task.title}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
