import prisma from "../lib/prisma.js";
import axios from "axios";
import { Logger } from "../utils/logger.js";

const logger = new Logger();

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
    this.scrapeUrl(source.id, url).catch((error) => {
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
  ) {
    return prisma.knowledgeSource.create({
      data: {
        productId,
        type: "file",
        name: filename,
        content,
        status: "ready",
      },
    });
  }

  /**
   * Remove a knowledge source
   */
  public async removeSource(sourceId: string) {
    return prisma.knowledgeSource.delete({
      where: { id: sourceId },
    });
  }

  /**
   * Scrape URL content and update the source
   */
  private async scrapeUrl(sourceId: string, url: string) {
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

      await prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: {
          content,
          status: "ready",
        },
      });

      logger.info(`Successfully scraped URL: ${url}`);
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
