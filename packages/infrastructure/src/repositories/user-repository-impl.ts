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
    public findOneByFieldName(fieldName: any): Promise<User> | undefined {
        if (this.repository != undefined) {
            return this.repository
                .findOne({
                    where: { ...fieldName },
                    relations: ["role"],
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

    public createQueryBuilder(alias: string) {
        if (!this.repository) throw new Error("Repository not initialized");
        return this.repository.createQueryBuilder(alias);
      }
    
    
    public getEntityType(): any {
        return User;
    }

    public getRepositoryName(): string {
        return "UserRepositoryImpl";
    }
}
