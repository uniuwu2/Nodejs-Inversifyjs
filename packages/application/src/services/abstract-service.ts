import { GenericEntity } from "@inversifyjs/domain";
import { GenericRepository, Logger } from "@inversifyjs/infrastructure";
import { inject, multiInject } from "inversify";
import { TYPES } from "../constants/types";
import { GenericService } from "./generic-service.interface";

export abstract class AbstractService<E extends GenericEntity, R extends GenericRepository<E>> implements GenericService<E> {
    protected logger: Logger | undefined;
    /**
     * Dynamic Repository which handled by DataSource
     */
    public repository: R | undefined;
    public where: any = {};
    public order: any = {};

    constructor(@inject(TYPES.Logger) logger: Logger, @multiInject(TYPES.Repository) repositories: GenericRepository<E>[]) {
        this.logger = logger;
        logger.info("Retrieved Repository from Datasource");
        this.repository = repositories.find((v) => v.getRepositoryName() == this.getRepositoryName()) as R;
    }

    public hasEntity(entity: E): boolean {
        if (this.repository != undefined) {
            return this.repository.hasEntity(entity);
        }
        return false;
    }

    public findOneById(id: number): Promise<E> | undefined {
        if (this.repository != undefined) {
            return this.repository.findOneById(id);
        }
        return undefined;
    }

    public findByStatus(status: number, relation?: string[]): Promise<E[]> | undefined {
        if (this.repository != undefined) {
            return this.repository.findByStatus(status, relation);
        }
        return undefined;
    }

    public findAll(relations?: string[], where?: any, order?: any): Promise<E[]> | undefined {
        if (this.repository != undefined) {
            return this.repository.findAll(relations, where, order);
        }
    }

    public findAndCount(
        relations?: string[],
        where?: any,
        pagination?: { take: number; page: number },
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
            return this.repository.findAndCount(relations, where, pagination, order);
        }
    }

    public findById(id: number, relations?: string[]): Promise<E> | undefined {
        if (this.repository != undefined) {
            return this.repository.findById(id, relations);
        }
        return undefined;
    }
    public findManyById(ids: number[]): Promise<E[]> | undefined {
        if (this.repository != undefined) {
            return this.repository.findManyById(ids);
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

    public saveMulti(entities: E[]): Promise<E[]> | undefined {
        if (this.repository != undefined) {
            return this.repository.saveMulti(entities);
        }
        return undefined;
    }

    public update(id: number, entity: E): Promise<boolean> {
        if (this.repository != undefined) {
            return this.repository.update(id, entity);
        }
        return Promise.resolve(false);
    }

    public delete(id: number): Promise<boolean> {
        if (this.repository != undefined) {
            return this.repository.delete(id);
        }
        return Promise.resolve(false);
    }
    public deleteMulti(entities: E[]): Promise<boolean> {
        if (this.repository != undefined) {
            return this.repository.deleteMulti(entities);
        }
        return Promise.resolve(true);
    }

    public abstract getRepositoryName(): string;
}
