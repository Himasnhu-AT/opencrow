"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, FileText, Trash2, Plus, Upload, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface KnowledgeSource {
  id: string;
  type: "url" | "file";
  name: string;
  status: "pending" | "processing" | "ready" | "error";
  error?: string | null;
  createdAt: string;
}

interface KnowledgeBaseCardProps {
  productId: string;
}

export function KnowledgeBaseCard({ productId }: KnowledgeBaseCardProps) {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchSources();
  }, [productId]);

  const fetchSources = async () => {
    try {
      const data = await apiFetch<KnowledgeSource[]>(
        `/api/products/${productId}/knowledge`,
      );
      setSources(data);
    } catch (error) {
      console.error("Failed to fetch knowledge sources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addUrl = async () => {
    if (!urlInput.trim()) return;

    setIsAdding(true);
    try {
      const newSource = await apiFetch<KnowledgeSource>(
        `/api/products/${productId}/knowledge`,
        {
          method: "POST",
          body: JSON.stringify({ type: "url", name: urlInput.trim() }),
        },
      );
      setSources((prev) => [newSource, ...prev]);
      setUrlInput("");

      // Poll for status updates since URL scraping is async
      pollSourceStatus(newSource.id);
    } catch (error) {
      console.error("Failed to add URL source:", error);
      alert("Failed to add URL. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const pollSourceStatus = async (sourceId: string) => {
    // Poll every 2 seconds for up to 30 seconds
    for (let i = 0; i < 15; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        const sources = await apiFetch<KnowledgeSource[]>(
          `/api/products/${productId}/knowledge`,
        );
        const source = sources.find((s) => s.id === sourceId);

        if (source) {
          setSources((prev) =>
            prev.map((s) => (s.id === sourceId ? source : s)),
          );

          if (source.status === "ready" || source.status === "error") {
            break;
          }
        }
      } catch (error) {
        console.error("Failed to poll source status:", error);
        break;
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsAdding(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        // Read file content
        const content = await file.text();

        const newSource = await apiFetch<KnowledgeSource>(
          `/api/products/${productId}/knowledge`,
          {
            method: "POST",
            body: JSON.stringify({
              type: "file",
              name: file.name,
              content: content,
            }),
          },
        );
        setSources((prev) => [newSource, ...prev]);
      } catch (error) {
        console.error(`Failed to upload file: ${file.name}`, error);
        alert(`Failed to upload file: ${file.name}. Please try again.`);
      }
    });

    try {
      await Promise.all(uploadPromises);
    } finally {
      setIsAdding(false);
      // Reset input
      e.target.value = "";
    }
  };

  const removeSource = async (id: string) => {
    try {
      await apiFetch(`/api/products/${productId}/knowledge/${id}`, {
        method: "DELETE",
      });
      setSources((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to remove source:", error);
      alert("Failed to remove source. Please try again.");
    }
  };

  const getStatusBadge = (source: KnowledgeSource) => {
    switch (source.status) {
      case "pending":
      case "processing":
        return (
          <Badge variant="secondary" className="text-xs">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Processing
          </Badge>
        );
      case "error":
        return (
          <Badge
            variant="destructive"
            className="text-xs"
            title={source.error || "Error"}
          >
            Error
          </Badge>
        );
      case "ready":
        return (
          <Badge variant="outline" className="text-xs text-green-600">
            Ready
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Knowledge Base
        </CardTitle>
        <CardDescription>
          Add URLs to scrape or upload documents for your agent to reference
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://docs.example.com/guide"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addUrl()}
              className="flex-1"
              disabled={isAdding}
            />
            <Button onClick={addUrl} variant="outline" disabled={isAdding}>
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Add URL
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs text-neutral-500">or</span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>
          <label htmlFor="kb-file-upload" className="block">
            <Button
              variant="outline"
              className="w-full"
              asChild
              disabled={isAdding}
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Upload File (PDF, TXT, MD)
              </span>
            </Button>
            <input
              id="kb-file-upload"
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isAdding}
              multiple
            />
          </label>
        </div>

        {/* Sources List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Added Sources</h4>
            <span className="text-xs text-neutral-500">
              {sources.length} sources
            </span>
          </div>
          {sources.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-sm border border-dashed border-neutral-200 rounded-lg">
              No sources added yet
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {source.type === "url" ? (
                      <Globe className="h-4 w-4 text-neutral-500 shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-neutral-500 shrink-0" />
                    )}
                    <span
                      className="text-sm text-neutral-700 truncate flex-1"
                      title={source.name}
                    >
                      {source.name}
                    </span>
                    {getStatusBadge(source)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSource(source.id)}
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
