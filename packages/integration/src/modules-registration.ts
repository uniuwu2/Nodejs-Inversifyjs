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
    StudentRepository,
    StudentRepositoryImpl,
    RoleRepository,
    RoleRepositoryImpl,
    CourseRepository,
    CourseRepositoryImpl,
    CourseClassRepository,
    CourseClassRepositoryImpl,
} from "@inversifyjs/infrastructure"; 
import { 
    UserService,
    UserServiceImpl,
    StudentService,
    StudentServiceImpl,
    RoleService,
    RoleServiceImpl,
    CourseService,
    CourseServiceImpl,
    CourseClassService,
    CourseClassServiceImpl,
 } from "@inversifyjs/application";    

/** import controller */
import "./controllers/home.controller";
import "./controllers/user.controller";
import "./controllers/login.controller";
import "./controllers/logout.controller";
import "./controllers/classroom.controller";
export const referenceDataIoCModule = new ContainerModule((bind) => {
    bind<Logger>(TYPES.Logger).to(LoggerMod).inSingletonScope();
    bind<DataSourceConnection>(TYPES.DataSourceConnect).to(DataSourceConnection).inSingletonScope();
    bind<UserRepository>(TYPES.Repository).to(UserRepositoryImpl).inSingletonScope();
    bind<UserService>(TYPES.UserService).to(UserServiceImpl).inSingletonScope();
    bind<RouteHelper>(TYPES.RouteHelper).to(RouteHelper).inSingletonScope();
    bind<StudentRepository>(TYPES.Repository).to(StudentRepositoryImpl).inSingletonScope();
    bind<StudentService>(TYPES.StudentService).to(StudentServiceImpl).inSingletonScope();
    bind<RoleRepository>(TYPES.Repository).to(RoleRepositoryImpl).inSingletonScope();
    bind<RoleService>(TYPES.RoleService).to(RoleServiceImpl).inSingletonScope();
    bind<CourseRepository>(TYPES.Repository).to(CourseRepositoryImpl).inSingletonScope();
    bind<CourseService>(TYPES.CourseService).to(CourseServiceImpl).inSingletonScope();
    bind<CourseClassRepository>(TYPES.Repository).to(CourseClassRepositoryImpl).inSingletonScope();
    bind<CourseClassService>(TYPES.CourseClassService).to(CourseClassServiceImpl).inSingletonScope();
});