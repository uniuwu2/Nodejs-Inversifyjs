import { User } from "@inversifyjs/domain";
import { GenericRepository } from "./generic-repository.interface";

export interface UserRepository extends GenericRepository<User> {
    
}
