import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import { PlanningModule } from './components/PlanningModule';
import { FlowModule } from './components/FlowModule';
import { ScienceModule } from './components/ScienceModule';
import { SettingsModule } from './components/SettingsModule';
import { CortexModule } from './components/CortexModule';
import { WelcomeModule } from './components/WelcomeModule';

const App: React.FC = () => {
    const [view, setView] = useState<ViewState>('welcome');
    const [booting, setBooting] = useState(true);
    
    // Neural Battery State
    const [battery, setBattery] = useState(100);

    useEffect(() => {
        const timer = setTimeout(() => setBooting(false), 2500);
        // Load battery
        const savedBattery = localStorage.getItem('neuro_battery');
        if(savedBattery) setBattery(Number(savedBattery));
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        localStorage.setItem('neuro_battery', String(battery));
    }, [battery]);

    const updateBattery = (amount: number) => {
        setBattery(prev => Math.min(100, Math.max(0, prev + amount)));
    };

    // Battery Color Logic
    const getBatteryColor = () => {
        if(battery > 60) return 'text-neuro-green';
        if(battery > 30) return 'text-yellow-400';
        return 'text-neuro-red';
    };

    const getBatteryBarColor = () => {
        if(battery > 60) return 'bg-neuro-green';
        if(battery > 30) return 'bg-yellow-400';
        return 'bg-neuro-red';
    };

    if (booting) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center flex-col z-[100]">
                <div className="w-16 h-16 border-4 border-neuro-purple border-t-transparent rounded-full animate-spin mb-6"></div>
                <h1 className="text-2xl font-black text-white tracking-[0.3em] animate-pulse">NEUROPLAN<span className="text-neuro-cyan">.OS</span></h1>
                <div className="font-mono text-[10px] text-slate-500 mt-2">INICIANDO MÓDULOS PRINCIPALES...</div>
            </div>
        );
    }

    return (
        // Estructura Flex Column: Header fijo (si lo hubiera) + Main (flexible con scroll) + Footer (fijo)
        <div className="fixed inset-0 w-full h-full bg-neuro-bg text-slate-200 font-sans selection:bg-neuro-purple selection:text-white flex flex-col md:flex-row overflow-hidden">
            
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 h-full border-r border-slate-800 z-50 glass shrink-0">
                <div className="p-8">
                    <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neuro-cyan to-neuro-purple">
                        NEUROPLAN
                    </h1>
                    <p className="text-[10px] font-mono text-slate-500 tracking-[0.3em] uppercase mt-1">OS v1.3 [BETA]</p>
                </div>

                {/* Neural Battery Desktop */}
                <div className="px-6 mb-6">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batería Neuronal</span>
                            <span className={`text-sm font-mono font-bold ${getBatteryColor()}`}>{Math.round(battery)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${getBatteryBarColor()} transition-all duration-500`} style={{ width: `${battery}%` }}></div>
                        </div>
                    </div>
                </div>
                
                <nav className="flex-1 px-4 space-y-2">
                    <NavBtn label="Bienvenido" active={view === 'welcome'} onClick={() => setView('welcome')} icon="👋" />
                    <NavBtn label="Planificación" active={view === 'dashboard'} onClick={() => setView('dashboard')} icon="📊" />
                    <NavBtn label="Flow Tools" active={view === 'flow'} onClick={() => setView('flow')} icon="🧠" />
                    <NavBtn label="Cortex (Estudio)" active={view === 'cortex'} onClick={() => setView('cortex')} icon="🎓" />
                    <NavBtn label="Info" active={view === 'science'} onClick={() => setView('science')} icon="🧬" />
                    <NavBtn label="Ajustes" active={view === 'settings'} onClick={() => setView('settings')} icon="⚙️" />
                </nav>

                <div className="p-6">
                   <div className="flex items-center gap-2 text-[10px] text-neuro-green font-mono">
                       <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                       SISTEMA ONLINE
                   </div>
                </div>
            </aside>

            {/* Mobile Header - Fijo arriba */}
            <header className="md:hidden shrink-0 flex justify-between items-center px-4 py-3 bg-neuro-bg border-b border-white/5 shadow-lg z-40">
                <div className="flex items-center gap-2">
                    <span className="font-black text-lg tracking-tight text-white">NEUROPLAN <span className="text-neuro-cyan text-xs">[PRO]</span></span>
                </div>
                {/* Neural Battery Mobile */}
                <div className="flex items-center gap-2 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800">
                    <div className={`w-2 h-2 rounded-full ${getBatteryBarColor()} animate-pulse`}></div>
                    <span className={`text-xs font-mono font-bold ${getBatteryColor()}`}>{Math.round(battery)}%</span>
                </div>
            </header>

            {/* Content Area - Flexible y Scrolleable */}
            <main className="flex-1 relative z-0 overflow-y-auto native-scroll">
                {/* Background Ambient Effect */}
                <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neuro-purple/10 rounded-full blur-[120px] mix-blend-screen animate-blob"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neuro-cyan/10 rounded-full blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '2s'}}></div>
                </div>

                <div className="max-w-4xl mx-auto p-4 md:p-12">
                    <div className="animate-[fadeIn_0.5s_ease-out]">
                        {view === 'welcome' && <WelcomeModule onStart={() => setView('dashboard')} />}
                        {view === 'dashboard' && <PlanningModule />}
                        {view === 'flow' && <FlowModule onSessionComplete={updateBattery} />}
                        {view === 'cortex' && <CortexModule />}
                        {view === 'science' && <ScienceModule />}
                        {view === 'settings' && <SettingsModule />}
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Navigation - ESTÁTICO (No fixed flotante sobre contenido) */}
            <nav className="md:hidden shrink-0 h-16 bg-slate-900 border-t border-white/10 flex items-center justify-around px-2 z-50">
                <MobileNavBtn label="PLAN" active={view === 'dashboard'} onClick={() => setView('dashboard')} icon="📊" />
                <div className="w-[1px] h-6 bg-white/5"></div>
                <MobileNavBtn label="FLOW" active={view === 'flow'} onClick={() => setView('flow')} icon="🧠" />
                <div className="w-[1px] h-6 bg-white/5"></div>
                <MobileNavBtn label="STUDY" active={view === 'cortex'} onClick={() => setView('cortex')} icon="🎓" />
                <div className="w-[1px] h-6 bg-white/5"></div>
                <MobileNavBtn label="INFO" active={view === 'science'} onClick={() => setView('science')} icon="🧬" />
                <div className="w-[1px] h-6 bg-white/5"></div>
                <MobileNavBtn label="AJUSTES" active={view === 'settings'} onClick={() => setView('settings')} icon="⚙️" />
            </nav>

        </div>
    );
};

const NavBtn: React.FC<{ label: string; active: boolean; onClick: () => void; icon: string }> = ({ label, active, onClick, icon }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-bold ${active ? 'bg-neuro-purple/20 text-white border border-neuro-purple/50' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
    >
        <span>{icon}</span>
        {label}
    </button>
);

const MobileNavBtn: React.FC<{ label: string; active: boolean; onClick: () => void; icon: string }> = ({ label, active, onClick, icon }) => (
    <button 
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center w-full h-full transition-all ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
    >
        {active && <div className="absolute top-0 w-8 h-1 bg-neuro-cyan rounded-b-full shadow-[0_0_10px_cyan]"></div>}
        <span className="text-xl mb-0.5">{icon}</span>
        <span className="text-[8px] font-bold tracking-wider">{label}</span>
    </button>
);

export default App;