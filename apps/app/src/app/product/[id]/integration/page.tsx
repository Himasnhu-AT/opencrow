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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium mb-2">Client-Side Tools</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Define JavaScript functions that can be executed on the user's
                  browser.
                </p>
                <a
                  href={`/product/${productId}/integration/clientSide`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                >
                  Manage Client Tools
                </a>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </main>
  );
}
