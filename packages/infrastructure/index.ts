import { LoggerMod } from "./src/logger";
import { Logger } from "./src/logger.interface";
import { exceptionLoggerMiddleware, requestMiddleware } from "./src/middleware/logger-middleware";
import { GenericRepository } from "./src/repositories/generic-repository.interface";
import { UserRepository } from "./src/repositories/user-repository.interface";
import { UserRepositoryImpl } from "./src/repositories/user-repository-impl";
import { verifyAuthTokenRouter, destroySession, checkPermissions } from "./src/middleware/authentication-middleware";
import { uploadMiddleware } from "./src/middleware/upload-middleware";
import { StudentRepository } from "./src/repositories/student-repository.interface";
import { StudentRepositoryImpl } from "./src/repositories/student-repository-impl";
import { RoleRepository } from "./src/repositories/role-repository.interface";
import { RoleRepositoryImpl } from "./src/repositories/role-repository-impl";
import { CourseRepository } from "./src/repositories/course-repository.interface";
import { CourseRepositoryImpl } from "./src/repositories/course-repository-impl";
import { CourseClassRepository } from "./src/repositories/course-class-repository.interface";
import { CourseClassRepositoryImpl } from "./src/repositories/course-class-repository-impl";
import { DepartmentRepository } from "./src/repositories/department-repository.interface";
import { DepartmentRepositoryImpl } from "./src/repositories/department-repository-impl";
import { ClassStudentRepository } from "./src/repositories/class-student-repository.interface";
import { ClassStudentRepositoryImpl } from "./src/repositories/class-student-repository-impl";
import { SessionClassRepository } from "./src/repositories/session-class-repository.interface";
import { SessionClassRepositoryImpl } from "./src/repositories/session-class-repository-impl";
import { AttendanceRepository } from "./src/repositories/attendance-repository.interface";
import { AttendanceRepositoryImpl } from "./src/repositories/attendance-repository-impl";
import { ActivityRepository } from "./src/repositories/activity-repository.interface";
import { ActivityRepositoryImpl } from "./src/repositories/activity-repository-impl";
import { ActivityStudentRepository } from "./src/repositories/activity-student-repository.interface";
import { ActivityStudentRepositoryImpl } from "./src/repositories/activity-student-repository-impl";
import { initSocket,  } from "./src/websocket/socket";
export { 
    LoggerMod, 
    Logger,
    exceptionLoggerMiddleware,
    requestMiddleware,
    GenericRepository,
    UserRepository,
    UserRepositoryImpl,
    verifyAuthTokenRouter,
    destroySession,
    checkPermissions,
    uploadMiddleware,
    StudentRepository,
    StudentRepositoryImpl,
    RoleRepository,
    RoleRepositoryImpl,
    CourseRepository,
    CourseRepositoryImpl,
    CourseClassRepository,
    CourseClassRepositoryImpl,
    DepartmentRepository,
    DepartmentRepositoryImpl,
    ClassStudentRepository,
    ClassStudentRepositoryImpl,
    SessionClassRepository,
    SessionClassRepositoryImpl,
    AttendanceRepository,
    AttendanceRepositoryImpl,
    ActivityRepository,
    ActivityRepositoryImpl,
    ActivityStudentRepository,
    ActivityStudentRepositoryImpl,
    initSocket,
};