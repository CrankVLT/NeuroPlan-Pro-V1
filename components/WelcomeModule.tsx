import React, { useState } from 'react';

const SECTIONS = [
    {
        title: "Bienvenido a NeuroPlan OS",
        subtitle: "Tu Sistema Operativo para la Productividad y el Bienestar",
        content: (
            <div className="space-y-4">
                <p className="text-lg text-slate-300 leading-relaxed">
                    NeuroPlan OS no es solo una lista de tareas. Es un <span className="text-neuro-cyan font-bold">Companion Cognitivo</span> diseñado para alinear tu biología con tus ambiciones.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                        <span className="text-2xl mb-2 block">🧠</span>
                        <h4 className="font-bold text-white mb-1">Mente</h4>
                        <p className="text-xs text-slate-400">Herramientas basadas en neurociencia para regular tu estado de ánimo y foco.</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                        <span className="text-2xl mb-2 block">📊</span>
                        <h4 className="font-bold text-white mb-1">Estrategia</h4>
                        <p className="text-xs text-slate-400">Metodología OKR para transformar sueños abstractos en datos accionables.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "La Filosofía OKR",
        subtitle: "Objetivos y Resultados Clave",
        content: (
            <div className="space-y-4">
                <p className="text-sm text-slate-400 italic mb-4">"No puedes gestionar lo que no puedes medir."</p>
                <p className="text-slate-300">
                    Los <span className="text-white font-bold">OKR (Objectives and Key Results)</span> son el sistema secreto utilizado por gigantes como Google e Intel para lograr lo imposible.
                </p>
                <ul className="space-y-3 mt-4 text-sm text-slate-300">
                    <li className="flex gap-3">
                        <span className="text-neuro-purple font-bold">EL QUÉ (Objetivo):</span>
                        <span>Tu meta inspiradora. Lo que quieres lograr. Ej: "Convertirme en un atleta de élite".</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="text-neuro-green font-bold">EL CÓMO (Key Result):</span>
                        <span>La métrica innegable de éxito. Ej: "Correr 10k en menos de 45 min".</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="text-neuro-cyan font-bold">EL PORQUÉ:</span>
                        <span>Para dejar de "estar ocupado" y empezar a ser productivo. Los OKRs te dan un norte claro.</span>
                    </li>
                </ul>
            </div>
        )
    },
    {
        title: "Módulo PLAN: Tu Cuartel General",
        subtitle: "Configura tu Éxito",
        content: (
            <div className="space-y-4">
                <p className="text-slate-300 mb-4">
                    En la pestaña <span className="text-neuro-purple font-bold">PLAN</span>, definirás tus batallas diarias, semanales y trimestrales.
                </p>

                <div className="space-y-4 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
                    <div>
                        <h5 className="font-bold text-white text-sm">1. Crea un Objetivo</h5>
                        <p className="text-xs text-slate-400">Define claramente qué quieres lograr.</p>
                    </div>
                    <div>
                        <h5 className="font-bold text-white text-sm">2. Añade Key Results (KRs)</h5>
                        <p className="text-xs text-slate-400">Establece metas numéricas (Target) y actualiza tu progreso (Current) diariamente.</p>
                    </div>
                    <div>
                        <h5 className="font-bold text-white text-sm">3. Tasa de Éxito</h5>
                        <p className="text-xs text-slate-400">
                            La barra superior te mostrará tu rendimiento global. Puedes ajustar la exigencia en
                            <span className="inline-block mx-1 bg-slate-800 px-1 rounded">⚙️ Ajustes</span> para que el sistema sea más o menos estricto con los colores (Verde/Amarillo/Rojo).
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "Flow Tools",
        subtitle: "Ingeniería del Estado Mental",
        content: (
            <div className="space-y-4">
                <p className="text-slate-300">
                    Tu cerebro es hardware biológico. El módulo <span className="text-neuro-purple font-bold">FLOW</span> contiene protocolos científicos para alterarlo a voluntad.
                </p>
                <div className="grid grid-cols-1 gap-2 mt-4">
                    <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-neuro-red"></span>
                        <span className="text-sm font-bold text-white">Activación:</span>
                        <span className="text-xs text-slate-400">Sube la energía (adrenalina) antes de trabajar.</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-neuro-purple"></span>
                        <span className="text-sm font-bold text-white">Enfoque:</span>
                        <span className="text-xs text-slate-400">Trabajo profundo y sostenido (Ciclos ultradianos).</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-neuro-blue"></span>
                        <span className="text-sm font-bold text-white">Calma/NSDR:</span>
                        <span className="text-xs text-slate-400">Recuperación y descanso profundo sin dormir.</span>
                    </div>
                </div>
            </div>
        )
    },
    {
        title: "Cortex y Ciencia",
        subtitle: "Estudio Profundo y Fundamentos",
        content: (
            <div className="space-y-4">
                <div className="border-l-2 border-neuro-cyan pl-4 mb-4">
                    <h4 className="font-bold text-neuro-cyan">Flujo Cortex (Beta)</h4>
                    <p className="text-sm text-slate-300">
                        Un algoritmo de estudio persistente. Convierte sesiones de estudio largas y complejas en pasos manejables que puedes pausar y retomar días después sin perder el hilo.
                    </p>
                </div>
                <div className="border-l-2 border-neuro-green pl-4">
                    <h4 className="font-bold text-neuro-green">Ciencia (Info)</h4>
                    <p className="text-sm text-slate-300">
                        Todo en NeuroPlan está respaldado por estudios. En este módulo encontrarás las fuentes y explicaciones técnicas de cada protocolo.
                    </p>
                </div>
            </div>
        )
    }
];

export const WelcomeModule: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    const [step, setStep] = useState(0);

    const next = () => {
        if (step < SECTIONS.length - 1) setStep(s => s + 1);
        else onStart();
    };

    const prev = () => {
        if (step > 0) setStep(s => s - 1);
    };

    return (
        <div className="h-full flex flex-col max-w-2xl mx-auto pb-12 animate-fadeIn">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-slate-800 rounded-full mb-8 overflow-hidden">
                <div
                    className="h-full bg-neuro-purple transition-all duration-500"
                    style={{ width: `${((step + 1) / SECTIONS.length) * 100}%` }}
                ></div>
            </div>

            <div className="flex-1 flex flex-col justify-center min-h-[400px]">
                <div className="mb-2">
                    <span className="text-neuro-cyan font-bold tracking-widest text-xs uppercase">CAPÍTULO {step + 1}/{SECTIONS.length}</span>
                </div>
                <h1 className="text-4xl font-black text-white mb-2">{SECTIONS[step].title}</h1>
                <h2 className="text-xl text-slate-500 mb-8 font-light">{SECTIONS[step].subtitle}</h2>

                <div className="glass p-8 rounded-2xl border border-slate-700 shadow-2xl min-h-[300px] flex flex-col justify-center">
                    {SECTIONS[step].content}
                </div>
            </div>

            <div className="flex justify-between items-center mt-8">
                <button
                    onClick={prev}
                    disabled={step === 0}
                    className={`px-6 py-3 rounded-lg font-bold text-sm transition-colors ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                    ANTERIOR
                </button>

                <div className="flex gap-2">
                    {SECTIONS.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-white' : 'bg-slate-800'}`}></div>
                    ))}
                </div>

                <button
                    onClick={next}
                    className="group flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-bold text-sm hover:bg-neuro-cyan hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
                >
                    {step === SECTIONS.length - 1 ? 'COMENZAR' : 'SIGUIENTE'}
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
            </div>
        </div>
    );
};