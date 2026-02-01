"use client";

import { use, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

export default function SandboxPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = use(params);

  useEffect(() => {
    // Dynamically load the widget script
    const script = document.createElement("script");
    // Assuming the widget is served from :5173 in dev (Vite default)
    // In prod this mimics the "deploy" setup.
    // Adjust logic if widget is served differently.
    const widgetUrl =
      API_BASE_URL.replace(":3001", ":5173") + "/ai-agent-widget.umd.js";
    script.src = widgetUrl;
    script.dataset.productId = productId;
    script.dataset.apiUrl = API_BASE_URL;
    script.async = true;

    document.body.appendChild(script);

    return () => {
      // Cleanup script and widget instance if feasible
      // The widget might append elements to body, which might require manual cleanup
      document.body.removeChild(script);
      const widgetRoot = document.getElementById("opencrow-widget-root");
      if (widgetRoot) {
        widgetRoot.remove();
      }
    };
  }, [productId]);

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
      <div className="max-w-3xl mx-auto text-center mt-20">
        <h1 className="text-3xl font-bold mb-4">Sandbox Environment</h1>
        <p className="text-gray-600 mb-8">
          The widget should appear in the bottom right corner.
          <br /> Use this page to test your agent configuration safely.
        </p>

        <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl bg-white/50">
          <p className="text-sm text-gray-400">
            (Simulated Client Website Content)
          </p>
        </div>
      </div>
    </div>
  );
}
