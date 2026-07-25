export interface User {
  id: string;
  email: string;
  full_name: string;
  role: "seller" | "supervisor" | "admin";
  avatar_url?: string;
  team_id?: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
}

export interface Call {
  id: string;
  user_id: string;
  title?: string;
  client_name?: string;
  audio_url?: string;
  duration_seconds: number;
  status: "pending" | "processing" | "completed" | "error";
  created_at: string;
  analysis?: Analysis;
}

export interface Analysis {
  id: string;
  call_id: string;
  transcription: string;
  summary: string;
  overall_score: number;
  closing_probability: number;
  strengths: string[];
  errors: string[];
  objections: Objection[];
  techniques_used: string[];
  recommendations: string[];
  next_steps: string[];
  timeline: TimelineEvent[];
  created_at: string;
}

export interface Objection {
  text: string;
  response: string;
  handled_well: boolean;
}

export interface TimelineEvent {
  id: string;
  type: "start" | "rapport" | "interest" | "objection" | "error" | "closing" | "end";
  label: string;
  timestamp_seconds: number;
  description?: string;
  is_highlight: boolean;
}

export interface SellerSkill {
  id: string;
  user_id: string;
  skill_name: string;
  score: number;
  explanation: string;
  updated_at: string;
}

export interface WeeklyGoal {
  id: string;
  user_id: string;
  week_number: number;
  year: number;
  calls_target: number;
  calls_completed: number;
  quality_target: number;
  quality_average: number;
}

export interface DashboardStats {
  calls_today: number;
  calls_this_week: number;
  average_score: number;
  score_trend: number;
  weekly_goal: WeeklyGoal;
  recent_calls: Call[];
}

export interface TeamRanking {
  user: User;
  average_score: number;
  total_calls: number;
  improvement: number;
}

export interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export type SkillName =
  | "empatia"
  | "escucha"
  | "preguntas"
  | "negociacion"
  | "rapport"
  | "cierre"
  | "descubrimiento"
  | "objeciones"
  | "confianza";

export const SKILL_LABELS: Record<SkillName, string> = {
  empatia: "Empatía",
  escucha: "Escucha Activa",
  preguntas: "Preguntas",
  negociacion: "Negociación",
  rapport: "Rapport",
  cierre: "Cierre",
  descubrimiento: "Descubrimiento",
  objeciones: "Manejo de Objeciones",
  confianza: "Generación de Confianza",
};

export const SKILL_COLORS: Record<SkillName, string> = {
  empatia: "#10b981",
  escucha: "#3b82f6",
  preguntas: "#8b5cf6",
  negociacion: "#f59e0b",
  rapport: "#ec4899",
  cierre: "#ef4444",
  descubrimiento: "#06b6d4",
  objeciones: "#f97316",
  confianza: "#14b8a6",
};
