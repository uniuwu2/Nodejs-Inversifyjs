import { GenericEntity } from "@inversifyjs/domain";

export interface GenericService<E extends GenericEntity> {
    hasEntity(entity: E): boolean;
    findAll(relations?: string[], where?: any, order?: any): Promise<E[]> | undefined;
    findById(id: number, relations?: string[]): Promise<E> | undefined;
    findManyById(ids: number[]): Promise<E[]> | undefined;
    count(): Promise<number>;
    create(): E | undefined;
    save(entity: E): Promise<E> | undefined;
    saveMulti(entities: E[]): Promise<E[]> | undefined;
    update(id: number, entity: E): Promise<boolean>;
    delete(id: number): Promise<boolean>;
    deleteMulti(entities: E[]): Promise<boolean>;
    findOneById(id: number): Promise<E> | undefined;
    findByStatus(status: number, relation?: string[]): Promise<E[]> | undefined;
    findAndCount(
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
        | undefined;

    find(
        relations?: string[],
        where?: any,
        order?: any,
        take?: number
    ): Promise<E[]> | undefined;
}
