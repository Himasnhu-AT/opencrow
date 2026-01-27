"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiFetch } from "@/lib/api";
import { MessageSquare, Loader2, User, Bot, Terminal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";

interface Conversation {
  sessionId: string;
  lastMessage: string;
  dateTime: string;
  status: "active" | "ended" | "pending";
}

interface ToolCall {
  name: string;
  args: any;
  response: any;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  functionsCalled?: ToolCall[] | string[];
}

interface ConversationsCardProps {
  productId?: string;
}

export function ConversationsCard({ productId }: ConversationsCardProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchConversations();
    } else {
      setIsLoadingList(false);
    }
  }, [productId]);

  useEffect(() => {
    if (selectedSession) {
      fetchMessages(selectedSession);
    } else {
      setMessages([]);
    }
  }, [selectedSession]);

  const fetchConversations = async () => {
    try {
      const data = await apiFetch<Conversation[]>(
        `/api/products/${productId}/sessions`,
      );
      setConversations(data);
      if (data.length > 0 && !selectedSession) {
        setSelectedSession(data[0].sessionId);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setIsLoadingList(false);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    setIsLoadingMessages(true);
    try {
      const data = await apiFetch<Message[]>(`/api/messages/${sessionId}`);
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  if (isLoadingList) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </Card>
    );
  }

  return (
    <Card className="h-[calc(100vh-200px)] flex flex-col overflow-hidden">
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Sidebar - Conversation List */}
        <div className="w-1/3 border-r h-full flex flex-col bg-neutral-50/50">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              History
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-neutral-500 text-sm">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.sessionId}
                    onClick={() => setSelectedSession(conv.sessionId)}
                    className={`p-4 text-left border-b hover:bg-neutral-100 transition-colors ${
                      selectedSession === conv.sessionId
                        ? "bg-white border-l-4 border-l-primary shadow-sm"
                        : "border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-mono text-neutral-500 truncate max-w-[120px]">
                        {conv.sessionId}
                      </span>
                      <span className="text-xs text-neutral-400 whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(conv.dateTime), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 line-clamp-2">
                      {conv.lastMessage}
                    </p>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Area - Chat View */}
        <div className="flex-1 flex flex-col bg-white h-full">
          {selectedSession ? (
            <>
              <div className="p-4 border-b flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-mono text-sm font-medium">
                    {selectedSession}
                  </span>
                </div>
                <span className="text-xs text-neutral-400">
                  {messages.length} messages
                </span>
              </div>
              <ScrollArea className="flex-1 p-4">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                  </div>
                ) : (
                  <div className="space-y-6 max-w-3xl mx-auto">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-4 ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                            <Bot className="h-4 w-4 text-purple-600" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-neutral-100 text-neutral-800"
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap leading-relaxed markdown-content">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                          {msg.functionsCalled &&
                            msg.functionsCalled.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-neutral-200/50 flex flex-col gap-2">
                                {msg.functionsCalled.map((fn: any, idx) => {
                                  const name =
                                    typeof fn === "string" ? fn : fn.name;
                                  const args =
                                    typeof fn === "string" ? null : fn.args;
                                  const response =
                                    typeof fn === "string" ? null : fn.response;

                                  return (
                                    <details
                                      key={idx}
                                      className="group text-xs bg-black/5 rounded overflow-hidden"
                                    >
                                      <summary className="flex items-center gap-2 p-1.5 cursor-pointer hover:bg-black/10 transition-colors font-mono">
                                        <Terminal className="h-3 w-3" />
                                        <span className="font-semibold">
                                          {name}
                                        </span>
                                        <span className="text-[10px] text-neutral-500 ml-auto group-open:rotate-180 transition-transform">
                                          ▼
                                        </span>
                                      </summary>
                                      {args && (
                                        <div className="p-2 border-t border-black/5 bg-black/5 space-y-2">
                                          <div>
                                            <div className="font-semibold text-[10px] text-neutral-500 mb-1">
                                              INPUT
                                            </div>
                                            <pre className="overflow-x-auto p-1.5 bg-neutral-900 text-green-400 rounded text-[10px] font-mono">
                                              {JSON.stringify(args, null, 2)}
                                            </pre>
                                          </div>
                                          <div>
                                            <div className="font-semibold text-[10px] text-neutral-500 mb-1">
                                              OUTPUT
                                            </div>
                                            <pre className="overflow-x-auto p-1.5 bg-neutral-900 text-blue-400 rounded text-[10px] font-mono">
                                              {JSON.stringify(
                                                response,
                                                null,
                                                2,
                                              )}
                                            </pre>
                                          </div>
                                        </div>
                                      )}
                                    </details>
                                  );
                                })}
                              </div>
                            )}
                          <div
                            className={`text-[10px] mt-1 ${
                              msg.role === "user"
                                ? "text-blue-200"
                                : "text-neutral-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                        {msg.role === "user" && (
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a conversation to view details</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
