import { Role } from "@inversifyjs/domain";
import { injectable } from "inversify";
import { AbstractRepository } from "./abstract-repository";
import { RoleRepository } from "./role-repository.interface";

/**
 * User Repository
 */
@injectable()
export class RoleRepositoryImpl extends AbstractRepository<Role> implements RoleRepository {
    public getEntityType(): any {
        return Role;
    }

    public getRepositoryName(): string {
        return "RoleRepositoryImpl";
    }
}
