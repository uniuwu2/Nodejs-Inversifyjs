import "reflect-metadata";
import { Container, ContainerModule } from "inversify";
import { TYPES, Variables } from "@inversifyjs/application";
import { Logger, exceptionLoggerMiddleware } from "@inversifyjs/infrastructure";
import * as express from "express";
import session from "express-session";
import * as bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import { cookies, InversifyExpressServer } from "inversify-express-utils";
import { DataSourceConnection } from "@inversifyjs/domain";
import { Repository, getRepository, LessThanOrEqual } from "typeorm";
import { TypeormStore } from "connect-typeorm";
export async function bootstrap(container: Container, appPort: any, appPath: any, ...modules: ContainerModule[]) {
    if (container.isBound(TYPES.App) == false) {
        container.load(...modules);

        /* Inject Logger for logging (info, error, debug) */
        const loggerFactory = container.get<Logger>(TYPES.Logger);
        loggerFactory.createLoggerConsole();
        const logger = loggerFactory.logger;
        logger.info("Logger is initialized");

        const router = express.Router({
            caseSensitive: false,
            mergeParams: false,
            strict: false
        });

        /* Inject DataSourceConnection for database connection */
        const dataSourceConnection = container.get<DataSourceConnection>(TYPES.DataSourceConnect);
        logger.info("Datasource is connecting...");
        dataSourceConnection.host = process.env.DB_HOST || "localhost";
        dataSourceConnection.port = Number.parseInt(process.env.DB_PORT ? process.env.DB_PORT : "3306");
        dataSourceConnection.username = process.env.DB_USER || "";
        dataSourceConnection.password = process.env.DB_PASS || "";
        dataSourceConnection.database = process.env.DB_NAME || "";
        dataSourceConnection.synchronize = process.env.DB_SYNC == "true";
        dataSourceConnection.logging = process.env.DB_LOG == "true";
        await dataSourceConnection.connect();
        logger.info("Datasource is connected");

        logger.info("Initialized inversify express server...");
        const server = new InversifyExpressServer(container);

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
            app.set("view engine", "ejs");
            app.engine("ejs", require("ejs").__express);

            app.set("views", process.env.VIEW_PATH + "/pages");
            app.use(express.static(process.env.VIEW_PATH + "/public"));

            app.use(bodyParser.urlencoded({ extended: true }));
            app.use(bodyParser.json());

            app.use(cors());
            app.options("*", cors());

            app.on("close", function () {
                console.log("Closing server...");
            });

        });

        logger.info("Binding server to port: " + appPort);

        server.setErrorConfig((app: any) => {
            app.use(exceptionLoggerMiddleware);
        });

        setInterval(removeExpiredSessions, Variables.TOKEN_LIFETIME);

        async function removeExpiredSessions() {
            const now = new Date().getTime();
            await sessionRepository.delete({ expiredAt: LessThanOrEqual(now) });
        }

        const app = server.build();
        app.listen(appPort);
        logger.info("Server started on port: " + appPort);

        container.bind<express.Application>(TYPES.App).toConstantValue(app);
        return app;
    } else {
        return container.get<express.Application>(TYPES.App);
    }
}