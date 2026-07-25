"use client";

import * as React from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import { api } from "@/lib/api";
import {
  cn,
  formatDuration,
  getScoreColor,
  getScoreBg,
  getProbabilityLabel,
} from "@/lib/utils";
import {
  ArrowLeft,
  Download,
  Share2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Target,
  Clock,
  MessageSquare,
  TrendingUp,
  Zap,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface AnalysisData {
  id: string;
  call_id: string;
  transcription: string | null;
  summary: string | null;
  overall_score: number | null;
  closing_probability: number | null;
  strengths: string[];
  errors: string[];
  objections: { text: string; response: string; handled_well: boolean }[];
  techniques_used: string[];
  recommendations: string[];
  next_steps: string[];
  timeline: {
    id: string;
    type: string;
    label: string;
    timestamp_seconds: number;
    description?: string;
    is_highlight: boolean;
  }[];
}

interface CallData {
  id: string;
  title: string;
  client_name: string;
  duration_seconds?: number;
  status: string;
  created_at: string;
}

function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [analysis, setAnalysis] = React.useState<AnalysisData | null>(null);
  const [call, setCall] = React.useState<CallData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [activeTimelineEvent, setActiveTimelineEvent] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    loadAnalysis();
  }, [resolvedParams.id]);

  const loadAnalysis = async () => {
    try {
      const [analysisData, callData] = await Promise.all([
        api.get(`/api/v1/analyses/${resolvedParams.id}`),
        api.get(`/api/v1/calls/${resolvedParams.id}`),
      ]);
      setAnalysis(analysisData);
      setCall(callData);
    } catch {
      setError("No se pudo cargar el análisis. Asegúrate de que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  const timelineColors: Record<string, string> = {
    start: "bg-slate-400",
    rapport: "bg-blue-400",
    interest: "bg-emerald-400",
    objection: "bg-amber-400",
    error: "bg-red-400",
    closing: "bg-purple-400",
    end: "bg-slate-400",
  };

  if (loading) {
    return (
      <>
        <Header title="" />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </>
    );
  }

  if (error || !analysis || !call) {
    return (
      <>
        <Header title="" />
        <div className="p-6 max-w-[1400px] mx-auto">
          <Link
            href="/calls"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a llamadas
          </Link>
          <Card>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {error || "Análisis no encontrado"}
                </h3>
                <p className="text-sm text-slate-500">
                  Esta llamada aún no tiene análisis o el backend no está disponible.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const score = analysis.overall_score ?? 0;
  const probability = analysis.closing_probability ?? 0;

  return (
    <>
      <Header
        title=""
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4" />
              Compartir
            </Button>
          </div>
        }
      />

      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        <Link
          href="/calls"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a llamadas
        </Link>

        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardContent className="p-8 flex flex-col items-center">
              <ProgressRing
                value={score}
                size={160}
                strokeWidth={12}
                label="puntuacion"
              />
              <div className="mt-6 text-center">
                <h2 className="text-lg font-semibold text-slate-900">
                  {call.title}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {call.client_name} · {formatDuration(call.duration_seconds ?? 0)}
                </p>
              </div>

              <div className="mt-6 w-full p-4 rounded-xl bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">
                    Probabilidad de cierre
                  </span>
                  <Badge
                    variant={
                      probability >= 60
                        ? "success"
                        : probability >= 40
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {getProbabilityLabel(probability)}
                  </Badge>
                </div>
                <div className="flex items-end gap-2">
                  <span
                    className={cn(
                      "text-3xl font-bold font-mono",
                      getScoreColor(probability)
                    )}
                  >
                    {probability}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                Resumen del Analisis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-slate-600 leading-relaxed">{analysis.summary}</p>

              <div>
                <h4 className="font-medium text-slate-900 mb-3">
                  Tecnicas Utilizadas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.techniques_used.map((technique) => (
                    <Badge key={technique} variant="info">
                      {technique}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">
                      Fortalezas
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {analysis.strengths.length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">
                      Errores
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {analysis.errors.length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">
                      Objeciones
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {analysis.objections.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
                Fortalezas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-sm text-slate-600">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                Errores Detectados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.errors.map((error, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 flex-shrink-0 mt-0.5">
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                    </div>
                    <span className="text-sm text-slate-600">{error}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {analysis.objections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-5 h-5" />
                Objeciones Detectadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.objections.map((objection, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-4 rounded-xl border",
                      objection.handled_well
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-red-50 border-red-200"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge
                        variant={objection.handled_well ? "success" : "destructive"}
                      >
                        {objection.handled_well ? "Manejada bien" : "Mejorable"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">
                          Cliente:
                        </p>
                        <p className="text-sm text-slate-700 italic">
                          &ldquo;{objection.text}&rdquo;
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">
                          Tu respuesta:
                        </p>
                        <p className="text-sm text-slate-700">
                          &ldquo;{objection.response}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {analysis.timeline.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                Timeline de la Llamada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
                <div className="space-y-4">
                  {analysis.timeline.map((event) => (
                    <button
                      key={event.id}
                      onClick={() =>
                        setActiveTimelineEvent(
                          activeTimelineEvent === event.id ? null : event.id
                        )
                      }
                      className={cn(
                        "relative flex items-start gap-4 w-full text-left p-3 rounded-xl transition-all duration-200",
                        activeTimelineEvent === event.id
                          ? "bg-emerald-50 border border-emerald-200"
                          : "hover:bg-slate-50"
                      )}
                    >
                      <div
                        className={cn(
                          "relative z-10 flex items-center justify-center w-12 h-12 rounded-xl",
                          timelineColors[event.type] || "bg-slate-400",
                          "text-white"
                        )}
                      >
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {event.label}
                          </span>
                          {event.is_highlight && (
                            <Badge variant="warning" className="text-[10px]">
                              Importante
                            </Badge>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-sm text-slate-500 mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-mono text-slate-400 pt-1">
                        {formatDuration(event.timestamp_seconds)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-600">
                <Lightbulb className="w-5 h-5" />
                Recomendaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-emerald-600">
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-sm text-slate-600">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Target className="w-5 h-5" />
                Proximos Pasos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.next_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">
                        {i + 1}
                      </span>
                    </div>
                    <span className="text-sm text-slate-600">{step}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <Link href="/coach">
                  <Button className="w-full">
                    <MessageSquare className="w-4 h-4" />
                    Hablar con Coach IA
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {analysis.transcription && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-400" />
                Transcripcion Completa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-xl p-6 max-h-[400px] overflow-y-auto">
                <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                  {analysis.transcription}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export default AnalysisPage;
