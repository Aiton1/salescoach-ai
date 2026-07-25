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
  Trash2,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface Call {
  id: string;
  title: string;
  client_name: string;
  status: string;
  created_at: string;
  duration_seconds?: number;
}

function CallsPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [calls, setCalls] = React.useState<Call[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState("");
  const [clientName, setClientName] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    try {
      const data = await api.get("/api/v1/calls");
      setCalls(data);
    } catch {
      // Backend not running - show empty
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
      setError("El archivo es muy grande. Máximo 100MB.");
      return;
    }
    setError("");
    setSelectedFile(file);
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

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const newCall = await api.upload("/api/v1/calls/upload", formData);

      clearInterval(progressInterval);
      setCalls((prev) => [newCall, ...prev]);
      setSelectedFile(null);
      setClientName("");
      setUploadProgress(100);

      if (newCall.status === "completed") {
        window.location.href = `/analysis/${newCall.id}`;
      } else {
        setTimeout(() => setUploadProgress(0), 1000);
      }
    } catch (err: any) {
      if (err.message === "Failed to fetch") {
        setError("El backend no está disponible. Verifica la configuración.");
      } else {
        setError(err.message);
      }
    }

    setUploading(false);
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
        return <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <>
      <Header title="Llamadas" subtitle="Gestiona y analiza tus llamadas" />

      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        {/* Upload Area */}
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

                {uploadProgress > 0 && (
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                    disabled={uploading}
                    size="lg"
                  >
                    {uploading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Procesando...</>
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
                  Arrastra tu archivo de audio aquí
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  o haz clic para seleccionar · MP3, WAV, M4A · Máximo 100MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por cliente o título..."
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
                          {call.title || "Llamada sin título"}
                        </p>
                        <Badge variant={call.status === "completed" ? "success" : call.status === "processing" ? "warning" : "secondary"}>
                          {call.status === "completed" ? "Completada" : call.status === "processing" ? "Procesando" : call.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        {call.client_name || "Sin cliente"} · {new Date(call.created_at).toLocaleDateString("es-ES")}
                      </p>
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
                  {searchQuery ? "No se encontraron resultados" : "No hay llamadas aún"}
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                  {searchQuery
                    ? "Intenta con otro término de búsqueda"
                    : "Sube tu primer audio y la IA lo analizará automáticamente."}
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
