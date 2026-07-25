"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  Upload,
  Phone,
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  BarChart3,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Trophy,
} from "lucide-react";

interface Stats {
  calls_today: number;
  calls_this_week: number;
  average_score: number;
  score_trend: number;
  weekly_goal: {
    calls_target: number;
    calls_completed: number;
    quality_target: number;
    quality_average: number;
  };
  recent_calls: Array<{
    id: string;
    title?: string;
    client_name?: string;
    status: string;
    progress: number;
    created_at: string;
  }>;
}

interface GoalProgress {
  calls_target: number;
  quality_target: number;
  improvement_target: number;
  week_start: string;
  calls_completed: number;
  quality_average: number;
  improvement_actual: number;
  calls_progress: number;
  quality_progress: number;
  improvement_progress: number;
}

function GoalBar({ label, value, progress, color, detail }: { label: string; value: string; progress: number; color: string; detail: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-lg font-bold text-slate-900">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{detail}</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [goals, setGoals] = React.useState<GoalProgress | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editingGoals, setEditingGoals] = React.useState(false);
  const [savingGoals, setSavingGoals] = React.useState(false);
  const [goalDraft, setGoalDraft] = React.useState({ calls_target: 10, quality_target: 80, improvement_target: 5 });

  React.useEffect(() => {
    Promise.all([
      api.get("/api/v1/dashboard/stats"),
      api.get("/api/v1/dashboard/goals").catch(() => ({
        calls_target: 10,
        quality_target: 80,
        improvement_target: 5,
        week_start: new Date().toISOString().slice(0, 10),
        calls_completed: 0,
        quality_average: 0,
        improvement_actual: 0,
        calls_progress: 0,
        quality_progress: 0,
        improvement_progress: 0,
      })),
    ]).then(([statsData, goalsData]) => {
      setStats(statsData);
      setGoals(goalsData);
      setGoalDraft({
        calls_target: goalsData.calls_target,
        quality_target: goalsData.quality_target,
        improvement_target: goalsData.improvement_target,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const saveGoals = async () => {
    setSavingGoals(true);
    try {
      const saved = await api.put("/api/v1/dashboard/goals", goalDraft);
      setGoals(saved);
      setGoalDraft({
        calls_target: saved.calls_target,
        quality_target: saved.quality_target,
        improvement_target: saved.improvement_target,
      });
      setEditingGoals(false);
    } finally {
      setSavingGoals(false);
    }
  };

  const goalDate = goals?.week_start
    ? new Date(`${goals.week_start}T12:00:00`).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
    : "esta semana";

  const formatRelative = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "Ahora";
      if (mins < 60) return `${mins}m`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h`;
      const days = Math.floor(hrs / 24);
      return `${days}d`;
    } catch {
      return "";
    }
  };

  const statusIcon = (s: string) => {
    if (s === "completed") return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (s === "error") return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  return (
    <>
      <Header title="Dashboard" subtitle="Bienvenido a SalesCoach AI" />

      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        {/* CTA Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700">
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  Comienza a analizar llamadas
                </h2>
                <p className="text-emerald-100 max-w-md">
                  Sube un audio de una llamada de ventas y la IA te dará
                  recomendaciones personalizadas para mejorar.
                </p>
              </div>
              <Link href="/calls">
                <Button size="xl" className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg">
                  <Upload className="w-5 h-5" />
                  Analizar llamada
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Llamadas hoy</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {loading ? "--" : stats?.calls_today ?? 0}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100">
                  <Phone className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-3">
                {stats?.calls_this_week ?? 0} esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Calidad promedio</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {loading ? "--" : stats?.average_score ? `${stats.average_score}` : "--"}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {!loading && stats?.score_trend !== 0 && (
                  <>
                    {stats!.score_trend > 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${stats!.score_trend > 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {stats!.score_trend > 0 ? "+" : ""}{stats!.score_trend}
                    </span>
                  </>
                )}
                <span className="text-sm text-slate-400">/100</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Meta semanal</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {loading ? "--" : `${stats?.weekly_goal.calls_completed ?? 0}/${stats?.weekly_goal.calls_target ?? 25}`}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((stats?.weekly_goal.calls_completed ?? 0) / (stats?.weekly_goal.calls_target ?? 25)) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Análisis totales</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {loading ? "--" : stats?.calls_this_week ?? 0}
                  </p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-3">Todo el tiempo</p>
            </CardContent>
          </Card>
        </div>

        {/* Personal goals */}
        <Card className="overflow-hidden border-slate-200">
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle>Mi semana de crecimiento</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">Define el ritmo que quieres sostener y mira cómo avanzas.</p>
                </div>
              </div>
            </div>
            {!editingGoals && (
              <Button variant="outline" size="sm" onClick={() => setEditingGoals(true)}>
                <Pencil className="w-4 h-4 mr-1" /> Editar metas
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editingGoals ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Llamadas analizadas</span>
                  <input type="number" min="1" max="500" value={goalDraft.calls_target}
                    onChange={(e) => setGoalDraft({ ...goalDraft, calls_target: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                  <span className="text-xs text-slate-400">Meta de volumen semanal</span>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Calidad promedio</span>
                  <div className="relative"><input type="number" min="1" max="100" value={goalDraft.quality_target}
                    onChange={(e) => setGoalDraft({ ...goalDraft, quality_target: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-12 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" /><span className="absolute right-3 top-2 text-sm text-slate-400">/100</span></div>
                  <span className="text-xs text-slate-400">Puntuación objetivo de tus llamadas</span>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-700">Mejora vs. semana anterior</span>
                  <div className="relative"><input type="number" min="0" max="100" step="0.5" value={goalDraft.improvement_target}
                    onChange={(e) => setGoalDraft({ ...goalDraft, improvement_target: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 pr-8 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" /><span className="absolute right-3 top-2 text-sm text-slate-400">pts</span></div>
                  <span className="text-xs text-slate-400">Cuánto quieres mejorar tu calidad</span>
                </label>
                <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button variant="ghost" size="sm" onClick={() => setEditingGoals(false)}>Cancelar</Button>
                  <Button size="sm" onClick={saveGoals} disabled={savingGoals}>
                    {savingGoals ? "Guardando..." : "Guardar metas"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GoalBar label="Llamadas analizadas" value={`${goals?.calls_completed ?? 0}/${goals?.calls_target ?? 10}`} progress={goals?.calls_progress ?? 0} color="bg-emerald-500" detail={`${goals?.calls_completed ?? 0} completadas esta semana`} />
                <GoalBar label="Calidad de conversación" value={goals?.quality_average ? `${goals.quality_average}/100` : "--"} progress={goals?.quality_progress ?? 0} color="bg-blue-500" detail={`Objetivo: ${goals?.quality_target ?? 80}/100`} />
                <GoalBar label="Mejora personal" value={goals?.improvement_actual ? `+${goals.improvement_actual} pts` : "En progreso"} progress={goals?.improvement_progress ?? 0} color="bg-amber-500" detail={`Objetivo: +${goals?.improvement_target ?? 5} pts`} />
              </div>
            )}
            {!editingGoals && <p className="text-xs text-slate-400 mt-5">Semana iniciada el {goalDate}. El avance se actualiza después de cada análisis.</p>}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:border-emerald-200 transition-colors cursor-pointer">
            <Link href="/calls">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-100">
                    <Upload className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Subir llamada</h3>
                    <p className="text-sm text-slate-500">Arrastra un audio para analizar</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:border-emerald-200 transition-colors cursor-pointer">
            <Link href="/coach">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-100">
                    <Zap className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Hablar con Coach IA</h3>
                    <p className="text-sm text-slate-500">Preguntas sobre ventas</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:border-emerald-200 transition-colors cursor-pointer">
            <Link href="/training">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-purple-100">
                    <BarChart3 className="w-7 h-7 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Practicar</h3>
                    <p className="text-sm text-slate-500">Roleplays y escenarios</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Calls */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Llamadas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-200 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !stats?.recent_calls?.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                  <Phone className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-medium text-slate-900 mb-1">No hay llamadas aún</h3>
                <p className="text-sm text-slate-500 max-w-sm mb-4">
                  Sube tu primera llamada de ventas y la IA la analizará automáticamente.
                </p>
                <Link href="/calls">
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir primera llamada
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.recent_calls.map((call) => (
                  <Link key={call.id} href={`/analysis/${call.id}`}>
                    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-100 transition-colors">
                        {statusIcon(call.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {call.title || call.client_name || "Llamada"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {call.client_name && call.title ? call.client_name + " · " : ""}
                          {formatRelative(call.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {call.status === "completed" ? (
                          <Badge variant="success">Analizada</Badge>
                        ) : call.status === "error" ? (
                          <Badge variant="destructive">Error</Badge>
                        ) : (
                          <Badge variant="warning">{call.progress}%</Badge>
                        )}
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default DashboardPage;
