import { User } from "@inversifyjs/domain";
import { injectable } from "inversify";
import { FindOptionsWhere } from "typeorm";
import { AbstractRepository } from "./abstract-repository";
import { UserRepository } from "./user-repository.interface";

/**
 * User Repository
 */
@injectable()
export class UserRepositoryImpl extends AbstractRepository<User> implements UserRepository {

    public getEntityType(): any {
        return User;
    }

    public getRepositoryName(): string {
        return "UserRepositoryImpl";
    }
}
