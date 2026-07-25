"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <main
        className="transition-all duration-300"
        style={{ marginLeft: collapsed ? 72 : 260 }}
      >
        {children}
      </main>
    </div>
  );
}

export { DashboardLayout };
