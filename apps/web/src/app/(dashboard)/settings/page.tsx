"use client";

import * as React from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { User, Bell, Shield, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("profile");
  const [user, setUser] = React.useState<any>(null);
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const supabase = createClient();

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFullName(user.user_metadata?.full_name || "");
        setEmail(user.email || "");
      }
    };
    getUser();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Guardado correctamente");
    }
    setSaving(false);
  };

  const tabs = [
    { id: "profile", label: "Perfil", icon: User },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "security", label: "Seguridad", icon: Shield },
    { id: "appearance", label: "Apariencia", icon: Palette },
  ];

  return (
    <>
      <Header title="Configuración" subtitle="Personaliza tu cuenta" />

      <div className="p-6 max-w-[1200px] mx-auto">
        <div className="flex gap-6">
          {/* Sidebar Tabs */}
          <Card className="w-56 flex-shrink-0">
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Perfil Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-600 text-2xl font-bold">
                      {fullName ? fullName[0].toUpperCase() : "?"}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{fullName || "Sin nombre"}</p>
                      <p className="text-sm text-slate-500">{email}</p>
                      <Badge variant="default" className="mt-2">
                        {user?.role || "seller"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Nombre completo
                      </label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <Input value={email} disabled />
                      <p className="text-xs text-slate-400">
                        El email se gestiona desde Supabase
                      </p>
                    </div>
                  </div>

                  {message && (
                    <p className={cn(
                      "text-sm",
                      message.startsWith("Error") ? "text-red-600" : "text-emerald-600"
                    )}>
                      {message}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notificaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500">
                    Próximamente podrás configurar tus notificaciones.
                  </p>
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>Seguridad</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500">
                    La contraseña se gestiona desde Supabase Auth.
                  </p>
                </CardContent>
              </Card>
            )}

            {activeTab === "appearance" && (
              <Card>
                <CardHeader>
                  <CardTitle>Apariencia</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500">
                    Próximamente: modo oscuro y personalización de temas.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingsPage;
