export interface GenericRepository<E> {
    /**
     * Verify the entity exists or not
     */
    hasEntity(entity: E): boolean;

    /**
     * Find all the items
     */
    findAll(relations?: string[], where?: any, order?: any): Promise<E[]> | undefined;
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

    /**
     * Find item by id number
     * @param id -> indentify number
     */
    findById(id: number, relations?: string[]): Promise<E> | undefined;
    findManyById(ids: number[]): Promise<E[]> | undefined;
    findOneById(id: number): Promise<E> | undefined;
    findByStatus(status: number, relation?: string[]): Promise<E[]> | undefined;
    count(): Promise<number>;
    create(): E | undefined;
    save(entity: E): Promise<E> | undefined;
    createMulti(entities: E[]): E[] | undefined;
    saveMulti(entities: E[]): Promise<E[]> | undefined;
    update(id: number, entity: E): Promise<boolean>;
    delete(id: number): Promise<boolean>;
    deleteMulti(entities: E[]): Promise<boolean>;

    /**
     * Find item by field Name
     * @param fieldName -> fieldName {field : value}
     */
    findOneByFieldName(fieldName: any, relations?: string[]): Promise<E> | undefined;

    /**
     * Keep the repository name for the pattern
     */
    getRepositoryName(): string;
    deleteBy(fieldName: any): Promise<boolean>;
}
