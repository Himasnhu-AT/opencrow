// Standalone entry point for script tag usage
import React from "react";
import ReactDOM from "react-dom/client";
import { OpenCrowWidget } from "./OpenCrowWidget";

// Auto-initialize from script tag or window config
(function () {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const initWidget = () => {
    const windowConfig = (window as any).OPENCROW_CONFIG || {};

    let script: HTMLScriptElement | null =
      document.currentScript as HTMLScriptElement;

    if (!script) {
      const scripts = document.querySelectorAll(
        'script[type="module"][src*="5173"], script[type="module"][src*="index.ts"], script[src*="ai-agent-widget"]',
      );
      if (scripts.length > 0) {
        script = scripts[scripts.length - 1] as HTMLScriptElement;
      }
    }

    const productId =
      windowConfig.productId ||
      script?.getAttribute("data-product-id") ||
      "demo-shop";
    const apiUrl =
      windowConfig.apiUrl ||
      script?.getAttribute("data-api-url") ||
      "http://localhost:3001";
    const apiKey =
      windowConfig.apiKey ||
      script?.getAttribute("data-api-key") ||
      (window as any).OPENCROW_API_KEY;
    const agentName =
      windowConfig.agentName ||
      script?.getAttribute("data-agent-name") ||
      "AI Assistant";
    const position = (windowConfig.position ||
      script?.getAttribute("data-position") ||
      "bottom-right") as "bottom-right" | "bottom-left";

    console.log("[OpenCrow] Initializing widget...", {
      productId,
      apiUrl,
      hasApiKey: !!apiKey,
    });

    let container = document.getElementById("opencrow-widget-root");
    if (!container) {
      container = document.createElement("div");
      container.id = "opencrow-widget-root";
      document.body.appendChild(container);
    }

    const root = ReactDOM.createRoot(container);
    root.render(
      React.createElement(OpenCrowWidget, {
        productId,
        apiKey,
        apiUrl,
        agentName,
        position,
      }),
    );

    console.log("[OpenCrow] Widget mounted");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }
})();
