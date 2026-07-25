"use client";

import * as React from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Upload,
  Phone,
  Search,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileAudio,
  Clock,
  Eye,
  Mic,
  Brain,
  FileText,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface Call {
  id: string;
  title: string;
  client_name: string;
  status: string;
  progress?: number;
  progress_text?: string;
  created_at: string;
  duration_seconds?: number;
}

const processingStages = [
  { key: "uploading", label: "Subiendo audio", icon: Upload, color: "text-blue-500" },
  { key: "transcribing", label: "Transcribiendo con Whisper", icon: Mic, color: "text-purple-500" },
  { key: "analyzing", label: "Analizando con IA", icon: Brain, color: "text-emerald-500" },
];

function CallsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [calls, setCalls] = React.useState<Call[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const [processingCallId, setProcessingCallId] = React.useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = React.useState<Call | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    try {
      const data = await api.get("/api/v1/calls");
      setCalls(data);
    } catch {
      // Backend not running
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ["audio/mpeg", "audio/wav", "audio/mp3", "audio/x-m4a", "audio/mp4"];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
      setError("Formato no soportado. Usa MP3, WAV o M4A.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("El archivo es muy grande. Maximo 100MB.");
      return;
    }
    setError("");
    setSelectedFile(file);
  };

  const pollCallStatus = async (callId: string) => {
    const maxAttempts = 120;
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setProcessingCallId(null);
        setProcessingStatus(null);
        loadCalls();
        return;
      }
      attempts++;

      try {
        const call: Call = await api.get(`/api/v1/calls/${callId}`);
        setProcessingStatus(call);

        if (call.status === "completed") {
          setProcessingCallId(null);
          setProcessingStatus(null);
          loadCalls();
          window.location.href = `/analysis/${call.id}`;
          return;
        }

        if (call.status === "error") {
          setError(call.progress_text || "Error al procesar la llamada");
          setProcessingCallId(null);
          setProcessingStatus(null);
          loadCalls();
          return;
        }

        setTimeout(poll, 2000);
      } catch {
        setTimeout(poll, 3000);
      }
    };

    poll();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      const formData = new FormData();
      formData.append("audio", selectedFile);
      if (clientName) formData.append("client_name", clientName);

      const newCall = await api.upload("/api/v1/calls/upload", formData);

      setSelectedFile(null);
      setClientName("");
      setUploading(false);
      setUploadProgress(0);

      setProcessingCallId(newCall.id);
      setProcessingStatus(newCall);
      loadCalls();

      pollCallStatus(newCall.id);
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setError("El backend no esta disponible. Verifica la configuracion.");
      } else {
        setError(err.message);
      }
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setClientName("");
    setError("");
    setUploadProgress(0);
  };

  const filteredCalls = calls.filter((call) =>
    call.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    call.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "processing":
      case "uploading":
      case "transcribing":
      case "analyzing":
        return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Completada";
      case "processing": return "Procesando";
      case "uploading": return "Subiendo";
      case "transcribing": return "Transcribiendo";
      case "analyzing": return "Analizando";
      case "error": return "Error";
      default: return status;
    }
  };

  return (
    <>
      <Header title="Llamadas" subtitle="Gestiona y analiza tus llamadas" />

      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        {/* Processing Overlay */}
        {processingCallId && processingStatus && (
          <Card className="border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500">
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Procesando llamada</h3>
                    <p className="text-sm text-slate-500">
                      {processingStatus.title}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="h-3 bg-white rounded-full overflow-hidden border border-emerald-100">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${processingStatus.progress || 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-emerald-700">
                      {processingStatus.progress_text || "Procesando..."}
                    </p>
                    <span className="text-sm font-mono text-emerald-600">
                      {processingStatus.progress || 0}%
                    </span>
                  </div>
                </div>

                {/* Stages */}
                <div className="flex items-center gap-2">
                  {processingStages.map((stage, i) => {
                    const isCurrentOrPast =
                      processingStages.findIndex(
                        (s) => s.key === processingStatus.status
                      ) >= i;
                    const isCurrent = stage.key === processingStatus.status;

                    return (
                      <React.Fragment key={stage.key}>
                        <div
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300",
                            isCurrent
                              ? "bg-white border border-emerald-200 text-emerald-700 shadow-sm"
                              : isCurrentOrPast
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-white/50 text-slate-400"
                          )}
                        >
                          {isCurrent ? (
                            <Loader2 className={cn("w-3.5 h-3.5 animate-spin", stage.color)} />
                          ) : isCurrentOrPast ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <stage.icon className="w-3.5 h-3.5" />
                          )}
                          {stage.label}
                        </div>
                        {i < processingStages.length - 1 && (
                          <div
                            className={cn(
                              "w-6 h-0.5 rounded",
                              isCurrentOrPast ? "bg-emerald-300" : "bg-slate-200"
                            )}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Area */}
        {!processingCallId && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200",
              dragActive
                ? "border-emerald-400 bg-emerald-50"
                : selectedFile
                ? "border-emerald-300 bg-emerald-50/50"
                : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 cursor-pointer"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a,.ogg,audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <FileAudio className="w-12 h-12 text-emerald-500" />
                  <div className="text-left">
                    <p className="font-medium text-slate-900">{selectedFile.name}</p>
                    <p className="text-sm text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); cancelUpload(); }}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="max-w-md mx-auto space-y-3">
                  <Input
                    placeholder="Nombre del cliente (opcional)"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                      disabled={uploading}
                      size="lg"
                    >
                      {uploading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Subiendo...</>
                      ) : (
                        <><Upload className="w-4 h-4 mr-2" />Subir y analizar</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => { e.stopPropagation(); cancelUpload(); }}
                      disabled={uploading}
                      size="lg"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-100">
                  <Upload className="w-10 h-10 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Arrastra tu archivo de audio aqui
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    o haz clic para seleccionar · MP3, WAV, M4A · Maximo 100MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por cliente o titulo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Calls List */}
        {filteredCalls.length > 0 ? (
          <div className="space-y-3">
            {filteredCalls.map((call) => (
              <Card key={call.id} className="hover:border-emerald-200 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100">
                      {statusIcon(call.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 truncate">
                          {call.title || "Llamada sin titulo"}
                        </p>
                        <Badge variant={
                          call.status === "completed" ? "success" :
                          call.status === "processing" || call.status === "uploading" || call.status === "transcribing" || call.status === "analyzing" ? "warning" :
                          "secondary"
                        }>
                          {statusLabel(call.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        {call.client_name || "Sin cliente"} · {new Date(call.created_at).toLocaleDateString("es-ES")}
                      </p>
                      {call.progress_text && call.status !== "completed" && call.status !== "error" && (
                        <p className="text-xs text-emerald-600 mt-1">{call.progress_text}</p>
                      )}
                    </div>
                    {call.status === "completed" && (
                      <Link href={`/analysis/${call.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver analisis
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-100 mb-4">
                  <Phone className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {searchQuery ? "No se encontraron resultados" : "No hay llamadas aun"}
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  {searchQuery
                    ? "Intenta con otro termino de busqueda"
                    : "Sube tu primer audio y la IA lo analizara automaticamente."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export default CallsPage;
