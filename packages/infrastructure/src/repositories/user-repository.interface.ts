import { User } from "@inversifyjs/domain";
import { GenericRepository } from "./generic-repository.interface";

export interface UserRepository extends GenericRepository<User> {
    findOneByFieldName(fieldName: any): Promise<User> | undefined;
    createQueryBuilder(alias: string): any;
}
