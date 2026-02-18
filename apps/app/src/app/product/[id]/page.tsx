"use client";

import { use, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Product {
  id: string;
  name: string;
  openApiUrl: string;
  baseUrl: string;
  authType?: string;
  authKeyName?: string;
  createdAt: string;
}

export default function ProductSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    openApiUrl: "",
    baseUrl: "",
    authType: "none",
    authKeyName: "",
  });

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const data = await apiFetch<Product>(`/api/products/${productId}`);
      setProduct(data);
      setFormData({
        name: data.name,
        openApiUrl: data.openApiUrl,
        baseUrl: data.baseUrl,
        authType: data.authType || "none",
        authKeyName: data.authKeyName || "",
      });
    } catch (error) {
      console.error("Failed to fetch product", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch(`/api/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify(formData),
      });
      // Refresh data
      fetchProduct();
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save product", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;
  if (!product) return <div className="p-8">Product not found</div>;

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">General Settings</h1>
          <p className="text-gray-500">
            Configure the core settings for your agent.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="openApiUrl">OpenAPI Spec URL</Label>
              <Input
                id="openApiUrl"
                value={formData.openApiUrl}
                onChange={(e) =>
                  setFormData({ ...formData, openApiUrl: e.target.value })
                }
                placeholder="https://api.example.com/openapi.json"
              />
              <p className="text-sm text-gray-500">
                The URL to your OpenAPI/Swagger specification JSON/YAML.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseUrl">API Base URL</Label>
              <Input
                id="baseUrl"
                value={formData.baseUrl}
                onChange={(e) =>
                  setFormData({ ...formData, baseUrl: e.target.value })
                }
                placeholder="https://api.example.com"
              />
              <p className="text-sm text-gray-500">
                The base URL where API requests will be sent.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium">Authentication</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authType">Auth Type</Label>
                  <select
                    id="authType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.authType}
                    onChange={(e) =>
                      setFormData({ ...formData, authType: e.target.value })
                    }
                  >
                    <option value="none">None</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="api_key">API Key</option>
                    <option value="local_storage">Local Storage</option>
                  </select>
                </div>
                {(formData.authType === "api_key" ||
                  formData.authType === "local_storage") && (
                  <div className="space-y-2">
                    <Label htmlFor="authKeyName">
                      {formData.authType === "local_storage"
                        ? "Storage Key"
                        : "Header Name"}
                    </Label>
                    <Input
                      id="authKeyName"
                      value={formData.authKeyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          authKeyName: e.target.value,
                        })
                      }
                      placeholder={
                        formData.authType === "local_storage"
                          ? "e.g. accessToken"
                          : "X-API-Key"
                      }
                    />
                    {formData.authType === "local_storage" && (
                      <p className="text-xs text-gray-500">
                        The key name in localStorage to retrieve the token from.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
