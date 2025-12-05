import React from 'react';

export const SettingsModule: React.FC = () => {
    const handleReset = () => {
        if (confirm("ADVERTENCIA: ¿Estás seguro de que quieres restablecer la aplicación a su estado de fábrica? Se borrarán todos tus objetivos, historial y configuraciones.")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="pb-8 animate-[fadeIn_0.5s_ease-out]">
            <h2 className="text-3xl font-black text-white mb-2">Configuración</h2>
            <p className="text-slate-400 text-sm mb-8">Ajustes generales del sistema.</p>

            <div className="glass p-6 rounded-xl border border-slate-800 space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Zona de Peligro</h3>
                    <p className="text-sm text-slate-400 mb-4">
                        Si experimentas errores o quieres comenzar desde cero, puedes restablecer la base de datos local. Esta acción es irreversible.
                    </p>
                    <button 
                        onClick={handleReset}
                        className="w-full py-4 bg-neuro-red/10 border border-neuro-red text-neuro-red font-bold rounded-xl hover:bg-neuro-red hover:text-white transition-all shadow-[0_0_15px_rgba(255,0,60,0.2)]"
                    >
                        ⚠️ RESTABLECER DE FÁBRICA
                    </button>
                </div>

                <div className="pt-6 border-t border-slate-800">
                    <h3 className="text-sm font-bold text-slate-300 mb-2">Acerca de</h3>
                    <p className="text-xs text-slate-500 font-mono">
                        NEUROPLAN [PRO] OS v1.2<br/>
                        Build: 2024.05<br/>
                        Desarrollado por GDonoso
                    </p>
                </div>
            </div>
        </div>
    );
};