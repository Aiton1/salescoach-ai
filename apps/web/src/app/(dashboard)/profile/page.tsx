"use client";

import * as React from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/ui/progress-ring";
import Link from "next/link";
import {
  Target,
  Calendar,
  BarChart3,
  Upload,
  ArrowRight,
} from "lucide-react";

function ProfilePage() {
  return (
    <>
      <Header title="Mi Perfil" subtitle="Tu progreso y habilidades" />

      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        {/* Profile Header - Minimal */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-600 text-2xl font-bold">
                ?
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  Tu perfil
                </h2>
                <p className="text-slate-500">Las habilidades se calcularán automáticamente</p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="default">
                    <Target className="w-3.5 h-3.5 mr-1" />
                    Vendedor
                  </Badge>
                  <span className="text-sm text-slate-500">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Nuevo miembro
                  </span>
                </div>
              </div>
              <div className="text-center">
                <ProgressRing
                  value={0}
                  size={120}
                  strokeWidth={10}
                  label="score"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-100 mb-4">
                <BarChart3 className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Sin análisis aún
              </h3>
              <p className="text-sm text-slate-500 max-w-md mb-6">
                Tus habilidades de ventas se evaluarán automáticamente a medida
                que vayas analizando llamadas. La IA detectará tus fortalezas y
                áreas de mejora.
              </p>
              <Link href="/calls">
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Analizar primera llamada
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default ProfilePage;
