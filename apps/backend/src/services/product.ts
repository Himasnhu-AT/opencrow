import prisma from "../lib/prisma.js";
import crypto from "crypto";
import { OpenAPIParser } from "../utils/openapi-parser.js";

export class ProductService {
  public async getProducts() {
    return prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  public async getProduct(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
    });
  }

  public async upsertProduct(
    productId: string,
    data: { name: string; openApiUrl: string; baseUrl: string },
  ) {
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (existing) {
      return prisma.product.update({
        where: { id: productId },
        data,
      });
    }

    // Generate API key for new products
    const apiKey = `oc_${crypto.randomBytes(24).toString("hex")}`;

    return prisma.product.create({
      data: {
        id: productId,
        name: data.name || productId,
        openApiUrl: data.openApiUrl,
        baseUrl: data.baseUrl,
        apiKey,
      },
    });
  }

  /**
   * Partial update for product (auth settings, etc.)
   */
  public async updateProduct(
    productId: string,
    data: {
      name?: string;
      openApiUrl?: string;
      baseUrl?: string;
      authType?: string | null;
      authKeyName?: string | null;
      clientSideTools?: any;
    },
  ) {
    return prisma.product.update({
      where: { id: productId },
      data,
    });
  }

  /**
   * Get endpoints from OpenAPI spec with their configuration
   */
  public async getEndpoints(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Parse OpenAPI spec
    const parser = new OpenAPIParser();
    let endpoints: Array<{
      operationId: string;
      method: string;
      path: string;
      summary: string;
    }> = [];

    try {
      const spec = await parser.parseSpec(product.openApiUrl);
      endpoints = parser.extractEndpoints(spec);
    } catch (error: any) {
      console.error("Failed to parse OpenAPI spec:", error.message);
      return [];
    }

    // Get existing endpoint configs
    const configs = await prisma.endpointConfig.findMany({
      where: { productId },
    });

    const configMap = new Map(configs.map((c) => [c.operationId, c]));

    // Merge endpoints with configs
    return endpoints.map((endpoint) => {
      const config = configMap.get(endpoint.operationId);
      return {
        ...endpoint,
        enabled: config?.enabled ?? true,
        id: config?.id,
      };
    });
  }

  /**
   * Toggle endpoint enabled/disabled
   */
  public async toggleEndpoint(
    productId: string,
    operationId: string,
    enabled: boolean,
    method: string,
    path: string,
  ) {
    return prisma.endpointConfig.upsert({
      where: {
        productId_operationId: {
          productId,
          operationId,
        },
      },
      update: { enabled },
      create: {
        productId,
        operationId,
        method,
        path,
        enabled,
      },
    });
  }
}
