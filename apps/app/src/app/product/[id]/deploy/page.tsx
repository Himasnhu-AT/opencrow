"use client";

import { use, useState, useEffect } from "react";
import { apiFetch, API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";

interface Product {
  id: string;
  name: string;
}

export default function DeployPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: productId } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const data = await apiFetch<Product>(`/api/products/${productId}`);
      setProduct(data);
    } catch (error) {
      console.error("Failed to fetch product", error);
    }
  };

  const scriptCode = `<script
  src="${API_BASE_URL.replace(":3001", ":5173")}/ai-agent-widget.umd.js"
  data-product-id="${productId}"
  data-api-url="${API_BASE_URL}"
></script>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!product) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Deploy</h1>
          <p className="text-gray-500">
            Integrate the AI agent into your website.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Installation</CardTitle>
            <CardDescription>
              Choose your preferred method to integrate the agent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="react">React</TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="space-y-4 py-4">
                <div className="relative">
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{scriptCode}</code>
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={() => copyToClipboard(scriptCode)}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  Paste this snippet before the closing{" "}
                  <code className="bg-muted px-1 rounded">&lt;/body&gt;</code>{" "}
                  tag.
                </div>
              </TabsContent>

              <TabsContent value="react" className="space-y-4 py-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      1. Install the package
                    </h4>
                    <div className="bg-slate-950 text-slate-50 p-3 rounded-lg text-sm">
                      npm install @opencrow/ui
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      2. Import and use the widget
                    </h4>
                    <div className="relative">
                      <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{`import { OpenCrowWidget } from "@opencrow/ui";
import "@opencrow/ui/styles.css";

export default function App() {
  return (
    <OpenCrowWidget 
      productId="${productId}"
      apiUrl="${API_BASE_URL}"
    />
  );
}`}</code>
                      </pre>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 h-8 w-8 p-0"
                        onClick={() =>
                          copyToClipboard(
                            `import { OpenCrowWidget } from "@opencrow/ui"; ...`,
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-sm text-gray-500 border-t pt-4">
              Ensure that your website URL is allowed in the CORS configuration.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
