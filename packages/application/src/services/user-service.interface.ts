import { User } from "@inversifyjs/domain";
import { GenericService } from "./generic-service.interface";

export interface UserService extends GenericService<User> {
    
}
