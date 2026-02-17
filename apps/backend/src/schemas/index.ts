import { z } from "zod";

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         openApiUrl:
 *           type: string
 *         baseUrl:
 *           type: string
 *         authType:
 *           type: string
 *           enum: [none, bearer, api_key]
 *         authKeyName:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ProductConfig:
 *       type: object
 *       required:
 *         - name
 *         - openApiUrl
 *       properties:
 *         name:
 *           type: string
 *         openApiUrl:
 *           type: string
 *         baseUrl:
 *           type: string
 *     ProductUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         openApiUrl:
 *           type: string
 *         baseUrl:
 *           type: string
 *         authType:
 *           type: string
 *           enum: [none, bearer, api_key]
 *         authKeyName:
 *           type: string
 *         clientSideTools:
 *           type: array
 *           items:
 *             type: object
 *     ChatRequest:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *         sessionId:
 *           type: string
 */

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    openApiUrl: z.string().url("Invalid OpenAPI URL"),
    baseUrl: z.string().url("Invalid Base URL").optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    productId: z.string(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    openApiUrl: z.string().url().optional(),
    baseUrl: z.string().url().optional(),
    authType: z.enum(["bearer", "api_key", "none"]).nullable().optional(),
    authKeyName: z.string().optional().nullable(),
    clientSideTools: z.array(z.any()).optional(),
  }),
});

export const chatRequestSchema = z.object({
  body: z.object({
    message: z.string().min(1, "Message is required"),
    sessionId: z.string().optional(),
  }),
});
