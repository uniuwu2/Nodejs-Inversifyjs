import { DataSourceConnection, GenericEntity } from "@inversifyjs/domain";
import { TYPES, Variables } from "@inversifyjs/application";
import { EntityManager, EntityTarget, FindOneOptions, FindOptionsWhere, In, QueryRunner, Repository } from "typeorm";
import { inject, injectable } from "inversify";
import { Logger } from "../logger.interface";
import { GenericRepository } from "./generic-repository.interface";

/**
 * Base Repository for all repository classes inherit
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

    /**
     * TypeOR entity manager to handle database query actions
     */
    protected entityManager: EntityManager | undefined;

    constructor(@inject(TYPES.Logger) logger: Logger, @inject(TYPES.DataSourceConnect) dataSource: DataSourceConnection) {
        this.logger = logger;
        let dsConnection = dataSource.getDataSource();
        if (dsConnection !== undefined) {
            this.repository = dsConnection.getRepository(this.getEntityType());
            this.entityManager = dsConnection.manager;
        }
    }

    public hasEntity(entity: E): boolean {
        if (this.repository != undefined) {
            return this.repository.hasId(entity);
        }
        return false;
    }

    public findAll(relations?: string[], where?: any, order?: any): Promise<E[]> | undefined {
        if (this.repository != undefined) {
            return this.repository.find({ relations, where, order });
        }
        return undefined;
    }

    public findAndCount(
        relations?: string[],
        where?: any,
        pagination: { take: number; page: number } = { take: Number(process.env.LIMITED_ITEM_DISPLAY!), page: Variables.PAGE },
        order?: any
    ):
        | Promise<{
              list: E[];
              count: number;
              page: number;
              pageSize: number;
          }>
        | undefined {
        if (this.repository != undefined) {
            const resultValue = this.repository
                .findAndCount({ relations, where, take: pagination.take, skip: (pagination.page - 1) * pagination.take, order })
                .then(([value, count]) => {
                    return {
                        list: value,
                        count,
                        page: pagination.take,
                        pageSize: pagination.page,
                    };
                })
                .catch((err) => err);
            if (!resultValue) return undefined;
            return resultValue;
        }
        return undefined;
    }

    public findOneByFieldName(fieldName: any, relations?: string[]): Promise<E> | undefined {
        if (this.repository != undefined) {
            return this.repository
                .findOne({
                    where: { ...fieldName },
                    relations,
                })
                .then((res: any) => {
                    if (res == null) {
                        return undefined;
                    }
                    return res;
                })
                .catch((err: any) => err);
        }
        return undefined;
    }

    public updateById(id: number, fieldName: any): Promise<E> | undefined {
        if (this.repository != undefined) {
            return this.repository
                .update(id, fieldName)
                .then((res) => {
                    if (res.affected == null || res.affected == undefined) return undefined;
                    return this.findOneById(id);
                })
                .catch((err) => err);
        }
        return undefined;
    }

    public deleteById(id: number): Promise<E> | undefined {
        if (this.repository != undefined) {
            return this.repository
                .delete(id)
                .then((res) => {
                    if (res.affected == null || res.affected == undefined) return undefined;
                    return this.findOneById(id);
                })
                .catch((err) => err);
        }
        return undefined;
    }

    public findOneById(id: number): Promise<E> | undefined {
        if (this.repository != undefined) {
            return this.repository
                .findOne({ where: { id } } as FindOneOptions<E>)
                .then((res) => {
                    if (res == null) {
                        return undefined;
                    }
                    return res;
                })
                .catch((err) => err);
        }
        return undefined;
    }

    public findOne(
        relations?: string[],
        where?: any,
        order?: any,
    ): Promise<E> | undefined {
        if (this.repository != undefined) {
            return this.repository
                .findOne({ relations, where, order } as FindOneOptions<E>)
                .then((res) => {
                    if (res == null) {
                        return undefined;
                    }
                    return res;
                })
                .catch((err) => err);
        }
        return undefined;
    }

    public findByStatus(status: number, relation?: string[]): Promise<E[]> | undefined {
        if (this.repository != undefined) {
            return this.repository
                .find({ where: { status: status }, relation } as unknown as FindOneOptions<E>)
                .then((res) => {
                    return res;
                })
                .catch((err) => err);
        }
        return undefined;
    }

    public findById(id: number, relations?: string[]): Promise<E> | undefined {
        if (this.repository != undefined) {
            return this.repository
                .findOne({ where: { id }, relations } as FindOneOptions<E>)
                .then((res: any) => {
                    if (res == null) {
                        return undefined;
                    }
                    return res;
                })
                .catch((err: any) => err);
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

    public findByFieldName(fieldName: any, relations?: string[]): Promise<E[]> | undefined {
        if (this.repository != undefined) {
            return this.repository
                .find({ where: { ...fieldName }, relations } as unknown as FindOneOptions<E>)
                .then((res) => {
                    return res;
                })
                .catch((err) => err);
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

    public save(entity?: E): Promise<E> | undefined {
        if (this.repository != undefined && entity) {
            return this.repository.save(entity);
        }
        return undefined;
    }

    public createMulti(entities: E[]): E[] | undefined {
        if (this.repository != undefined && entities) {
            return this.repository.create(entities);
        }
        return undefined;
    }

    public saveMulti(entities: E[]): Promise<E[]> | undefined {
        if (this.repository != undefined && entities) {
            return this.repository.save(entities);
        }
        return undefined;
    }

    public update(id: number, entity: E): Promise<boolean> {
        if (this.repository != undefined) {
            this.findOneById(id)?.then((item) => {
                this.save(entity);
            });
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }
    public delete(id: number): Promise<boolean> {
        if (this.repository != undefined) {
            let retValue = this.repository
                .delete(id)
                .then((v) => {
                    if (v.affected == null || v.affected == undefined) return undefined;
                })
                .catch((error: any) => this.repository?.delete(id));
            if (retValue != undefined) {
                return Promise.resolve(true);
            }
        }
        return Promise.resolve(false);
    }

    public deleteBy(fieldName: any): Promise<boolean> {
        if (this.repository != undefined) {
            let retValue = this.repository
                .delete(fieldName)
                .then((v) => {
                    if (v.affected == null || v.affected == undefined) return undefined;
                })
                .catch((error: any) => this.repository?.delete(fieldName));
            if (retValue != undefined) {
                return Promise.resolve(true);
            }
        }
        return Promise.resolve(false);
    }

    public deleteMulti(entities: E[]): Promise<boolean> {
        //TO DO:
        if (this.repository != undefined) {
            this.repository.remove(entities);
        }
        return Promise.resolve(true);
    }

    public find(
        relations?: string[],
        where?: any,
        order?: any,
        take?: number,
    ): Promise<E[]> | undefined {
        if (this.repository != undefined) {
            return this.repository.find({ relations, where, order, take });
        }
        return undefined;
    }

    public abstract getEntityType(): any;
    public abstract getRepositoryName(): string;
}
