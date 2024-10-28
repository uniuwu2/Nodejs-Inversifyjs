import { injectable } from "inversify";
import winston, { createLogger, format, transports, loggers } from "winston";
import WinstonDailyRotateFile from "winston-daily-rotate-file";

import { Logger } from "./logger.interface";
import moment from "moment";
const timezoned = () => {
    let now = moment();
    const bdTime = now.utcOffset(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const date = bdTime.format("YYYY-MM-DD HH:mm:ss");
    return date;
}

@injectable()
export class LoggerMod implements Logger {
    private logFormat: any;

    constructor() {
        this.logFormat = format.combine(
            format.colorize(),
            format.timestamp({
                format: timezoned,
            }),
            format.align(),
            format.printf(
                (info) => `${info.timestamp} ${info.level}: ${info.message}`
            )
        );

        this.initialize();
    }

    private initialize() {
        loggers.add("customLogger", {
            format: this.logFormat,
            exitOnError: false,
            transports: [
                new WinstonDailyRotateFile({
                    filename: "./logs/info-%DATE%.log",
                    datePattern: "YYYY-MM-DD",
                    level: "info",
                    zippedArchive: true,
                    maxSize: "20m",
                    maxFiles: "14d",
                }),
                new WinstonDailyRotateFile({
                    filename: "./logs/error-%DATE%.log",
                    datePattern: "YYYY-MM-DD",
                    level: "error",
                    zippedArchive: true,
                    maxSize: "20m",
                    maxFiles: "14d",
                }),
                new WinstonDailyRotateFile({
                    filename: "./logs/debug-%DATE%.log",
                    datePattern: "YYYY-MM-DD",
                    level: "debug",
                    zippedArchive: true,
                    maxSize: "20m",
                    maxFiles: "14d",
                }),
            ],
        });
    }

    public createLoggerConsole(): void {
        const level = process.env.NODE_ENV === "production" ? "info" : "debug";
        loggers.get("customLogger").add(
            new transports.Console({
                format: this.logFormat,
                level: level,
            })
        );
    }

    public get logger(): winston.Logger {
        return loggers.get("customLogger");
    }
    

    public info(message: any): void {
        this.logger.info(message);
    }

    public error(message: any): void {
        this.logger.error(message);
    }

    public debug(message: any): void {
        this.logger.debug(message);
    }
}