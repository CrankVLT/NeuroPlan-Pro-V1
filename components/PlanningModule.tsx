import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { PlanningData, Goal } from '../types';
import { OKRDetailModal } from './planning/OKRDetailModal';
import { GoalCard } from './planning/GoalCard';

const INITIAL_DATA: PlanningData = {
    week: { title: '', goals: [] },
    month: { title: '', goals: [] },
    quarter: { title: '', goals: [] },
    settings: { executionThreshold: 80 }
};

export const PlanningModule: React.FC = () => {
    const [data, setData] = useState<PlanningData>(INITIAL_DATA);
    const [view, setView] = useState<'week' | 'month' | 'quarter'>('week');
    const [tab, setTab] = useState<'active' | 'history'>('active');
    
    // UI States
    const [isCreating, setIsCreating] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [historyFilter, setHistoryFilter] = useState<'all' | 'week' | 'month' | 'quarter'>('all');

    // Persistence
    const isLoadedRef = useRef(false);

    useEffect(() => {
        const saved = localStorage.getItem('neuroplan_os_v1');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setData({ 
                    ...INITIAL_DATA, 
                    ...parsed,
                    settings: { ...INITIAL_DATA.settings, ...parsed.settings }
                });
            } catch (e) {
                console.error("Error loading data", e);
            }
        }
        isLoadedRef.current = true;
    }, []);

    useEffect(() => {
        if (isLoadedRef.current) {
            localStorage.setItem('neuroplan_os_v1', JSON.stringify(data));
        }
    }, [data]);

    const currentContext = useMemo(() => data[view], [data, view]);

    const updateContext = useCallback((newGoals: Goal[]) => {
        setData(prev => ({
            ...prev,
            [view]: { ...prev[view], goals: newGoals }
        }));
    }, [view]);

    // --- LOGIC ---

    const handleCreateGoal = (title: string) => {
        const now = new Date();
        const startDate = now.toISOString().split('T')[0];
        
        const endDateObj = new Date(now);
        if (view === 'week') endDateObj.setDate(now.getDate() + 7);
        if (view === 'month') endDateObj.setDate(now.getDate() + 30);
        if (view === 'quarter') endDateObj.setDate(now.getDate() + 90);
        const endDate = endDateObj.toISOString().split('T')[0];

        const newGoal: Goal = {
            id: Date.now(),
            title: title,
            status: 'active',
            startDate,
            endDate,
            keyResults: [] 
        };

        updateContext([...currentContext.goals, newGoal]);
        setIsCreating(false);
        setEditingGoal(newGoal);
    };

    const handleUpdateGoal = useCallback((updated: Goal) => {
        setData(prev => {
            const currentGoals = prev[view].goals;
            const newGoals = currentGoals.map(g => g.id === updated.id ? updated : g);
            return {
                 ...prev,
                 [view]: { ...prev[view], goals: newGoals }
            };
        });
        if (editingGoal && editingGoal.id === updated.id) setEditingGoal(updated);
    }, [view, editingGoal]);

    const handleComplete = useCallback((goal: Goal) => {
        if (!confirm("¿Completar objetivo? Se moverá al historial.")) return;
        const updated: Goal = {
            ...goal,
            status: 'completed',
            completedDate: new Date().toISOString().split('T')[0]
        };
        handleUpdateGoal(updated);
        setEditingGoal(null);
    }, [handleUpdateGoal]);

    const handleDelete = useCallback((id: number) => {
        if (!confirm("¿Eliminar permanentemente?")) return;
        setData(prev => {
             const currentGoals = prev[view].goals;
             const newGoals = currentGoals.filter(g => g.id !== id);
             return {
                 ...prev,
                 [view]: { ...prev[view], goals: newGoals }
             };
        });
        setEditingGoal(null);
    }, [view]);

    const handleDeleteHistoryItem = useCallback((e: React.MouseEvent, id: number, type: 'week'|'month'|'quarter') => {
        e.stopPropagation();
        if(!confirm("¿Borrar este registro del historial para siempre?")) return;
        
        setData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                goals: prev[type].goals.filter(g => g.id !== id)
            }
        }));
    }, []);

    // --- CALCULOS ---
    const getGoalProgress = useCallback((goal: Goal) => {
        if (!goal.keyResults || goal.keyResults.length === 0) return 0;
        const totalProgress = goal.keyResults.reduce((acc, kr) => {
            const p = kr.target > 0 ? (kr.current / kr.target) : 0;
            return acc + Math.min(1, p); 
        }, 0);
        return Math.round((totalProgress / goal.keyResults.length) * 100);
    }, []);

    const activeGoals = useMemo(() => currentContext.goals.filter(g => g.status === 'active'), [currentContext.goals]);
    
    const historyGoals = useMemo(() => {
        let goals: { g: Goal, type: 'week'|'month'|'quarter' }[] = [];
        
        if (historyFilter === 'all' || historyFilter === 'week') {
            goals = goals.concat(data.week.goals.map(g => ({g, type: 'week'})));
        }
        if (historyFilter === 'all' || historyFilter === 'month') {
            goals = goals.concat(data.month.goals.map(g => ({g, type: 'month'})));
        }
        if (historyFilter === 'all' || historyFilter === 'quarter') {
            goals = goals.concat(data.quarter.goals.map(g => ({g, type: 'quarter'})));
        }
        
        return goals.filter(item => item.g.status === 'completed' || item.g.status === 'archived')
                    .sort((a,b) => (b.g.completedDate || '').localeCompare(a.g.completedDate || ''));
    }, [data, historyFilter]);

    const totalPeriodProgress = useMemo(() => {
        return activeGoals.length > 0 
        ? Math.round(activeGoals.reduce((acc, g) => acc + getGoalProgress(g), 0) / activeGoals.length)
        : 0;
    }, [activeGoals, getGoalProgress]);

    // Traffic Light Logic
    const threshold = data.settings.executionThreshold;
    let progressColor = 'text-neuro-red';
    let progressBarColor = 'bg-neuro-red';
    if (totalPeriodProgress >= (threshold / 2)) { progressColor = 'text-yellow-400'; progressBarColor = 'bg-yellow-400'; }
    if (totalPeriodProgress >= threshold) { progressColor = 'text-neuro-green'; progressBarColor = 'bg-neuro-green'; }

    // Translations for View
    const getViewTitle = useCallback(() => {
        if (view === 'week') return 'SEMANA';
        if (view === 'month') return 'MES';
        return 'TRIMESTRE';
    }, [view]);

    return (
        <div className="space-y-6 pb-24 animate-[fadeIn_0.5s_ease-out]">
            
            {/* Header & Global Status */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                    <div className="flex bg-slate-900/50 p-1 rounded-xl w-fit border border-slate-800">
                        {['week', 'month', 'quarter'].map((t) => (
                            <button
                                key={t}
                                onClick={() => { setView(t as any); setTab('active'); }}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${view === t ? 'bg-neuro-purple text-white shadow-[0_0_15px_rgba(112,0,255,0.4)]' : 'text-slate-500 hover:text-white'}`}
                            >
                                {t === 'week' ? 'Semana' : t === 'month' ? 'Mes' : 'Trim.'}
                            </button>
                        ))}
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="text-[10px] font-mono text-slate-500 block">PROGRESO {getViewTitle()}</span>
                            <button onClick={() => setShowConfig(true)} className="text-slate-500 hover:text-white">⚙️</button>
                        </div>
                        <span className={`text-2xl font-black font-mono ${progressColor}`}>
                            {totalPeriodProgress}%
                        </span>
                    </div>
                </div>

                {/* Global Bar */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${progressBarColor} transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]`}
                        style={{ width: `${totalPeriodProgress}%` }}
                    ></div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800">
                <button 
                    onClick={() => setTab('active')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${tab === 'active' ? 'border-neuro-cyan text-neuro-cyan' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    ACTIVOS
                </button>
                <button 
                    onClick={() => setTab('history')}
                    className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${tab === 'history' ? 'border-neuro-cyan text-neuro-cyan' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    HISTORIAL
                </button>
            </div>

            {/* Content Area */}
            {tab === 'active' ? (
                <div className="space-y-4">
                    {activeGoals.map(goal => (
                        <GoalCard
                            key={goal.id}
                            goal={goal}
                            onClick={() => setEditingGoal(goal)}
                            progress={getGoalProgress(goal)}
                        />
                    ))}

                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full py-5 border border-dashed border-slate-700 rounded-xl text-slate-400 font-bold hover:border-neuro-cyan hover:text-neuro-cyan hover:bg-neuro-cyan/5 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                    >
                        <span>+</span> NUEVO OBJETIVO {getViewTitle()}
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                     <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {['all', 'week', 'month', 'quarter'].map(f => (
                            <button
                                key={f}
                                onClick={() => setHistoryFilter(f as any)}
                                className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${historyFilter === f ? 'bg-neuro-cyan text-black' : 'bg-slate-800 text-slate-400'}`}
                            >
                                {f === 'all' ? 'Todos' : f}
                            </button>
                        ))}
                     </div>

                     {historyGoals.length === 0 && <div className="text-center text-slate-600 py-10">Sin historial.</div>}
                     
                     {historyGoals.map(({g: goal, type}) => (
                         <div key={goal.id} className="glass p-4 rounded-xl border border-slate-800 opacity-75 hover:opacity-100 transition-opacity relative group">
                             <div className="flex justify-between">
                                <h4 className="font-bold text-slate-300 line-through decoration-neuro-green">{goal.title}</h4>
                                <span className="text-neuro-green text-xs font-bold flex items-center gap-1">
                                    <span className="text-[10px] text-slate-500 bg-slate-900 px-1 rounded uppercase mr-1">{type === 'week' ? 'Sem' : type === 'month' ? 'Mes' : 'Trim'}</span>
                                    COMPLETADO
                                </span>
                             </div>
                             <div className="text-[10px] text-slate-500 mt-2 font-mono flex justify-between items-center">
                                 <span>{goal.startDate} → {goal.completedDate}</span>
                                 <button 
                                    onClick={(e) => handleDeleteHistoryItem(e, goal.id, type)}
                                    className="p-1 hover:text-neuro-red text-slate-600 transition-colors"
                                 >
                                    🗑
                                 </button>
                             </div>
                         </div>
                     ))}
                </div>
            )}

            {/* --- MODAL CREACIÓN --- */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setIsCreating(false)}>
                    <div className="bg-neuro-card border border-slate-700 rounded-xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-wider">Nuevo Objetivo</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-2 font-mono">OBJETIVO PRINCIPAL (EL "QUÉ")</label>
                                <input 
                                    id="new-goal-title"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-neuro-purple outline-none"
                                    placeholder="Ej: Aumentar masa muscular..."
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setIsCreating(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-lg font-bold">CANCELAR</button>
                            <button 
                                onClick={() => {
                                    const title = (document.getElementById('new-goal-title') as HTMLInputElement).value;
                                    if(title) handleCreateGoal(title);
                                }}
                                className="flex-1 py-3 bg-neuro-purple text-white rounded-lg font-bold hover:brightness-110"
                            >
                                COMENZAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL CONFIG --- */}
            {showConfig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowConfig(false)}>
                    <div className="bg-neuro-card border border-slate-700 rounded-xl p-6 shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white font-bold mb-4">Ajustes de Ejecución</h3>
                        <div className="mb-6">
                            <label className="block text-xs text-slate-400 mb-2">UMBRAL DE ÉXITO (VERDE)</label>
                            <div className="flex items-center gap-4">
                                <input 
                                    type="range" 
                                    min="50" max="100" step="5"
                                    value={data.settings.executionThreshold}
                                    onChange={(e) => setData(prev => ({ ...prev, settings: { ...prev.settings, executionThreshold: Number(e.target.value) } }))}
                                    className="flex-1 accent-neuro-green"
                                />
                                <span className="text-neuro-green font-mono font-bold text-xl">{data.settings.executionThreshold}%</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 text-justify">
                                Porcentaje global necesario para considerar el periodo en estado "Óptimo" (Verde).
                            </p>
                        </div>
                        <button onClick={() => setShowConfig(false)} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold">GUARDAR</button>
                    </div>
                </div>
            )}

            {/* --- MODAL EDICIÓN / DETALLE (OKR) --- */}
            {editingGoal && (
                <OKRDetailModal 
                    goal={editingGoal} 
                    onClose={() => setEditingGoal(null)}
                    onUpdate={handleUpdateGoal}
                    onComplete={() => handleComplete(editingGoal)}
                    onDelete={() => handleDelete(editingGoal.id)}
                />
            )}

        </div>
    );
};