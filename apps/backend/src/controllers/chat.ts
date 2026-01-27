import { Request, Response } from "express";
import { ChatService } from "../services/chat.js";
import prisma from "../lib/prisma.js"; // Needed due to error tracking coupling

const chatService = new ChatService();

export class ChatController {
  public async processChat(req: Request, res: Response) {
    try {
      const { message, productId, sessionId, userToken } = req.body;
      const result = await chatService.processChat(
        message,
        productId,
        sessionId,
        userToken,
      );
      res.json(result);
    } catch (error: any) {
      console.error("Chat error:", error);

      // Track error
      try {
        await prisma.analyticsEvent.create({
          data: {
            productId: req.body.productId || "unknown",
            eventType: "error",
            metadata: { error: error.message, sessionId: req.body.sessionId },
          },
        });
      } catch (e) {
        // Ignore analytics error
      }

      if (error.message === "Product not found") {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: error.message });
    }
  }

  public async getMessages(req: Request, res: Response) {
    try {
      const messages = await chatService.getSessionMessages(
        req.params.sessionId,
      );
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: error.message });
    }
  }

  public async getSessions(req: Request, res: Response) {
    try {
      const sessions = await chatService.getProductSessions(
        req.params.productId,
      );
      res.json(sessions);
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: error.message });
    }
  }
}
