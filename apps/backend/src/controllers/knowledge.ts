import { Request, Response } from "express";
import { KnowledgeService } from "../services/knowledge.js";

const knowledgeService = new KnowledgeService();

export class KnowledgeController {
  public async getSources(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const sources = await knowledgeService.getSourcesForProduct(productId);
      res.json(sources);
    } catch (error: any) {
      console.error("Error fetching knowledge sources:", error);
      res.status(500).json({ error: error.message });
    }
  }

  public async addSource(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { type, name, content } = req.body;

      let source;
      if (type === "url") {
        source = await knowledgeService.addUrlSource(productId, name);
      } else if (type === "file") {
        source = await knowledgeService.addFileSource(productId, name, content);
      } else {
        return res.status(400).json({ error: "Invalid source type" });
      }

      res.json(source);
    } catch (error: any) {
      console.error("Error adding knowledge source:", error);
      res.status(500).json({ error: error.message });
    }
  }

  public async removeSource(req: Request, res: Response) {
    try {
      const { sourceId } = req.params;
      await knowledgeService.removeSource(sourceId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error removing knowledge source:", error);
      res.status(500).json({ error: error.message });
    }
  }
}
