import React from 'react';
import { Goal } from '../../types';

interface GoalCardProps {
    goal: Goal;
    onClick: () => void;
    progress: number;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onClick, progress }) => {
    return (
        <div 
            onClick={onClick}
            className="glass p-5 rounded-xl border-l-4 border-neuro-purple hover:bg-white/5 cursor-pointer transition-all group"
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white group-hover:text-neuro-cyan transition-colors">{goal.title}</h3>
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
                    {progress}%
                </span>
            </div>
            
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                <div 
                    className="h-full bg-gradient-to-r from-neuro-purple to-neuro-cyan" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>{goal.keyResults?.length || 0} RESULTADOS CLAVE</span>
                <span>VENCE: {goal.endDate}</span>
            </div>
        </div>
    );
};