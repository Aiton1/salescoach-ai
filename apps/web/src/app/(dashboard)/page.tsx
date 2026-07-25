"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Phone,
  Brain,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  ArrowRight,
} from "lucide-react";

function DashboardPage() {
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

        {/* Stats - Empty State */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Llamadas analizadas</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">0</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100">
                  <Phone className="w-6 h-6 text-slate-400" />
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-3">
                Sube tu primera llamada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Calidad promedio</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">--</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100">
                  <Brain className="w-6 h-6 text-slate-400" />
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-3">
                Se calcula tras analizar llamadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Mejora</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">--</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100">
                  <TrendingUp className="w-6 h-6 text-slate-400" />
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-3">
                Compara tu progreso semanal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Habilidades</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">--</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100">
                  <Target className="w-6 h-6 text-slate-400" />
                </div>
              </div>
              <p className="text-sm text-slate-400 mt-3">
                Se evalúan con cada análisis
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="hover:border-emerald-200 transition-colors cursor-pointer">
            <Link href="/calls">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-100">
                    <Upload className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Subir llamada
                    </h3>
                    <p className="text-sm text-slate-500">
                      Arrastra un audio para analizar
                    </p>
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
                    <h3 className="font-semibold text-slate-900">
                      Hablar con Coach IA
                    </h3>
                    <p className="text-sm text-slate-500">
                      Preguntas sobre ventas
                    </p>
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
                    <h3 className="font-semibold text-slate-900">
                      Practicar
                    </h3>
                    <p className="text-sm text-slate-500">
                      Roleplays y escenarios
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Empty State - Recent Calls */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Llamadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                <Phone className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-medium text-slate-900 mb-1">
                No hay llamadas aún
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mb-4">
                Sube tu primera llamada de ventas y la IA la analizará
                automáticamente para darte recomendaciones.
              </p>
              <Link href="/calls">
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Subir primera llamada
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default DashboardPage;
