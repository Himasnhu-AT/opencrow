import React, { useState, useRef, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import './styles.css';

interface WidgetProps {
    productId: string;
    apiUrl: string;
    userToken?: string;
    apiKey?: string;
    position?: 'bottom-right' | 'bottom-left';
}

export default function Widget({
    productId,
    apiUrl,
    userToken,
    apiKey,
    position = 'bottom-right'
}: WidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [sessionId] = useState(() => Math.random().toString(36).substring(7));

    return (
        <div className={`ai-agent-widget ${position}`}>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="ai-agent-trigger"
                aria-label="Open chat"
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                            stroke="currentColor" strokeWidth="2" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="ai-agent-container">
                    <ChatInterface
                        productId={productId}
                        apiUrl={apiUrl}
                        sessionId={sessionId}
                        userToken={userToken}
                        apiKey={apiKey}
                        onClose={() => setIsOpen(false)}
                    />
                </div>
            )}
        </div>
    );
}
