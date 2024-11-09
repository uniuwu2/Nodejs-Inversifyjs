import { DataSourceConnection, GenericEntity } from "@inversifyjs/domain";
import { TYPES } from "@inversifyjs/application";
import { inject } from "inversify";
import { Logger } from "../logger.interface";
import { GenericRepository } from "./generic-repository.interface";
import { EntityManager, EntityTarget, FindOneOptions, FindOptionsWhere, In, QueryRunner, Repository } from "typeorm";

/**
 * Base Repository for all repositories
 */
export abstract class AbstractRepository<E extends GenericEntity> implements GenericRepository<E> {
    /**
     * Logger to log
     */
    protected logger: Logger | undefined;

    /**
     * TypeORM repository to handle the database actions
     */
    protected repository: Repository<E> | undefined;

    constructor(@inject(TYPES.Logger) logger: Logger, @inject(TYPES.DataSourceConnect) dataSourceConnection: DataSourceConnection) {
        this.logger = logger;
        let dsConnection = dataSourceConnection.getDataSource();
        if (dsConnection != undefined) {
            this.repository = dsConnection.getRepository(this.getEntityType());
        }
    }

    public hasEntity(entity: E): boolean {
        if (this.repository != undefined) {
            return this.repository.hasId(entity);
        }
        return false;
    }

    public findAll(): Promise<E[]> | undefined {
        if (this.repository != undefined) {
            return this.repository.find();
        }
        return undefined;
    }

    public findById(id: number, relations?: string[]): Promise<E> | undefined {
        if (this.repository != undefined) {
            return this.repository.findOne({ where: { id }, relations } as FindOneOptions<E>).then((res) => {
                if (res == null) {
                    return undefined;
                }
                return res
            }).catch((err) => err);
        }
        return undefined;
    }
    public findManyById(ids: number[]): Promise<E[]> | undefined {
        if (this.repository != undefined) {
            let retValue: Promise<E[] | null> = this.repository.find({
                where: { id: In(ids) } as FindOptionsWhere<E>,
            });
            if (retValue == null) {
                return undefined;
            }
        }
        return undefined;
    }
    public count(): Promise<number> {
        if (this.repository != undefined) {
            return this.repository.count();
        }
        return Promise.resolve(0);
    }

    public create(): E | undefined {
        if (this.repository != undefined) {
            return this.repository.create();
        }
        return undefined;
    }

    public save(entity: E): Promise<E> | undefined {
        if (this.repository != undefined) {
            return this.repository.save(entity);
        }
        return undefined;
    }
    public update(id: number, entity: E): Promise<boolean> {
        //TODO
        if (this.repository != undefined) {
            //    let retValue = this.repository.update(entity);
        }

        return Promise.resolve(true);
    }
    public delete(id: number): Promise<boolean> {
        if (this.repository != undefined) {
            let retValue = this.repository.delete(id).then((v) => {
                if (v.affected == null || v.affected == undefined) return undefined;
            });
            if (retValue != undefined) {
                return Promise.resolve(true);
            }
        }
        return Promise.resolve(false);
    }

    public abstract getEntityType(): any;
    public abstract getRepositoryName(): string;
}