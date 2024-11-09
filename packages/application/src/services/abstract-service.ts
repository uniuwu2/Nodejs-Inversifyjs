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
    public findAll(): Promise<E[]> | undefined {
        if (this.repository != undefined) {
            return this.repository.findAll();
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

    public abstract getRepositoryName(): string;
}