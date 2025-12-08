import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Goal, KeyResult, Task } from '../../types';

interface OKRDetailModalProps {
    goal: Goal;
    onClose: () => void;
    onUpdate: (g: Goal) => void;
    onComplete: () => void;
    onDelete: () => void;
}

export const OKRDetailModal: React.FC<OKRDetailModalProps> = ({ goal, onClose, onUpdate, onComplete, onDelete }) => {

    // Key Results Management
    const [newKRMode, setNewKRMode] = useState(false);
    const [krTitle, setKrTitle] = useState('');
    const [krTarget, setKrTarget] = useState(10);
    const [krUnit, setKrUnit] = useState('ud');

    // Tasks Management
    const [expandedKR, setExpandedKR] = useState<number | null>(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const addKR = () => {
        if (!krTitle) return;
        const newKR: KeyResult = {
            id: Date.now(),
            title: krTitle,
            current: 0,
            target: krTarget,
            unit: krUnit,
            tasks: []
        };
        const updatedKRs = [...(goal.keyResults || []), newKR];
        onUpdate({ ...goal, keyResults: updatedKRs });
        setNewKRMode(false);
        setKrTitle('');
    };

    const updateKR = (krId: number, updates: Partial<KeyResult>) => {
        const updatedKRs = goal.keyResults.map(kr => kr.id === krId ? { ...kr, ...updates } : kr);
        onUpdate({ ...goal, keyResults: updatedKRs });
    };

    const deleteKR = (krId: number) => {
        if (!confirm("¿Borrar Resultado Clave?")) return;
        const updatedKRs = goal.keyResults.filter(kr => kr.id !== krId);
        onUpdate({ ...goal, keyResults: updatedKRs });
    };

    const addTaskToKR = (krId: number) => {
        if (!newTaskTitle) return;
        const newTask: Task = { id: Date.now(), title: newTaskTitle, completed: false };
        const updatedKRs = goal.keyResults.map(kr => kr.id === krId ? { ...kr, tasks: [...kr.tasks, newTask] } : kr);
        onUpdate({ ...goal, keyResults: updatedKRs });
        setNewTaskTitle('');
    };

    const toggleTask = (krId: number, taskId: number) => {
        const updatedKRs = goal.keyResults.map(kr => {
            if (kr.id === krId) {
                const newTasks = kr.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
                return { ...kr, tasks: newTasks };
            }
            return kr;
        });
        onUpdate({ ...goal, keyResults: updatedKRs });
    };

    const deleteTask = (krId: number, taskId: number) => {
        const updatedKRs = goal.keyResults.map(kr => kr.id === krId ? { ...kr, tasks: kr.tasks.filter(t => t.id !== taskId) } : kr);
        onUpdate({ ...goal, keyResults: updatedKRs });
    };

    // Helper for inputs to avoid leading zeros
    const handleNumberInput = (val: string) => {
        if (val === '') return 0;
        return Number(val);
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col bg-neuro-bg/95 backdrop-blur-xl animate-[slideIn_0.2s_ease-out]">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 pt-14 md:pt-4">
                <button onClick={onClose} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold text-sm">
                    ← ATRÁS
                </button>
                <div className="flex items-center gap-4">
                    <button
                        onClick={onDelete}
                        className="text-neuro-red hover:text-red-400 font-bold text-xs uppercase tracking-wider border border-neuro-red/30 px-3 py-1 rounded bg-neuro-red/10"
                    >
                        ELIMINAR
                    </button>
                    <div className="font-mono text-xs text-slate-500 font-bold uppercase tracking-widest hidden md:block">
                        EDITANDO OBJETIVO
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-3xl mx-auto w-full pb-32 hide-scrollbar">

                {/* Title Section */}
                <div className="mb-8">
                    <label className="text-[10px] text-neuro-purple font-mono font-bold tracking-widest uppercase mb-2 block">OBJETIVO PRINCIPAL</label>
                    <input
                        className="w-full bg-transparent text-xl md:text-3xl font-bold text-white outline-none border-b border-transparent focus:border-slate-700 pb-2 placeholder-slate-600"
                        value={goal.title}
                        onChange={(e) => onUpdate({ ...goal, title: e.target.value })}
                        placeholder="Define tu objetivo..."
                    />
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

                            return (
                                <div key={kr.id} className="glass rounded-xl overflow-hidden border border-slate-800">
                                    {/* KR Header */}
                                    <div className="p-4 bg-slate-900/40">
                                        <div className="flex justify-between items-start gap-2 mb-3">
                                            <input
                                                className="bg-transparent font-bold text-slate-200 outline-none flex-1 text-sm md:text-base"
                                                value={kr.title}
                                                onChange={(e) => updateKR(kr.id, { title: e.target.value })}
                                            />
                                            <button onClick={() => deleteKR(kr.id)} className="text-slate-600 hover:text-neuro-red text-xs">✕</button>
                                        </div>

                                        {/* Progress Controls */}
                                        <div className="flex items-center gap-3 mb-2 flex-wrap md:flex-nowrap">
                                            <div className="w-full md:flex-1 flex items-center gap-2 order-2 md:order-1">
                                                <button
                                                    onClick={() => updateKR(kr.id, { current: Math.max(0, kr.current - 1) })}
                                                    className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 text-neuro-cyan hover:bg-neuro-cyan hover:text-black font-bold text-sm transition-colors border border-slate-700 hover:border-neuro-cyan"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="range"
                                                    min="0" max={kr.target}
                                                    value={kr.current}
                                                    onChange={(e) => updateKR(kr.id, { current: Number(e.target.value) })}
                                                    className="flex-1 h-2 bg-slate-700 rounded-full accent-neuro-cyan"
                                                />
                                                <button
                                                    onClick={() => updateKR(kr.id, { current: Math.min(kr.target, kr.current + 1) })}
                                                    className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 text-neuro-cyan hover:bg-neuro-cyan hover:text-black font-bold text-sm transition-colors border border-slate-700 hover:border-neuro-cyan"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1 font-mono text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700 order-1 md:order-2 ml-auto">
                                                <input
                                                    type="number"
                                                    className="w-12 bg-transparent text-right outline-none text-neuro-cyan font-bold"
                                                    value={kr.current || ''}
                                                    placeholder="0"
                                                    onChange={(e) => updateKR(kr.id, { current: handleNumberInput(e.target.value) })}
                                                />
                                                <span className="text-slate-500">de</span>
                                                <input
                                                    type="number"
                                                    className="w-12 bg-transparent text-right outline-none text-white"
                                                    value={kr.target || ''}
                                                    placeholder="0"
                                                    onChange={(e) => updateKR(kr.id, { target: handleNumberInput(e.target.value) })}
                                                />
                                                <input
                                                    className="min-w-[20px] max-w-[60px] bg-transparent text-center outline-none text-slate-500 uppercase truncate"
                                                    value={kr.unit}
                                                    onChange={(e) => updateKR(kr.id, { unit: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tasks Toggle */}
                                    <div className="border-t border-slate-800">
                                        <button
                                            onClick={() => setExpandedKR(isExpanded ? null : kr.id)}
                                            className="w-full py-2 px-4 flex justify-between items-center text-xs font-bold text-slate-500 hover:bg-white/5 transition-colors"
                                        >
                                            <span>TAREAS ({kr.tasks.filter(t => t.completed).length}/{kr.tasks.length})</span>
                                            <span>{isExpanded ? '▲' : '▼'}</span>
                                        </button>

                                        {isExpanded && (
                                            <div className="p-4 bg-slate-900/60 animate-[fadeIn_0.3s]">
                                                {/* Tasks List */}
                                                <div className="space-y-2 mb-3">
                                                    {kr.tasks.map(task => (
                                                        <div key={task.id} className="flex items-center gap-3 group">
                                                            <button
                                                                onClick={() => toggleTask(kr.id, task.id)}
                                                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${task.completed ? 'bg-neuro-green border-neuro-green text-black' : 'border-slate-500'}`}
                                                            >
                                                                {task.completed && '✓'}
                                                            </button>
                                                            <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                                                                {task.title}
                                                            </span>
                                                            <button onClick={() => deleteTask(kr.id, task.id)} className="text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">🗑</button>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Add Task Input */}
                                                <div className="flex gap-2">
                                                    <input
                                                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-neuro-cyan"
                                                        placeholder="Nueva tarea..."
                                                        value={newTaskTitle}
                                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && addTaskToKR(kr.id)}
                                                    />
                                                    <button
                                                        onClick={() => addTaskToKR(kr.id)}
                                                        disabled={!newTaskTitle}
                                                        className="bg-slate-700 text-white px-3 py-1 rounded text-xs font-bold hover:bg-neuro-cyan hover:text-black disabled:opacity-50"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* New KR Form */}
                        {newKRMode ? (
                            <div className="glass p-4 rounded-xl border border-dashed border-neuro-purple animate-[fadeIn_0.3s]">
                                <div className="mb-3">
                                    <label className="text-[10px] text-neuro-purple font-bold block mb-1">TÍTULO DEL KR</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-neuro-purple text-sm"
                                        placeholder="Ej: Escribir 5 artículos"
                                        value={krTitle}
                                        onChange={(e) => setKrTitle(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-4 mb-3">
                                    <div className="flex-1">
                                        <label className="text-[10px] text-slate-500 block mb-1">META</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none text-right text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            value={krTarget || ''}
                                            placeholder="0"
                                            onChange={e => setKrTarget(handleNumberInput(e.target.value))}
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-[10px] text-slate-500 block mb-1">UNIDAD</label>
                                        <input className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none text-center text-sm" value={krUnit} onChange={e => setKrUnit(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setNewKRMode(false)} className="flex-1 py-2 bg-slate-800 text-slate-400 rounded text-xs font-bold">CANCELAR</button>
                                    <button onClick={addKR} disabled={!krTitle} className="flex-1 py-2 bg-neuro-purple text-white rounded text-xs font-bold hover:brightness-110 disabled:opacity-50">GUARDAR KR</button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setNewKRMode(true)}
                                className="w-full py-3 border border-slate-800 rounded-xl text-slate-500 text-xs font-bold hover:border-neuro-cyan hover:text-neuro-cyan transition-all flex items-center justify-center gap-2"
                            >
                                + AÑADIR RESULTADO CLAVE
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer / Actions Bar */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end gap-3 z-50">
                <button
                    onClick={onComplete}
                    className="px-6 py-2 bg-slate-800 text-neuro-green border border-slate-700 hover:bg-neuro-green/10 rounded-lg font-bold text-sm transition-all"
                >
                    COMPLETAR
                </button>
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-neuro-purple text-white hover:brightness-110 rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(112,0,255,0.3)] transition-all"
                >
                    GUARDAR
                </button>
            </div>
        </div>,
        document.body
    );
};