export type ViewState = 'dashboard' | 'plan' | 'flow' | 'science' | 'settings' | 'cortex';

// --- CHEPE OS TYPES (OKR STRUCTURE) ---

export interface SubTask {
    id: number;
    title: string;
    completed: boolean;
}

export interface Task {
    id: number;
    title: string;
    completed: boolean;
}

export interface KeyResult {
    id: number;
    title: string;
    target: number;
    current: number;
    unit: string;
    tasks: Task[];
}

export interface Goal {
    id: number;
    title: string; // El "Qué" se quiere lograr
    status: 'active' | 'completed' | 'archived'; 
    startDate?: string; 
    endDate?: string;   
    completedDate?: string; 
    keyResults: KeyResult[]; // El "Cómo" se va a medir (KRs)
}

export interface PeriodData {
    title: string;
    goals: Goal[];
}

export interface PlanningData {
    week: PeriodData;
    month: PeriodData;
    quarter: PeriodData;
    settings: {
        executionThreshold: number; 
    };
}

// --- NEUROFLOW TYPES ---
export type FlowSessionType = 'gaze' | 'active' | 'tummo' | 'focus' | 'calm' | 'nsdr' | 'panoramic' | 'custom';

export interface BreathingPattern {
    inhale: number;
    hold1: number;
    exhale: number;
    hold2: number;
    cycles: number;
    double?: boolean; 
}

export interface SessionConfig {
    duration?: number; 
    pattern?: BreathingPattern;
    color: string;
    title: string;
    desc: string;
}

export interface FlowState {
    gaze: { duration: number }; 
    active: BreathingPattern;
    tummo: BreathingPattern;
    focus: { duration: number }; 
    calm: BreathingPattern;
    nsdr: { duration: number }; 
    panoramic: { duration: number };
    custom: BreathingPattern;
}