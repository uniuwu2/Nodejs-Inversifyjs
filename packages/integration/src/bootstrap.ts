import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
import { TYPES, Variables } from "@inversifyjs/application";
import { InversifyExpressServer } from "inversify-express-utils";
import * as express from "express";
import * as session from "express-session";
import * as bodyParser from "body-parser";
import { exceptionLoggerMiddleware, Logger } from "@inversifyjs/infrastructure";
import * as cors from "cors";
import { DataSourceConnection,  } from "@inversifyjs/domain";
import * as cookieParser from "cookie-parser";
import { Repository, getRepository, LessThanOrEqual } from "typeorm";
import { TypeormStore } from "connect-typeorm";
const passport = require("passport");

import { serializeUser, initializePassport } from "./auth-passport";
export async function bootstrap(container: Container, appPort: any, appPath: any, ...modules: ContainerModule[]) {
    if (container.isBound(TYPES.App) == false) {
        container.load(...modules);

        /** Inject logger for logging (info, debug, error) bootstrap */
        const loggerFactory = container.get<Logger>(TYPES.Logger);
        loggerFactory.createLoggerConsole();
        const logger = loggerFactory.logger;
        logger.info("Router is configured ...");

        const router = express.Router({
            caseSensitive: false,
            mergeParams: false,
            strict: false,
        });

        logger.info("Initialized database connection ...");
        let dsConnection = container.get<DataSourceConnection>(TYPES.DataSourceConnect);
        logger.info("Datasource is connecting ...");
        dsConnection.host = process.env.DB_HOST || "localhost";
        dsConnection.port = Number.parseInt(process.env.DATABASE_PORT ? process.env.DATABASE_PORT : "3306");
        dsConnection.database = process.env.DB_NAME || "";
        dsConnection.username = process.env.DB_USER || "";
        dsConnection.password = process.env.DB_PASS || "";
        dsConnection.logging = process.env.DB_LOG == "true";
        dsConnection.synchronize = process.env.DB_SYNC == "true";
        await dsConnection.connect();
        logger.info("Datasource connected.");

        logger.info("Initialized inversify express server ...");
        const server = new InversifyExpressServer(container, router);

        let ds = container.get<DataSourceConnection>(TYPES.DataSourceConnect).getDataSource();
        let sessionRepository: any = ds?.getRepository("session");

        const sessionStore = new TypeormStore().connect(sessionRepository);

        server.setConfig((app: any) => {
            app.set("etag", false);
            app.use(cookieParser());
            app.use(
                session({
                    secret: process.env.ENCRYPT_KEY!,
                    resave: false,
                    saveUninitialized: false,
                    cookie: { httpOnly: false },
                    store: sessionStore,
                })
            );

            serializeUser();
            initializePassport();
            app.use(passport.initialize());
            app.use(passport.session());
            // set ejs
            app.set("view engine", "ejs");
            app.engine("ejs", require("ejs").__express);

            app.set("views", process.env.VIEW_PATH + "/pages");
            app.use(express.static(process.env.VIEW_PATH + "/public"));

            // set others
            app.use(bodyParser.urlencoded({ extended: true }));
            app.use(bodyParser.json());
            // app.use(helmet());
            
            // Enable CORS
            app.use(cors({
                origin: ['http://localhost:8081', 'exp://localhost:8081'],
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization'],
                credentials: true
            }));
            app.options("*", cors());

            app.on("close", function () {
                console.log("Stopping ...");
            });
        });
        logger.info("Inversify express server is configured.");

        server.setErrorConfig((app) => {
            app.use(exceptionLoggerMiddleware);
        });

        setInterval(removeExpiredTokens, Variables.TOKEN_LIFETIME);

        async function removeExpiredTokens() {
            const now = new Date().getTime();
            await sessionRepository.delete({ expiredAt: LessThanOrEqual(now) });
        }

        const app = server.build();
        app.listen(appPort);
        logger.info(`Application listening on port ${appPort}...`);

        container.bind<express.Application>(TYPES.App).toConstantValue(app);
        return app;
    } else {
        return container.get<express.Application>(TYPES.App);
    }
}
