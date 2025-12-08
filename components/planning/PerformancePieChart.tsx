import React, { useMemo } from 'react';
import { Goal } from '../../types';

interface PerformancePieChartProps {
    goals: Goal[];
    threshold: number;
}

export const PerformancePieChart: React.FC<PerformancePieChartProps> = ({ goals, threshold }) => {

    const stats = useMemo(() => {
        let optimal = 0;
        let warning = 0;
        let critical = 0;

        goals.forEach(goal => {
            // Calculate progress for this goal
            let progress = 0;
            if (goal.keyResults && goal.keyResults.length > 0) {
                const total = goal.keyResults.reduce((acc, kr) => {
                    const p = kr.target > 0 ? (kr.current / kr.target) : 0;
                    return acc + Math.min(1, p);
                }, 0);
                progress = Math.round((total / goal.keyResults.length) * 100);
            }

            if (progress >= threshold) optimal++;
            else if (progress >= (threshold / 2)) warning++;
            else critical++;
        });

        return { optimal, warning, critical, total: goals.length };
    }, [goals, threshold]);

    // Pie Chart Calculations
    const radius = 50;
    const circumference = 2 * Math.PI * radius; // ~314.159

    const renderSlice = (count: number, color: string, offset: number) => {
        if (count === 0) return null;
        const percentage = count / stats.total;
        const strokeDasharray = `${percentage * circumference} ${circumference}`;

        return (
            <circle
                r={radius}
                cx="60"
                cy="60"
                fill="transparent"
                stroke={color}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={-offset} // Negative for clockwise
                className="transition-all duration-1000 ease-out"
            />
        );
    };

    if (stats.total === 0) return null;

    // Calculate offsets
    // Order: Optimal -> Warning -> Critical
    const optimalOffset = 0; // Starts at top (which is -90deg rotation handle by SVG transform)
    const warningOffset = (stats.optimal / stats.total) * circumference;
    const criticalOffset = warningOffset + ((stats.warning / stats.total) * circumference);

    return (
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 flex flex-col items-center justify-center h-full">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Rendimiento Histórico</h3>

            <div className="relative w-48 h-48">
                {/* SVG Chart */}
                <svg width="100%" height="100%" viewBox="0 0 120 120" className="transform -rotate-90">
                    <circle r={radius} cx="60" cy="60" fill="transparent" stroke="#1e293b" strokeWidth="20" />
                    {renderSlice(stats.optimal, '#10b981', optimalOffset)} {/* neuro-green */}
                    {renderSlice(stats.warning, '#facc15', warningOffset)} {/* yellow-400 */}
                    {renderSlice(stats.critical, '#ef4444', criticalOffset)} {/* neuro-red */}
                </svg>

                {/* Center Stats */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{stats.total}</span>
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Objetivos</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-8 w-full justify-center">
                <div className="flex flex-col items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-neuro-green shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-xs font-bold text-slate-300">{stats.optimal}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                    <span className="text-xs font-bold text-slate-300">{stats.warning}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-neuro-red shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                    <span className="text-xs font-bold text-slate-300">{stats.critical}</span>
                </div>
            </div>
        </div>
    );
};
