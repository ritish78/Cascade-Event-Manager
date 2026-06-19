import { Logger as WinstonLogger, createLogger, transports, format } from "winston";

class Logger {
  private errorLogger: WinstonLogger;
  private debugLogger: WinstonLogger;
  private infoLogger: WinstonLogger;
  private notFoundLogger: WinstonLogger;

  constructor() {
    //Creates a log file `error.log` in `logs` folder where we store logs
    //if any error in the app arises, we can view the logs
    this.errorLogger = createLogger({
      level: "error",
      format: format.combine(format.timestamp(), format.json()),
      transports: [new transports.File({ filename: "logs/error.log", level: "error" })],
    });

    //Creates a log file `debug.log` in `logs` folder where we store logs
    //if any debug info that we log in the app for debugging purpose,
    //the debug info will be written in that file
    this.debugLogger = createLogger({
      level: "debug",
      format: format.combine(format.timestamp(), format.json()),
      transports: [new transports.File({ filename: "logs/debug.log", level: "error" })],
    });

    //Creates a log file `info.log` in `logs` folder where we store logs
    //if any info that we might need like user created account or something
    //that we might need to reference it later, we store it in this file
    this.infoLogger = createLogger({
      level: "info",
      format: format.combine(format.timestamp(), format.json()),
      transports: [new transports.File({ filename: "logs/info.log", level: "info" })],
    });

    //Creates a log file `notfound.log` in `logs` folder wher we store logs
    //if any user visits a notfound page which returns in 404, we will store
    //the url and user info in this file. Will be helpful in identifying bots
    //and also track user experience in the frontend application
    this.notFoundLogger = createLogger({
      level: "notfound",
      format: format.combine(format.timestamp(), format.json()),
      transports: [new transports.File({ filename: "logs/notfound.log", level: "notfound" })],
    });
  }

  error(message: string, data?: unknown, printData?: boolean) {
    if (process.env.NODE_ENV === "test") return;

    this.errorLogger.error(message, printData && data);
  }

  debug(message: string, data?: unknown, printData?: boolean) {
    if (process.env.NODE_ENV === "test") return;

    this.debugLogger.debug(message, printData && data);
  }

  info(message: string, data?: unknown, printData?: boolean) {
    if (process.env.NODE_ENV === "test") return;

    this.infoLogger.info(message, printData && data);
  }

  notFound(message: string, data?: unknown, printData?: boolean) {
    if (process.env.NODE_ENV === "test") return;

    this.notFoundLogger.warn(message, printData && data);
  }
}

export default new Logger();
