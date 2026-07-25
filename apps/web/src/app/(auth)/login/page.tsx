"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm text-white">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">SalesCoach</span>
              <span className="text-xs text-emerald-200 ml-2 font-medium">AI</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Convierte cada llamada
            <br />
            en una oportunidad
          </h1>
          <p className="text-lg text-emerald-100 max-w-md">
            Analiza tus llamadas de ventas con IA, recibe recomendaciones
            personalizadas y mejora tu rendimiento día a día.
          </p>

          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">95%</p>
              <p className="text-sm text-emerald-200">Precisión en análisis</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">+32%</p>
              <p className="text-sm text-emerald-200">Mejora en cierres</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">5min</p>
              <p className="text-sm text-emerald-200">Por llamada analizada</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-emerald-200">
            © 2024 SalesCoach AI. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="lg:hidden flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500 text-white">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900">SalesCoach AI</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Bienvenido de nuevo
            </h2>
            <p className="text-slate-500 mt-2">
              Inicia sesión para acceder a tu coach de ventas
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <Link
                  href="#"
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/register"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
