import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface ToolCall {
  name: string;
  args: any;
  response: any;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  functionsCalled?: ToolCall[] | string[];
}

interface ChatInterfaceProps {
  productId: string;
  apiUrl: string;
  sessionId: string;
  userToken?: string;
  apiKey?: string;
  onClose: () => void;
  tools?: Record<string, (args: any) => Promise<any> | any>;
}

export default function ChatInterface({
  productId,
  apiUrl,
  sessionId,
  userToken,
  apiKey,
  onClose,
  tools,
  useCookies,
}: ChatInterfaceProps & { useCookies?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      // Build headers - prefer apiKey for external widget, userToken for admin
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers["X-API-Key"] = apiKey;
      } else if (userToken) {
        headers["Authorization"] = `Bearer ${userToken}`;
      }

      const fetchOptions: RequestInit = {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: userMessage,
          productId,
          sessionId,
          userToken,
        }),
      };

      if (useCookies) {
        fetchOptions.credentials = "include";
      }

      const response = await fetch(`${apiUrl}/api/chat`, fetchOptions);

      const data = await response.json();

      // Check for client-side tool calls
      if (data.functionsCalled && data.functionsCalled.length > 0) {
        // Execute client-side tools if available
        if (tools) {
          for (const fn of data.functionsCalled) {
            const toolName = typeof fn === "string" ? fn : fn.name;
            const toolArgs = typeof fn === "string" ? {} : fn.args;

            if (tools[toolName]) {
              console.log(`Executing client-side tool: ${toolName}`, toolArgs);
              try {
                const result = await tools[toolName](toolArgs);
                console.log(`Tool result:`, result);
                // TODO: Send result back to backend if needed
              } catch (e) {
                console.error(`Error executing tool ${toolName}:`, e);
              }
            }
          }
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant", // Backend returns 'assistant' role for bot responses
          content: data.response || "I've processed your request.", // Fallback if empty response due to tool call
          functionsCalled: data.functionsCalled,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant", // Backend returns 'assistant' role for bot responses
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chat-interface">
      {/* Header */}
      <div className="ai-chat-header">
        <h3>AI Assistant</h3>
        <button onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="ai-chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`ai-message ai-message-${msg.role}`}>
            <div className="ai-message-content ai-markdown">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            {msg.functionsCalled && msg.functionsCalled.length > 0 && (
              <div className="ai-functions-called">
                {msg.functionsCalled.map((fn: any, i) => {
                  const name = typeof fn === "string" ? fn : fn.name;
                  const args = typeof fn === "string" ? null : fn.args;
                  const response = typeof fn === "string" ? null : fn.response;

                  if (!args) {
                    return (
                      <div key={i} className="ai-tool-simple">
                        🔧 {name}
                      </div>
                    );
                  }

                  return (
                    <details key={i} className="ai-tool-details">
                      <summary>🔧 {name} (Debug)</summary>
                      <div className="ai-tool-content">
                        <div className="ai-tool-label">Input:</div>
                        <pre>{JSON.stringify(args, null, 2)}</pre>
                        <div className="ai-tool-label">Output:</div>
                        <pre>{JSON.stringify(response, null, 2)}</pre>
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="ai-message ai-message-assistant">
            <div className="ai-typing-indicator">
              <span></span>
              <span></span>
              <span></span>
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
