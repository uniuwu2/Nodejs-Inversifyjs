import {
    Logger,
    LoggerMod
} from "@inversifyjs/infrastructure";
import { TYPES } from "@inversifyjs/application";
import { ContainerModule } from "inversify";
import { DataSourceConnection } from "@inversifyjs/domain";

import "./controllers/user-controller";
export const referenceDataIoCModule = new ContainerModule((bind) => {
    bind<Logger>(TYPES.Logger).to(LoggerMod).inSingletonScope();
    bind<DataSourceConnection>(TYPES.DataSourceConnect).to(DataSourceConnection).inSingletonScope();
})
    