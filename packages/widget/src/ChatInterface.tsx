import React, { useState, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    functionsCalled?: string[];
}

interface ChatInterfaceProps {
    productId: string;
    apiUrl: string;
    sessionId: string;
    userToken?: string;
    apiKey?: string;
    onClose: () => void;
}

export default function ChatInterface({
    productId,
    apiUrl,
    sessionId,
    userToken,
    apiKey,
    onClose
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! How can I help you today?' }
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
            // Build headers - prefer apiKey for external widget, userToken for admin
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (apiKey) {
                headers['X-API-Key'] = apiKey;
            } else if (userToken) {
                headers['Authorization'] = `Bearer ${userToken}`;
            }

            const response = await fetch(`${apiUrl}/api/chat`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    message: userMessage,
                    productId,
                    sessionId,
                    userToken
                })
            });

            const data = await response.json();

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
        <div className="ai-chat-interface">
            {/* Header */}
            <div className="ai-chat-header">
                <h3>AI Assistant</h3>
                <button onClick={onClose} aria-label="Close">×</button>
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
    );
}
