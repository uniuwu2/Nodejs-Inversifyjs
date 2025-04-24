import "reflect-metadata";
import { injectable } from "inversify";
import { DataSource } from "typeorm";
import { User } from "./entities/user";
import { Role } from "./entities/role";

/**
 * Datasoruce connection
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

    constructor() { }

    /**
     * Connect to database
     */
    public async connect(): Promise<void> {
        if (this._dataSource == undefined || this._dataSource.isInitialized == false) {
            this._dataSource = new DataSource({
                type: "mysql",
                host: this._host,
                port: this._port,
                username: this._username,
                password: this._password,
                database: this._database,
                synchronize: this._synchronize,
                logging: this._logging,
                entities: [User, Role]
            });

            await this._dataSource.connect();
        }
    }

    /**
     * Disconnect from database
     */

    public async disconnect(): Promise<void> {
        if (this._dataSource != undefined) {
            await this._dataSource.destroy();
        }
    }

    public getDataSource(): DataSource | undefined {
        return this._dataSource;
    }

    public get host(): string {
        return this._host;
    }

    public set host(value: string) {
        this._host = value;
    }

    public get port(): number {
        return this._port;
    }

    public set port(value: number) {
        this._port = value;
    }

    public get username(): string {
        return this._username;
    }

    public set username(value: string) {
        this._username = value;
    }

    public get password(): string {
        return this._password;
    }

    public set password(value: string) {
        this._password = value;
    }

    public get database(): string {
        return this._database;
    }

    public set database(value: string) {
        this._database = value;
    }

    public get synchronize(): boolean {
        return this._synchronize;
    }

    public set synchronize(value: boolean) {
        this._synchronize = value;
    }

    public get logging(): boolean {
        return this._logging;
    }

    public set logging(value: boolean) {
        this._logging = value;
    }
}