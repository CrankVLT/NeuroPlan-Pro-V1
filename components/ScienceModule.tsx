import React from 'react';

const INFO = [
    { 
        t: "Batería Neuronal (Dopamina)", 
        c: "green", 
        content: "No eres una máquina, eres un sistema biológico. Tu capacidad de enfoque es limitada y se consume como una batería. El trabajo profundo drena Acetilcolina y Noradrenalina. Para recargar, no basta con 'parar', debes activar activamente el sistema parasimpático y reponer dopamina con protocolos como NSDR o Visión Panorámica. Gestiona tu energía, no solo tu tiempo." 
    },
    { 
        t: "Visión Panorámica (Descompresión)", 
        c: "blue", 
        content: "Mientras la visión de 'tubo' (pantallas) activa el sistema de estrés y alerta, dilatar la mirada para ver el horizonte y la periferia activa instantáneamente los circuitos de calma del cerebro. Es la forma mecánica más rápida de 'bajar las revoluciones' mentales tras un periodo de estrés." 
    },
    { 
        t: "Enfoque Visual (Gaze)", 
        c: "cyan", 
        content: "Nuestros ojos no son solo cámaras, son extensiones del cerebro. Mantener la mirada en un punto fijo durante 30-60 segundos suprime las 'microsacadas', enviando una señal de alerta al tronco encefálico. Esto activa el Locus Coeruleus para liberar Noradrenalina, incrementando drásticamente la agudeza mental y la disposición para la acción." 
    },
    { 
        t: "Activación (Tummo)", 
        c: "red", 
        content: "Inspirada en prácticas tibetanas, esta hiperventilación cíclica reduce deliberadamente los niveles de dióxido de carbono y eleva el pH sanguíneo. La hipoxia intermitente leve genera una respuesta de estrés agudo positivo (eustrés), inundando el sistema con Adrenalina y Dopamina. Es el antídoto biológico perfecto contra la procrastinación y el letargo." 
    },
    { 
        t: "Trabajo Profundo (Ultradian)", 
        c: "purple", 
        content: "La biología humana no es lineal; es cíclica. Operamos en Ritmos Ultradiano de aproximadamente 90 minutos de alto rendimiento, seguidos de 20 minutos de recuperación necesaria. Intentar forzar el foco más allá de este límite agota las reservas de Acetilcolina en el hipocampo, degradando el aprendizaje y aumentando la tasa de error." 
    },
    { 
        t: "Recuperación (Suspiro Fisiológico)", 
        c: "blue", 
        content: "Descubierto en los años 30, es el mecanismo más rápido del cuerpo para eliminar el estrés en tiempo real. Consiste en una doble inhalación (la segunda expande los alvéolos colapsados) seguida de una exhalación larga. Esto maximiza la expulsión de CO2 y activa instantáneamente el sistema nervioso parasimpático, reduciendo la frecuencia cardiaca en segundos." 
    },
    { 
        t: "NSDR (Yoga Nidra)", 
        c: "green", 
        content: "Non-Sleep Deep Rest es un estado de relajación autoguiada que imita el sueño de ondas lentas. 20 minutos de NSDR pueden reponer la dopamina en el cuerpo estriado y acelerar la neuroplasticidad hasta un 50% más rápido que el sueño convencional. Es ideal para recuperar energía mental tras un bloque intenso de trabajo sin la inercia del sueño (grogginess)." 
    },
    { 
        t: "Neurociencia Gamer: Hipofrontalidad", 
        c: "purple", 
        content: "La 'magia' de jugar como un niño se debe a la Hipofrontalidad Transitoria: el apagado temporal de la Corteza Prefrontal (juicio y análisis). El adulto vive en Hiperfrontalidad (ondas Beta, análisis constante). Para recuperar la inmersión, debes usar protocolos que reduzcan la actividad de la corteza y activen el sistema límbico antes de jugar." 
    }
];

export const ScienceModule: React.FC = () => {
    return (
        <div className="pb-8 animate-[fadeIn_0.5s_ease-out]">
            <h2 className="text-3xl font-black text-white mb-2">Información</h2>
            <p className="text-slate-400 text-sm mb-8">Base neurobiológica de las herramientas.</p>
            
            <div className="space-y-6">
                {INFO.map((item, i) => (
                    <div key={i} className={`glass p-6 rounded-xl border-l-4 border-neuro-${item.c} hover:translate-x-2 transition-transform duration-300`}>
                        <h3 className={`text-xl font-bold text-white mb-2`}>{item.t}</h3>
                        <p className="text-slate-300 text-sm leading-relaxed text-justify">{item.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};