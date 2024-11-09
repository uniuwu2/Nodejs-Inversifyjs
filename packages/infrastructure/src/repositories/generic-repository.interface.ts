export interface GenericRepository<E> {
    /**
     * Verify the entity exists or not
     */
    hasEntity(entity: E): boolean;

    /**
     * Find all the items
     */
    findAll(): Promise<E[]> | undefined;

    /**
     * Find item by id number
     * @param id -> indentify number
     */
    findById(id: number, relations?: string[]): Promise<E> | undefined;

    /**
     * Find items by id number
     * @param ids
     */
    findManyById(ids: number[]): Promise<E[]> | undefined;

    /**
     * Count the number of items
     * @returns number of items
     */
    count(): Promise<number>;
    create(): E | undefined;
    save(entity: E): Promise<E> | undefined;
    update(id: number, entity: E): Promise<boolean>;
    delete(id: number): Promise<boolean>;

    /**
     * Keep the repository name for the pattern
     */
    getRepositoryName(): string;
}