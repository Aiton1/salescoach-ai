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
  getProbabilityLabel,
} from "@/lib/utils";
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Target,
  Clock,
  MessageSquare,
  Zap,
  Loader2,
  Brain,
  User,
  Smile,
  Frown,
  Meh,
  Volume2,
  BarChart3,
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
  objections: { text: string; response: string; handled_well: boolean; analysis?: string }[];
  techniques_used: string[];
  recommendations: string[];
  corrections: {
    issue: string;
    evidence?: string;
    tactic: string;
    ideal_response: string;
    why_it_works: string;
  }[];
  next_steps: string[];
  timeline: {
    id: string;
    type: string;
    label: string;
    timestamp_seconds: number;
    description?: string;
    is_highlight: boolean;
    seller_action?: string;
    client_reaction?: string;
    score_impact?: number;
  }[];
  seller_behavior: { moment: string; behavior: string; impact: string; suggestion: string }[];
  client_sentiment: { moment: string; sentiment: string; indicator: string }[];
  created_at: string;
}

interface CallData {
  id: string;
  title: string;
  client_name: string;
  audio_url?: string;
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
  const [activeTab, setActiveTab] = React.useState<"overview" | "timeline" | "behavior" | "sentiment">("overview");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [expandedTimeline, setExpandedTimeline] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const [analysisData, callData] = await Promise.all([
          api.get(`/api/v1/analyses/${resolvedParams.id}`),
          api.get(`/api/v1/calls/${resolvedParams.id}`),
        ]);
        if (!cancelled) { setAnalysis(analysisData); setCall(callData); }
      } catch {
        if (!cancelled) setError("No se pudo cargar el analisis.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [resolvedParams.id]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onEnd = () => setIsPlaying(false);
    const onLoaded = () => setDuration(audio.duration);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("loadedmetadata", onLoaded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [call?.audio_url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); } else { audio.play(); }
    setIsPlaying(!isPlaying);
  };

  const seekTo = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    if (!isPlaying) { audio.play(); setIsPlaying(true); }
  };

  const sentimentIcon = (s: string) => {
    switch (s) {
      case "positive": case "excited": case "interested": return <Smile className="w-4 h-4 text-emerald-500" />;
      case "negative": case "resistant": return <Frown className="w-4 h-4 text-red-500" />;
      default: return <Meh className="w-4 h-4 text-slate-400" />;
    }
  };

  const sentimentColor = (s: string) => {
    switch (s) {
      case "positive": case "excited": return "bg-emerald-50 border-emerald-200";
      case "interested": return "bg-blue-50 border-blue-200";
      case "negative": case "resistant": return "bg-red-50 border-red-200";
      default: return "bg-slate-50 border-slate-200";
    }
  };

  const timelineColors: Record<string, string> = {
    start: "bg-slate-400", rapport: "bg-blue-400", discovery: "bg-indigo-400",
    presentation: "bg-purple-400", objection: "bg-amber-400", negotiation: "bg-orange-400",
    closing: "bg-emerald-400", positive_moment: "bg-emerald-500", error: "bg-red-400", end: "bg-slate-400",
  };

  if (loading) {
    return (<>
      <Header title="" />
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    </>);
  }

  if (error || !analysis || !call) {
    return (<>
      <Header title="" />
      <div className="p-6 max-w-[1400px] mx-auto">
        <Link href="/calls" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Volver a llamadas
        </Link>
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{error || "Analisis no encontrado"}</h3>
              <p className="text-sm text-slate-500">Esta llamada aun no tiene analisis.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>);
  }

  const score = analysis.overall_score ?? 0;
  const probability = analysis.closing_probability ?? 0;
  const tabs = [
    { key: "overview", label: "Resumen", icon: BarChart3 },
    { key: "timeline", label: "Timeline", icon: Clock },
    { key: "behavior", label: "Comportamiento", icon: User },
    { key: "sentiment", label: "Sentimiento", icon: Smile },
  ];

  return (
    <>
      <audio ref={audioRef} src={call.audio_url || undefined} preload="auto" />
      <Header
        title=""
        actions={
          <div className="flex items-center gap-2">
            {call.audio_url && (
              <Button variant="outline" size="sm" onClick={togglePlay}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? "Pausar" : "Reproducir"}
              </Button>
            )}
            <Link href={`/coach?call_id=${call.id}`}>
              <Button size="sm"><Brain className="w-4 h-4 mr-1" />Coach IA</Button>
            </Link>
          </div>
        }
      />

      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        <Link href="/calls" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a llamadas
        </Link>

        {/* Audio Player Bar */}
        {call.audio_url && (
          <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={togglePlay} className="w-10 h-10 rounded-full bg-emerald-500 text-white hover:bg-emerald-600">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </Button>
                <div className="flex-1">
                  <input type="range" min={0} max={duration || 100} value={currentTime}
                    onChange={(e) => seekTo(Number(e.target.value))}
                    className="w-full h-1.5 bg-emerald-200 rounded-full appearance-none cursor-pointer accent-emerald-500" />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>{formatDuration(Math.floor(currentTime))}</span>
                    <span>{formatDuration(Math.floor(duration || 0))}</span>
                  </div>
                </div>
                <Volume2 className="w-4 h-4 text-slate-400" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score + Summary */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardContent className="p-8 flex flex-col items-center">
              <ProgressRing value={score} size={160} strokeWidth={12} label="puntuacion" />
              <div className="mt-6 text-center">
                <h2 className="text-lg font-semibold text-slate-900">{call.title}</h2>
                <p className="text-sm text-slate-500 mt-1">{call.client_name}</p>
              </div>
              <div className="mt-6 w-full p-4 rounded-xl bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Probabilidad de cierre</span>
                  <Badge variant={probability >= 60 ? "success" : probability >= 40 ? "warning" : "destructive"}>
                    {getProbabilityLabel(probability)}
                  </Badge>
                </div>
                <span className={cn("text-3xl font-bold font-mono", getScoreColor(probability))}>{probability}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-emerald-500" />Resumen del Analisis</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 leading-relaxed">{analysis.summary}</p>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Tecnicas Identificadas</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.techniques_used.map((t) => (<Badge key={t} variant="info">{t}</Badge>))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span className="text-sm font-medium text-emerald-700">Fortalezas</span></div>
                  <p className="text-2xl font-bold text-emerald-600">{analysis.strengths.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-center gap-2 mb-1"><XCircle className="w-4 h-4 text-red-600" /><span className="text-sm font-medium text-red-700">Errores</span></div>
                  <p className="text-2xl font-bold text-red-600">{analysis.errors.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-4 h-4 text-amber-600" /><span className="text-sm font-medium text-amber-700">Objeciones</span></div>
                  <p className="text-2xl font-bold text-amber-600">{analysis.objections.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center",
                activeTab === tab.key ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {analysis.strengths.length > 0 && (
              <Card><CardHeader><CardTitle className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-5 h-5" />Fortalezas</CardTitle></CardHeader>
                <CardContent><ul className="space-y-3">{analysis.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3"><div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 flex-shrink-0 mt-0.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /></div><span className="text-sm text-slate-600">{s}</span></li>
                ))}</ul></CardContent>
              </Card>
            )}
            {analysis.errors.length > 0 && (
              <Card><CardHeader><CardTitle className="flex items-center gap-2 text-red-600"><XCircle className="w-5 h-5" />Errores Detectados</CardTitle></CardHeader>
                <CardContent><ul className="space-y-3">{analysis.errors.map((e, i) => (
                  <li key={i} className="flex items-start gap-3"><div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 flex-shrink-0 mt-0.5"><XCircle className="w-3.5 h-3.5 text-red-600" /></div><span className="text-sm text-slate-600">{e}</span></li>
                ))}</ul></CardContent>
              </Card>
            )}
            {analysis.objections.length > 0 && (
              <Card><CardHeader><CardTitle className="flex items-center gap-2 text-amber-600"><AlertTriangle className="w-5 h-5" />Objeciones Detectadas</CardTitle></CardHeader>
                <CardContent><div className="space-y-4">{analysis.objections.map((o, i) => (
                  <div key={i} className={cn("p-4 rounded-xl border", o.handled_well ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200")}>
                    <div className="flex items-center gap-2 mb-2"><Badge variant={o.handled_well ? "success" : "destructive"}>{o.handled_well ? "Manejada bien" : "Mejorable"}</Badge></div>
                    <p className="text-sm text-slate-700 italic mb-1">&ldquo;{o.text}&rdquo;</p>
                    <p className="text-sm text-slate-600 mb-2">Respuesta: &ldquo;{o.response}&rdquo;</p>
                    {o.analysis && <p className="text-xs text-slate-500 bg-white/50 p-2 rounded-lg">{o.analysis}</p>}
                  </div>
                ))}</div></CardContent>
              </Card>
            )}
            {analysis.corrections.length > 0 && (
              <Card className="border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <Zap className="w-5 h-5" />
                    Como Mejorarlo en la Próxima Llamada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysis.corrections.map((correction, i) => (
                      <div key={i} className="rounded-xl border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50">
                          <div className="flex items-start gap-3">
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 flex-shrink-0">
                              {i + 1}
                            </span>
                            <div>
                              <h4 className="font-semibold text-slate-900">{correction.issue}</h4>
                              {correction.evidence && (
                                <p className="text-sm text-slate-500 mt-1 italic">&ldquo;{correction.evidence}&rdquo;</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1">Táctica</p>
                            <p className="text-sm text-slate-700">{correction.tactic}</p>
                          </div>
                          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1">Respuesta de un vendedor excelente</p>
                            <p className="text-sm text-emerald-950 leading-relaxed">&ldquo;{correction.ideal_response}&rdquo;</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Por qué funciona</p>
                            <p className="text-sm text-slate-600">{correction.why_it_works}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            <div className="grid grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle className="flex items-center gap-2 text-emerald-600"><Lightbulb className="w-5 h-5" />Recomendaciones</CardTitle></CardHeader>
                <CardContent><ul className="space-y-3">{analysis.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-3"><div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 flex-shrink-0 mt-0.5"><span className="text-xs font-bold text-emerald-600">{i + 1}</span></div><span className="text-sm text-slate-600">{r}</span></li>
                ))}</ul></CardContent>
              </Card>
              <Card><CardHeader><CardTitle className="flex items-center gap-2 text-blue-600"><Target className="w-5 h-5" />Proximos Pasos</CardTitle></CardHeader>
                <CardContent><ul className="space-y-3">{analysis.next_steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3"><div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 flex-shrink-0 mt-0.5"><span className="text-xs font-bold text-blue-600">{i + 1}</span></div><span className="text-sm text-slate-600">{s}</span></li>
                ))}</ul>
                <div className="mt-4"><Link href={`/coach?call_id=${call.id}`}><Button className="w-full"><Brain className="w-4 h-4 mr-1" />Hablar con Coach IA</Button></Link></div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === "timeline" && analysis.timeline.length > 0 && (
          <Card><CardContent className="p-6">
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-3">
                {analysis.timeline.map((event) => (
                  <div key={event.id} className="relative">
                    <button onClick={() => { setExpandedTimeline(expandedTimeline === event.id ? null : event.id); if (event.timestamp_seconds) seekTo(event.timestamp_seconds); }}
                      className={cn("relative flex items-start gap-4 w-full text-left p-3 rounded-xl transition-all duration-200",
                        expandedTimeline === event.id ? "bg-emerald-50 border border-emerald-200" : "hover:bg-slate-50")}>
                      <div className={cn("relative z-10 flex items-center justify-center w-12 h-12 rounded-xl text-white", timelineColors[event.type] || "bg-slate-400")}>
                        {event.timestamp_seconds ? <Clock className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{event.label}</span>
                          {event.is_highlight && <Badge variant="warning" className="text-[10px]">Importante</Badge>}
                          {event.score_impact !== undefined && event.score_impact !== 0 && (
                            <span className={cn("text-xs font-mono font-bold", event.score_impact > 0 ? "text-emerald-600" : "text-red-600")}>
                              {event.score_impact > 0 ? "+" : ""}{event.score_impact}
                            </span>
                          )}
                        </div>
                        {event.description && <p className="text-sm text-slate-500 mt-1">{event.description}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-mono text-slate-400">{formatDuration(event.timestamp_seconds)}</span>
                        {event.timestamp_seconds > 0 && <Volume2 className="w-3 h-3 text-slate-300 ml-1 inline" />}
                      </div>
                    </button>
                    {expandedTimeline === event.id && (
                      <div className="ml-16 mt-1 p-3 bg-white rounded-lg border border-slate-100 space-y-2">
                        {event.seller_action && <div><span className="text-xs font-medium text-slate-500">Vendedor:</span><p className="text-sm text-slate-700">{event.seller_action}</p></div>}
                        {event.client_reaction && <div><span className="text-xs font-medium text-slate-500">Cliente:</span><p className="text-sm text-slate-700">{event.client_reaction}</p></div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent></Card>
        )}

        {/* Behavior Tab */}
        {activeTab === "behavior" && analysis.seller_behavior.length > 0 && (
          <div className="space-y-4">
            {analysis.seller_behavior.map((b, i) => (
              <Card key={i}><CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100 flex-shrink-0">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div><span className="text-xs font-medium text-slate-500 uppercase">Momento:</span><p className="text-sm font-medium text-slate-900">{b.moment}</p></div>
                    <div><span className="text-xs font-medium text-slate-500 uppercase">Comportamiento:</span><p className="text-sm text-slate-700">{b.behavior}</p></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 rounded-lg bg-slate-50"><span className="text-xs font-medium text-slate-500">Impacto:</span><p className="text-xs text-slate-600">{b.impact}</p></div>
                      <div className="p-2 rounded-lg bg-emerald-50"><span className="text-xs font-medium text-emerald-600">Sugerencia:</span><p className="text-xs text-emerald-700">{b.suggestion}</p></div>
                    </div>
                  </div>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}

        {/* Sentiment Tab */}
        {activeTab === "sentiment" && analysis.client_sentiment.length > 0 && (
          <Card><CardContent className="p-6">
            <div className="space-y-3">
              {analysis.client_sentiment.map((s, i) => (
                <div key={i} className={cn("flex items-start gap-3 p-3 rounded-xl border", sentimentColor(s.sentiment))}>
                  {sentimentIcon(s.sentiment)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{s.moment}</span>
                      <Badge variant={s.sentiment === "positive" || s.sentiment === "excited" ? "success" : s.sentiment === "interested" ? "info" : s.sentiment === "negative" || s.sentiment === "resistant" ? "destructive" : "secondary"}>
                        {s.sentiment}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{s.indicator}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent></Card>
        )}

        {/* Transcription */}
        {analysis.transcription && (
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-slate-400" />Transcripcion</CardTitle></CardHeader>
            <CardContent><div className="bg-slate-50 rounded-xl p-6 max-h-[400px] overflow-y-auto">
              <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">{analysis.transcription}</pre>
            </div></CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export default AnalysisPage;
