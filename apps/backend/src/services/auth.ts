import jwt from "jsonwebtoken";
import { Logger } from "../utils/logger.js";

const logger = new Logger();

export class AuthService {
  private adminEmail: string;
  private adminPassword?: string;
  private jwtSecret: string;

  constructor() {
    this.adminEmail = process.env.ADMIN_EMAIL || "";
    this.adminPassword = process.env.ADMIN_PASSWORD;
    this.jwtSecret =
      process.env.JWT_SECRET || "default_secret_do_not_use_in_prod";

    if (!this.adminEmail || !this.adminPassword) {
      logger.error("ADMIN_EMAIL or ADMIN_PASSWORD not set in environment");
    }
  }

  public async login(
    email: string,
    password: string,
  ): Promise<{ token: string } | null> {
    if (!this.adminEmail || !this.adminPassword) {
      throw new Error("Server misconfiguration");
    }

    if (email === this.adminEmail && password === this.adminPassword) {
      const token = jwt.sign({ email }, this.jwtSecret, { expiresIn: "1h" });
      logger.info(`Login successful for ${email}`);
      return { token };
    } else {
      logger.warn(`Failed login attempt for ${email}`);
      return null;
    }
  }
}
