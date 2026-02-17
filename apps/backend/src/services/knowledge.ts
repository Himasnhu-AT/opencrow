import { LanceDBService } from "../lib/vector-db.js";
import { getLLMService } from "./llm.js";
import prisma from "../lib/prisma.js";
import axios from "axios";
import { Logger } from "../utils/logger.js";

const logger = new Logger();
const vectorDB = new LanceDBService();

export class KnowledgeService {
  /**
   * Get all knowledge sources for a product
   */
  public async getSourcesForProduct(productId: string) {
    return prisma.knowledgeSource.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Add a URL as knowledge source
   */
  public async addUrlSource(productId: string, url: string) {
    // Create the source in pending state
    const source = await prisma.knowledgeSource.create({
      data: {
        productId,
        type: "url",
        name: url,
        status: "processing",
      },
    });

    // Fetch and scrape the URL content asynchronously
    this.scrapeUrl(source.id, url, productId).catch((error) => {
      logger.error(`Failed to scrape URL ${url}: ${error.message}`);
    });

    return source;
  }

  /**
   * Add a file as knowledge source
   */
  public async addFileSource(
    productId: string,
    filename: string,
    content: string,
    metadata: Record<string, any> = {},
  ) {
    const source = await prisma.knowledgeSource.create({
      data: {
        productId,
        type: "file",
        name: filename,
        content,
        status: "processing",
        metadata: JSON.stringify(metadata), // Store in Prisma
      },
    });

    try {
      // Generate embedding and store in Vector DB
      const llm = getLLMService();
      const vector = await llm.getEmbedding(content);

      logger.debug("got vectors");
      await vectorDB.addDocument(source.id, vector, content, {
        productId,
        sourceId: source.id,
        type: "file",
        name: filename,
        ...metadata,
      });

      logger.info(`Added file source ${filename} to vector DB`);
    } catch (error: any) {
      logger.error(`Failed to vectorise file ${filename}: ${error.message}`);
      // Don't fail the whole operation, just log
      await prisma.knowledgeSource.update({
        where: { id: source.id },
        data: { error: "Vectorisation failed: " + error.message },
      });
    }

    return source;
  }

  /**
   * Remove a knowledge source
   */
  public async removeSource(sourceId: string) {
    await vectorDB.deleteDocument(sourceId);
    return prisma.knowledgeSource.delete({
      where: { id: sourceId },
    });
  }

  /**
   * Search knowledge base
   */
  public async search(productId: string, query: string, limit: number = 3) {
    try {
      const llm = getLLMService();
      const vector = await llm.getEmbedding(query);

      const filterString = `productId = '${productId}'`;
      logger.debug(
        `KnowledgeService.search: Searching for productId: ${productId} with filter: ${filterString}`,
      );

      const results = await vectorDB.search(vector, limit, filterString);

      return results;
    } catch (error: any) {
      logger.error(`Search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Scrape URL content and update the source
   */
  private async scrapeUrl(sourceId: string, url: string, productId: string) {
    try {
      logger.info(`Scraping URL: ${url}`);

      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; OpenCrow/1.0; +https://opencrow.dev)",
        },
      });

      // Extract text content (basic implementation)
      let content = response.data;

      // If HTML, try to extract text
      if (typeof content === "string" && content.includes("<html")) {
        // Remove script and style tags
        content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
        content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
        // Remove HTML tags
        content = content.replace(/<[^>]+>/g, " ");
        // Clean up whitespace
        content = content.replace(/\s+/g, " ").trim();
      }

      // Truncate if too long (max 100KB)
      if (content.length > 100000) {
        content = content.substring(0, 100000);
      }

      const metadata = { url, scrapedAt: new Date().toISOString() };

      await prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: {
          content,
          status: "ready",
          metadata: JSON.stringify(metadata),
        },
      });

      // Generate embedding and store in Vector DB
      const llm = getLLMService();
      const vector = await llm.getEmbedding(content);

      await vectorDB.addDocument(sourceId, vector, content, {
        productId,
        sourceId,
        type: "url",
        name: url,
        ...metadata,
      });

      logger.info(`Successfully scraped and vectorised URL: ${url}`);
    } catch (error: any) {
      logger.error(`Failed to scrape URL ${url}: ${error.message}`);

      await prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: {
          status: "error",
          error: error.message,
        },
      });
    }
  }
}
