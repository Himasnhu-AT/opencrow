"use client";

import { use } from "react";
import { ApiToolsCard } from "@/components/api-tools-card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function IntegrationPage({
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
              Integration
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Configure your OpenAPI specification and API authentication
            </p>
          </div>

          {/* Cards */}
          <div className="space-y-6">
            <ApiToolsCard productId={productId} />
          </div>
        </div>
      </ScrollArea>
    </main>
  );
}
