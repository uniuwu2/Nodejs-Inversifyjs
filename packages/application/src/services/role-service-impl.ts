import { Role } from "@inversifyjs/domain";
import { RoleRepository } from "@inversifyjs/infrastructure";
import { injectable } from "inversify";
import { AbstractService } from "./abstract-service";
import { RoleService } from "./role-service.interface";

@injectable()
export class RoleServiceImpl extends AbstractService<Role, RoleRepository> implements RoleService {
    
    public getRepositoryName(): string {
        return "RoleRepositoryImpl";
    }
}
