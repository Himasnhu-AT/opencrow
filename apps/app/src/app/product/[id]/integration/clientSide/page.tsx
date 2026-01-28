"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";

// Simple mock for JSON editor since we don't have a specialized component
function JsonEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      className="w-full h-48 font-mono text-xs p-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-950"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
    />
  );
}

interface ClientTool {
  name: string;
  description: string;
  parameters: any;
}

export default function ClientSideToolsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: agentId } = use(params);
  const router = useRouter();
  const [tools, setTools] = useState<ClientTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<ClientTool | null>(null);
  const [editJson, setEditJson] = useState("");

  // Fetch tools from backend
  useEffect(() => {
    async function fetchTools() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/products/${agentId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        setTools(data.clientSideTools || []);
      } catch (error) {
        console.error("Error fetching tools:", error);
      } finally {
        setIsLoading(false);
      }
    }
    if (agentId) fetchTools();
  }, [agentId]);

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/products/${agentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientSideTools: tools }),
        },
      );

      if (!response.ok) throw new Error("Failed to save tools");

      alert("Tools saved successfully!");
    } catch (error) {
      console.error("Error saving tools:", error);
      alert("Failed to save tools");
    }
  };

  const handleAddNew = () => {
    const newTool = {
      name: "new_tool",
      description: "Description of what this tool does",
      parameters: {
        type: "object",
        properties: {},
      },
    };
    setEditingTool(newTool);
    setEditJson(JSON.stringify(newTool.parameters, null, 2));
  };

  const handleEditTool = (tool: ClientTool) => {
    setEditingTool({ ...tool });
    setEditJson(JSON.stringify(tool.parameters, null, 2));
  };

  const handleDeleteTool = (name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setTools(tools.filter((t) => t.name !== name));
      if (editingTool?.name === name) {
        setEditingTool(null);
      }
    }
  };

  const saveToolChanges = () => {
    if (!editingTool) return;

    try {
      const parsedParams = JSON.parse(editJson);
      const updatedTool = { ...editingTool, parameters: parsedParams };

      const existingIndex = tools.findIndex((t) => t.name === editingTool.name);
      if (existingIndex >= 0) {
        // Update existing (careful about renaming logic if name is editable, here we assume name is key for simplicity)
        // If we allow name editing, we need to handle "rename vs new" logic
        // For MVP, simplistic update:
        const newTools = [...tools];
        // If name changed, check collision
        const originalTool = tools[existingIndex];
        if (
          originalTool.name !== updatedTool.name &&
          tools.some((t) => t.name === updatedTool.name)
        ) {
          alert("Tool name already exists!");
          return;
        }
        // This logic is a bit flawed for "renaming" if index is used, but sufficient for mock
        // Better: filtering out the *old* one and adding the *new* one is safer if name changed
        const filtered = tools.filter((t) => t !== originalTool);
        setTools([...filtered, updatedTool]);
      } else {
        // Add new
        if (tools.some((t) => t.name === updatedTool.name)) {
          alert("Tool name already exists!");
          return;
        }
        setTools([...tools, updatedTool]);
      }

      setEditingTool(null);
    } catch (e) {
      alert("Invalid JSON parameters");
    }
  };

  return (
    <main className="flex-1 overflow-hidden">
      <ScrollArea className="h-screen">
        <div className="p-8 max-w-5xl">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-900">
                Client-Side Tools
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                Define JavaScript functions that the AI can call on your
                user&apos;s browser.
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Tool
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Tool List */}
            <div className="col-span-4 space-y-4">
              {tools.map((tool) => (
                <Card
                  key={tool.name}
                  className={`cursor-pointer transition-colors ${editingTool?.name === tool.name ? "border-neutral-900 ring-1 ring-neutral-900" : "hover:border-neutral-400"}`}
                  onClick={() => handleEditTool(tool)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          <span>🔧 {tool.name}</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                          {tool.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-neutral-400 hover:text-red-500 -mr-2 -mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTool(tool.name);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Editor */}
            <div className="col-span-8">
              {editingTool ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Tool</CardTitle>
                    <CardDescription>
                      Configure the definition for the LLM
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Function Name</Label>
                        <Input
                          value={editingTool.name}
                          onChange={(e) =>
                            setEditingTool({
                              ...editingTool,
                              name: e.target.value,
                            })
                          }
                          placeholder="e.g. navigate_to_page"
                        />
                        <p className="text-[10px] text-neutral-500">
                          Must match the key in your widget implementation
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={editingTool.description}
                        onChange={(e) =>
                          setEditingTool({
                            ...editingTool,
                            description: e.target.value,
                          })
                        }
                        placeholder="Explain when the AI should use this tool"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Parameters (JSON Schema)</Label>
                      <JsonEditor value={editJson} onChange={setEditJson} />
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Button onClick={saveToolChanges}>
                        Update Tool Definition
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center p-12 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-400 text-sm">
                  Select a tool to edit or create a new one
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </main>
  );
}
