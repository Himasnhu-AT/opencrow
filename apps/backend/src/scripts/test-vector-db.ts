import { LanceDBService } from "../lib/vector-db.js";
import { Logger } from "../utils/logger.js";

const logger = new Logger();

async function main() {
  logger.info("Starting Vector DB Test...");

  const db = new LanceDBService();

  // Mock data
  const id = "test-doc-1";
  const text = "This is a test document about artificial intelligence.";
  const metadata = {
    source: "test",
    category: "AI",
    productId: "test-product",
  };
  const vector = Array(3072)
    .fill(0)
    .map(() => Math.random()); // Mock 3072-dim vector

  try {
    // Test Add
    logger.info("Testing addDocument...");
    await db.addDocument(id, vector, text, metadata);
    logger.info("Document added successfully.");

    // Test Search
    logger.info("Testing search...");
    const results = await db.search(vector, 1);
    logger.info("Search results:", results);

    if (results.length > 0 && results[0].id === id) {
      logger.info("Search verification PASSED.");
    } else {
      logger.error("Search verification FAILED.");
    }

    // Test Delete
    logger.info("Testing deleteDocument...");
    await db.deleteDocument(id);

    const resultsAfterDelete = await db.search(vector, 1);
    if (resultsAfterDelete.length === 0 || resultsAfterDelete[0].id !== id) {
      logger.info("Delete verification PASSED.");
    } else {
      logger.error("Delete verification FAILED.");
    }
  } catch (error: any) {
    logger.error(`Test failed: ${error.message}`);
  }
}

main();
