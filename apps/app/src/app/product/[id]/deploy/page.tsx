"use client";

import { use } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ActionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: agentId } = use(params);

  return (
    <main className="flex-1 overflow-hidden">
      <ScrollArea className="h-screen">
        <div className="flex justify-center items-center h-full">
          Under construction
        </div>
      </ScrollArea>
    </main>
  );
}
