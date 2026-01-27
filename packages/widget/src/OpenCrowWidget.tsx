import React, { useState, useRef, useEffect } from 'react';
import './styles.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    functionsCalled?: string[];
}

export interface OpenCrowWidgetProps {
    productId: string;
    apiKey?: string;
    apiUrl?: string;
    agentName?: string;
    position?: 'bottom-right' | 'bottom-left';
}

export function OpenCrowWidget({
    productId,
    apiKey,
    apiUrl = 'http://localhost:3001',
    agentName = 'AI Assistant',
    position = 'bottom-right'
}: OpenCrowWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [sessionId] = useState(() => Math.random().toString(36).substring(7));
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: `Hi! I'm ${agentName}. How can I help you today?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (apiKey) {
                headers['X-API-Key'] = apiKey;
            }

            const response = await fetch(`${apiUrl}/api/chat`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    message: userMessage,
                    productId,
                    sessionId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.response,
                functionsCalled: data.functionsCalled
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, something went wrong. Please try again.'
            }]);
        } finally {
            setLoading(false);
        }
    };

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
                    <div className="ai-chat-interface">
                        {/* Header */}
                        <div className="ai-chat-header">
                            <h3>{agentName}</h3>
                            <button onClick={() => setIsOpen(false)} aria-label="Close">×</button>
                        </div>

                        {/* Messages */}
                        <div className="ai-chat-messages">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`ai-message ai-message-${msg.role}`}>
                                    <div className="ai-message-content">{msg.content}</div>
                                    {msg.functionsCalled && msg.functionsCalled.length > 0 && (
                                        <div className="ai-functions-called">
                                            🔧 Called: {msg.functionsCalled.join(', ')}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="ai-message ai-message-assistant">
                                    <div className="ai-typing-indicator">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={sendMessage} className="ai-chat-input">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                disabled={loading}
                            />
                            <button type="submit" disabled={loading || !input.trim()}>
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OpenCrowWidget;
