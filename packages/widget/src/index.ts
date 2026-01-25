import React from 'react';
import ReactDOM from 'react-dom/client';
import Widget from './Widget';

// Auto-initialize from script tag
(function () {
    // Check if we are in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const initWidget = () => {
        // Find the script tag that loaded this bundle
        // Try currentScript first, then fall back to searching by src
        let script: HTMLScriptElement | null = document.currentScript as HTMLScriptElement;

        if (!script) {
            // Search for the script by src attribute containing our widget name
            const scripts = document.querySelectorAll('script[src*="ai-agent-widget"]');
            if (scripts.length > 0) {
                script = scripts[scripts.length - 1] as HTMLScriptElement;
            }
        }

        const productId = script?.getAttribute('data-product-id');
        const apiUrl = script?.getAttribute('data-api-url') || 'http://localhost:3001';
        const position = (script?.getAttribute('data-position') as 'bottom-right' | 'bottom-left') || 'bottom-right';

        // Get user token from window or localStorage
        const userToken = (window as any).AI_AGENT_USER_TOKEN ||
            localStorage.getItem('ai_agent_token');

        // Create container
        let container = document.getElementById('ai-agent-widget-root');
        if (!container) {
            container = document.createElement('div');
            container.id = 'ai-agent-widget-root';
            document.body.appendChild(container);
        }

        // Render widget
        const root = ReactDOM.createRoot(container);
        root.render(
            React.createElement(Widget, {
                productId: productId || 'demo-shop',
                apiUrl,
                userToken,
                position
            })
        );
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }
})();

// Also export for manual initialization
export { Widget as default };

