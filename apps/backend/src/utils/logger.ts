import * as winston from "winston";

export class Logger {
  private readonly logger: winston.Logger;

  constructor() {
    const { combine, timestamp, printf, colorize, json, errors } =
      winston.format;

    const logFormat = printf(
      ({ level, message, timestamp, stack, ...meta }) => {
        const logMessage = stack || message;
        const metaString = Object.keys(meta).length ? JSON.stringify(meta) : "";
        return `${timestamp} [${level}]: ${logMessage} ${metaString}`;
      },
    );

    if (process.env.NODE_ENV !== "production") {
      this.logger = winston.createLogger({
        level: "debug",
        format: combine(
          colorize(),
          timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          errors({ stack: true }),
          logFormat,
        ),
        transports: [new winston.transports.Console()],
      });
    } else {
      this.logger = winston.createLogger({
        level: "info",
        format: combine(timestamp(), errors({ stack: true }), json()),
        transports: [
          new winston.transports.File({
            filename: "error.log",
            level: "error",
          }),
          new winston.transports.File({ filename: "combined.log" }),
        ],
      });
    }
  }

  log(message: string) {
    this.info(message);
  }

  public debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  public info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  public warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  public error(message: string, meta?: any) {
    if (meta instanceof Error) {
      this.logger.error(message, { message: meta.message, stack: meta.stack });
    } else {
      this.logger.error(message, meta);
    }
  }
}
