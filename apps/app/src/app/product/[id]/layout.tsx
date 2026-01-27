"use client";

import { AgentSidebar } from "@/components/agent-sidebar";
import { use } from "react";

export default function DashboardLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}>) {
  const { id: agentId } = use(params);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <AgentSidebar agentId={agentId} />

      {children}
    </div>
  );
}
