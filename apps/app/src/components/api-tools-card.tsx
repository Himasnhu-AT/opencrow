"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Link, FileJson, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Endpoint {
  operationId: string;
  method: string;
  path: string;
  summary: string;
  enabled: boolean;
  id?: string;
}

interface Product {
  id: string;
  name: string;
  openApiUrl: string;
  baseUrl: string;
  authType?: string | null;
  authKeyName?: string | null;
}

type AuthType = "none" | "bearer" | "api-key" | "cookie";

interface ApiToolsCardProps {
  productId: string;
}

export function ApiToolsCard({ productId }: ApiToolsCardProps) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [authType, setAuthType] = useState<AuthType>("none");
  const [keyName, setKeyName] = useState("");
  const [specUrl, setSpecUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Fetch product and endpoints on mount
  useEffect(() => {
    fetchProductData();
  }, [productId]);

  const fetchProductData = async () => {
    setIsLoading(true);
    try {
      // Fetch product details
      const productData = await apiFetch<Product>(`/api/products/${productId}`);
      setProduct(productData);
      setAuthType((productData.authType as AuthType) || "none");
      setKeyName(productData.authKeyName || "");
      setSpecUrl(productData.openApiUrl || "");

      // Fetch endpoints
      const endpointsData = await apiFetch<Endpoint[]>(
        `/api/products/${productId}/endpoints`,
      );
      setEndpoints(endpointsData);
    } catch (error) {
      console.error("Failed to fetch product data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEndpoint = async (endpoint: Endpoint) => {
    const newEnabled = !endpoint.enabled;

    // Optimistic update
    setEndpoints((prev) =>
      prev.map((ep) =>
        ep.operationId === endpoint.operationId
          ? { ...ep, enabled: newEnabled }
          : ep,
      ),
    );

    try {
      await apiFetch(
        `/api/products/${productId}/endpoints/${endpoint.operationId}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            enabled: newEnabled,
            method: endpoint.method,
            path: endpoint.path,
          }),
        },
      );
    } catch (error) {
      console.error("Failed to toggle endpoint:", error);
      // Revert on error
      setEndpoints((prev) =>
        prev.map((ep) =>
          ep.operationId === endpoint.operationId
            ? { ...ep, enabled: !newEnabled }
            : ep,
        ),
      );
    }
  };

  const saveAuthConfig = async () => {
    setIsSaving(true);
    try {
      await apiFetch(`/api/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({
          authType: authType === "none" ? null : authType,
          authKeyName: authType === "none" ? null : keyName,
        }),
      });
    } catch (error) {
      console.error("Failed to save auth config:", error);
      alert("Failed to save authentication settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportUrl = async () => {
    if (!specUrl.trim()) return;

    setIsImporting(true);
    try {
      // Update product with new OpenAPI URL
      await apiFetch(`/api/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ openApiUrl: specUrl }),
      });

      // Refresh endpoints
      const endpointsData = await apiFetch<Endpoint[]>(
        `/api/products/${productId}/endpoints`,
      );
      setEndpoints(endpointsData);
    } catch (error) {
      console.error("Failed to import OpenAPI spec:", error);
      alert("Failed to import OpenAPI specification. Please check the URL.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (
        file.name.endsWith(".json") ||
        file.name.endsWith(".yaml") ||
        file.name.endsWith(".yml")
      ) {
        // TODO: Implement file upload to backend
        alert("File upload not yet implemented. Please use URL import.");
      } else {
        alert("Please upload a .json or .yaml file (OpenAPI/Swagger spec)");
      }
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // TODO: Implement file upload to backend
      alert("File upload not yet implemented. Please use URL import.");
    }
  };

  const getMethodVariant = (
    method: string,
  ): "get" | "post" | "put" | "delete" | "patch" => {
    return method.toLowerCase() as "get" | "post" | "put" | "delete" | "patch";
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
          <FileJson className="h-5 w-5" />
          API Tools
        </CardTitle>
        <CardDescription>
          Import your OpenAPI/Swagger specification to enable API integrations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Spec Input Section */}
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Spec
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Import URL
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? "border-neutral-900 bg-neutral-50"
                  : "border-neutral-300 hover:border-neutral-400"
              }`}
            >
              <Upload className="h-8 w-8 mx-auto text-neutral-400 mb-3" />
              <p className="text-sm text-neutral-600 mb-2">
                Drag and drop your OpenAPI spec here
              </p>
              <p className="text-xs text-neutral-500 mb-4">
                Accepts .json or .yaml files
              </p>
              <label htmlFor="file-upload">
                <Button variant="outline" size="sm" asChild>
                  <span>Browse Files</span>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json,.yaml,.yml"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          </TabsContent>
          <TabsContent value="url" className="mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://api.example.com/openapi.json"
                value={specUrl}
                onChange={(e) => setSpecUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleImportUrl} disabled={isImporting}>
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Import"
                )}
              </Button>
            </div>
            {product?.openApiUrl && (
              <p className="text-xs text-neutral-500 mt-2">
                Current: {product.openApiUrl}
              </p>
            )}
          </TabsContent>
        </Tabs>

        {/* Authentication Section */}
        <div className="space-y-4 pt-4 border-t border-neutral-200">
          <h4 className="font-medium text-sm">Authentication</h4>
          <p className="text-sm text-neutral-600">
            Configure how your agent authenticates with your API on behalf of
            users.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="auth-type">Auth Type</Label>
              <Select
                value={authType}
                onValueChange={(v) => setAuthType(v as AuthType)}
              >
                <SelectTrigger id="auth-type">
                  <SelectValue placeholder="Select auth type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Auth</SelectItem>
                  <SelectItem value="api-key">API Key (Header)</SelectItem>
                  <SelectItem value="bearer">Bearer Token (JWT)</SelectItem>
                  <SelectItem value="cookie">Cookie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {authType !== "none" && (
              <div className="space-y-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder={
                    authType === "cookie" ? "session_id" : "X-Auth-Token"
                  }
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
            )}
            <div className="flex items-end">
              <Button
                onClick={saveAuthConfig}
                disabled={isSaving}
                variant="outline"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Save Auth
              </Button>
            </div>
          </div>
        </div>

        {/* Endpoints Section */}
        <div className="space-y-4 pt-4 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Endpoints</h4>
            <span className="text-xs text-neutral-500">
              {endpoints.filter((e) => e.enabled).length} of {endpoints.length}{" "}
              enabled
            </span>
          </div>
          {endpoints.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-sm border border-dashed border-neutral-200 rounded-lg">
              No endpoints found. Import an OpenAPI specification to see
              available endpoints.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {endpoints.map((endpoint) => (
                <div
                  key={endpoint.operationId}
                  className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={getMethodVariant(endpoint.method)}
                      className="w-16 justify-center"
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono text-neutral-700">
                      {endpoint.path}
                    </code>
                  </div>
                  <Switch
                    checked={endpoint.enabled}
                    onCheckedChange={() => toggleEndpoint(endpoint)}
                    aria-label={`Toggle ${endpoint.method} ${endpoint.path}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
