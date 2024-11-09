import { GenericEntity } from "@inversifyjs/domain";

export interface GenericService<E extends GenericEntity> {
    hasEntity(entity: E): boolean;
    findAll(): Promise<E[]> | undefined;
    findById(id: number, relations?: string[]): Promise<E> | undefined;
    findManyById(ids: number[]): Promise<E[]> | undefined;
    count(): Promise<number>;
    create(): E | undefined;
    save(entity: E): Promise<E> | undefined;
    update(id: number, entity: E): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}
