import {
    Logger,
    LoggerMod
} from "@inversifyjs/infrastructure";
import { RouteHelper, TYPES } from "@inversifyjs/application";
import { ContainerModule } from "inversify";
import { DataSourceConnection } from "@inversifyjs/domain";
import { 
    UserRepository,
    UserRepositoryImpl,
} from "@inversifyjs/infrastructure"; 
import { 
    UserService,
    UserServiceImpl,
 } from "@inversifyjs/application";    
import "./controllers/admin/user-controller";
export const referenceDataIoCModule = new ContainerModule((bind) => {
    bind<Logger>(TYPES.Logger).to(LoggerMod).inSingletonScope();
    bind<DataSourceConnection>(TYPES.DataSourceConnect).to(DataSourceConnection).inSingletonScope();
    bind<UserRepository>(TYPES.Repository).to(UserRepositoryImpl).inSingletonScope();
    bind<UserService>(TYPES.UserService).to(UserServiceImpl).inSingletonScope();
    bind<RouteHelper>(TYPES.RouteHelper).to(RouteHelper).inSingletonScope();
    
})
    