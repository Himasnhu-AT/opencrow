"use client";

import { use } from "react";
import { KnowledgeBaseCard } from "@/components/knowledge-base-card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function KnowledgePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = use(params);

  return (
    <main className="flex-1 overflow-hidden">
      <ScrollArea className="h-screen">
        <div className="p-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-neutral-900">
              Knowledge
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Add URLs and documents for your agent to reference
            </p>
          </div>

          {/* Cards */}
          <div className="space-y-6">
            <KnowledgeBaseCard productId={productId} />
          </div>
        </div>
      </ScrollArea>
    </main>
  );
}
