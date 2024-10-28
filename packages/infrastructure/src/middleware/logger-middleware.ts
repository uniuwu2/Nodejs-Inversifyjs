import * as express from "express";
import { HttpCode } from "@inversifyjs/application";

export function requestMiddleware(request: express.Request, response: express.Response, next: () => void) {
    let requestString: string = `
        ----------------------------------
        REQUEST MIDDLEWARE
        HTTP from [${request.hostname}] [${request.method}] ${request.url}
        ----------------------------------
    `;
    //logger.debug(requestString);
    next();
}

export function exceptionLoggerMiddleware(error: Error, request: express.Request, response: express.Response, next: () => void) {
    let exceptionString: string = `
        ----------------------------------
        EXCEPTION MIDDLEWARE
        HTTP from [${request.hostname}] [${request.method}] ${request.url}
        ${error.message}
        ${error.stack}
        ----------------------------------
    `;
    // Log exception
    //logger.error(exceptionString);

    // Hide stack from client for security reasons
    const e = { error: "Internal server error" };
    response.status(HttpCode.INTERNAL_SERVER_ERROR).json(e);
}
