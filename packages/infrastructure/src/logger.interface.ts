import winston from "winston";

export interface Logger {
    createLoggerConsole(): void;

    get logger(): winston.Logger;


    /**
     * Log the message with type information
     * @param message
     */
    info(message: any): void;

    /**
     * Log the error message
     * @param message
     */
    error(message: any): void;

    /**
     * Log the debug message
     * @param message
     */
    debug(message: any): void;
}