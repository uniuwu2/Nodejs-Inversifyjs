import { Role } from "@inversifyjs/domain";
import { GenericRepository } from "./generic-repository.interface";

export interface RoleRepository extends GenericRepository<Role> {
}
