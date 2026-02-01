"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Play, BookOpen, Plug, Activity, Rocket } from "lucide-react";

interface SidebarItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface AgentSidebarProps {
  agentId: string;
}

export function AgentSidebar({ agentId }: AgentSidebarProps) {
  const pathname = usePathname();

  const items: SidebarItem[] = [
    { name: "Settings", icon: Plug, href: `/product/${agentId}` },
    { name: "Sandbox", icon: Play, href: `/product/${agentId}/sandbox` },
    {
      name: "Knowledge Base",
      icon: BookOpen,
      href: `/product/${agentId}/knowledge`,
    },
    {
      name: "Integration",
      icon: Plug,
      href: `/product/${agentId}/integration`,
    },
    { name: "Activity", icon: Activity, href: `/product/${agentId}/activity` },
    { name: "Deploy", icon: Rocket, href: `/product/${agentId}/deploy` },
  ];

  return (
    <aside className="w-56 border-r border-neutral-200 bg-neutral-50/50 min-h-screen">
      <div className="p-4 border-b border-neutral-200">
        <h2 className="font-semibold text-neutral-900">Agent Config</h2>
        <p className="text-xs text-neutral-500 truncate mt-0.5">{agentId}</p>
      </div>
      <nav className="p-2 flex flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          // Check if current path matches the item href
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
