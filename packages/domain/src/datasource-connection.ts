import "reflect-metadata";
import { injectable } from "inversify";
import { DataSource } from "typeorm";
import { User } from "./entities/user";
import { Role } from "./entities/role";
import { Student } from "./entities/student";
import { Staff } from "./entities/staff";
import { Activity } from "./entities/activity";
import { ActivityStudent } from "./entities/activity_student";
import { CourseClass } from "./entities/course_class";
import { Course } from "./entities/course";
import { SessionClass } from "./entities/session_class";
import { ClassStudent } from "./entities/class_student";
import { Attendance } from "./entities/attendance";
import { Session } from "./entities/session";

/**
 * Datasource connection
 */
@injectable()
export class DataSourceConnection {
    private _dataSource: DataSource | undefined;

    private _host: string = "localhost";
    private _port: number = 3306;
    private _username: string = "";
    private _password: string = "";
    private _database: string = "";
    private _synchronize: boolean = true;
    private _logging: boolean = true;

    constructor() {}

    /**
     * Connect to database
     */
    public async connect(): Promise<void> {
        if (this._dataSource == undefined || this._dataSource.isInitialized == false) {
            this._dataSource = new DataSource({
                type: "mysql",
                host: this.host,
                port: this.port,
                username: this.username,
                password: this.password,
                database: this.database,
                synchronize: this.synchronize,
                // logging: true,
                entities: [User, Role, Student, Staff, Activity, ActivityStudent, CourseClass, Course, SessionClass, ClassStudent, Attendance, Session],
            });
            await this._dataSource.initialize();
        }
    }

    /**
     * Disconnect database and destroy
     */
    public async disconnect(): Promise<void> {
        if (this._dataSource !== undefined) {
            await this._dataSource.destroy();
        }
    }

    public getDataSource(): DataSource | undefined {
        return this._dataSource;
    }

    public get host(): string {
        return this._host;
    }

    public set host(v: string) {
        this._host = v;
    }

    public get port(): number {
        return this._port;
    }

    public set port(v: number) {
        this._port = v;
    }

    public get username(): string {
        return this._username;
    }

    public set username(v: string) {
        this._username = v;
    }

    public get password(): string {
        return this._password;
    }

    public set password(v: string) {
        this._password = v;
    }

    public get database(): string {
        return this._database;
    }

    public set database(v: string) {
        this._database = v;
    }

    public get synchronize(): boolean {
        return this._synchronize;
    }

    public set synchronize(v: boolean) {
        this._synchronize = v;
    }
    public get logging(): boolean {
        return this._logging;
    }

    public set logging(v: boolean) {
        this._logging = v;
    }
}