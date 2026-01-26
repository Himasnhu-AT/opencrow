import { Logger } from "./logger.js"

export function ENV_VALIDATE(logger: Logger) {
    const nodeENV = process.env.NODE_ENV

    if (!nodeENV) {
        logger.error("specify nodeENV")
        process.exit(-2)
    }
    if (nodeENV != "production" && nodeENV != "development" && nodeENV != "test") {
        logger.error("specify nodeENV")
        process.exit(-2)
    }


}