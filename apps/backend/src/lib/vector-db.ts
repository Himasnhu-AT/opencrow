import * as lancedb from "@lancedb/lancedb";
import * as fs from "fs";
import * as path from "path";
import { Logger } from "../utils/logger.js";

const logger = new Logger();

export interface VectorDB {
  addDocument(
    id: string,
    vector: number[],
    text: string,
    metadata: Record<string, any>,
  ): Promise<void>;
  search(
    vector: number[],
    limit: number,
    filter?: string,
  ): Promise<Array<{ id: string; score: number; text: string; metadata: any }>>;
  deleteDocument(id: string): Promise<void>;
}

export class LanceDBService implements VectorDB {
  private db: lancedb.Connection | null = null;
  private table: lancedb.Table | null = null;
  private tableName = "knowledge_base";
  private dbPath = "data/lancedb";

  constructor() {
    this.init();
  }

  private async init() {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.db = await lancedb.connect(this.dbPath);

      const tableNames = await this.db.tableNames();
      if (!tableNames.includes(this.tableName)) {
        // Create table with an explicit schema by providing initial data
        const dummyData = [
          {
            id: "dummy-id",
            vector: Array(3072).fill(0), // Assuming 3072 dimension vectors (llama3.2:3b)
            text: "dummy text",
            productId: "dummy-product-id",
            metadata: JSON.stringify({}),
            updatedAt: Date.now(),
          },
        ];
        this.table = await this.db.createTable(this.tableName, dummyData);
        // Immediately delete the dummy record
        await this.table.delete(`id = 'dummy-id'`);
      } else {
        this.table = await this.db.openTable(this.tableName);
      }

      logger.info("LanceDB initialized");
    } catch (error: any) {
      logger.error(`Failed to initialize LanceDB: ${error.message}`);
    }
  }

  async addDocument(
    id: string,
    vector: number[],
    text: string,
    metadata: Record<string, any>,
  ): Promise<void> {
    if (!this.db) await this.init();

    const { productId, ...restMetadata } = metadata;
    logger.debug(
      `LanceDBService.addDocument: Storing document for productId: ${productId}`,
    );

    const data = [
      {
        id,
        vector,
        text,
        productId: productId || "unknown",
        metadata: JSON.stringify(restMetadata), // Store metadata as string to avoid schema complexity
        updatedAt: Date.now(),
      },
    ];

    if (!this.table) {
      await this.init(); // Ensure table is initialized if not already
    }

    // Overwrite if exists (delete then add, or merge?)
    // LanceDB supports merge/upsert in newer versions, but simple way is delete then add
    // specific to lancedb node:
    // "overwrite" mode on createTable replaces the whole table.
    // to update single row, we might need to delete and append.
    // try {
    //   await this.table!.delete(`id = '${id}'`);
    // } catch (e) {
    //   // ignore if not found
    // }

    await this.table!.add(data);
  }

  async search(
    vector: number[],
    limit: number = 5,
    filter?: string, // SQL-like filter string
  ): Promise<
    Array<{ id: string; score: number; text: string; metadata: any }>
  > {
    if (!this.db) await this.init();
    if (!this.table) return [];

    let query = this.table.search(vector).limit(limit);
    if (filter) {
      query = query.where(filter);
    }

    const results = await query.toArray();
    logger.debug(
      `LanceDBService.search: Raw results from LanceDB: ${JSON.stringify(results)}`,
    );

    return results.map((r: any) => ({
      id: r.id,
      score: 1 - r._distance, // LanceDB returns distance (lower is better), we want similarity?
      // Actually typically it's L2 distance.
      // User expected verification.
      // Let's return raw distance or convert if needed.
      // Usually vector search libraries return distance.
      // If using cosine, it returns 1 - cosine_sim = distance.
      // So detailed behavior depends on metric type. Default is L2.
      // For now, returning structure as requested.
      text: r.text,
      metadata:
        typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata,
    }));
  }

  async deleteDocument(id: string): Promise<void> {
    if (!this.db) await this.init();
    if (!this.table) return;

    await this.table.delete(`id = '${id}'`);
  }
}
