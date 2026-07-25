"use client";

import * as React from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Play, Clock, Star, Zap } from "lucide-react";

function TrainingPage() {
  return (
    <>
      <Header title="Entrenamiento" subtitle="Practica con escenarios reales" />

      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100">
                  <Play className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">0</p>
                  <p className="text-sm text-slate-500">Prácticas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100">
                  <Clock className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">0h</p>
                  <p className="text-sm text-slate-500">Tiempo total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100">
                  <Star className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">--</p>
                  <p className="text-sm text-slate-500">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100">
                  <Zap className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">--</p>
                  <p className="text-sm text-slate-500">Mejora</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-100 mb-4">
                <Target className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Entrenamiento próximamente
              </h3>
              <p className="text-sm text-slate-500 max-w-md">
                Estamos preparando escenarios de práctica con roleplays
                interactivos. Podrás practicar manejo de objeciones, cierre de
                ventas y más.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default TrainingPage;
