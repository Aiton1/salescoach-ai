"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

function Header({ title, subtitle, actions }: HeaderProps) {
  const [userName, setUserName] = React.useState("Usuario");
  const supabase = createClient();

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name);
      } else if (user?.email) {
        setUserName(user.email.split("@")[0]);
      }
    };
    getUser();
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          {title && (
            <div>
              <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-slate-500">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {actions}

          <button className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
            <Search className="w-5 h-5" />
          </button>

          <button className="relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          <Avatar alt={userName} size="md" />
        </div>
      </div>
    </header>
  );
}

export { Header };
