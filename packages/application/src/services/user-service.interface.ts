import { User } from "@inversifyjs/domain";
import { GenericService } from "./generic-service.interface";

export interface UserService extends GenericService<User> {
    findByEmail(email: string): Promise<User> | undefined;
    createFromGoogle(profile: any): Promise<User> | undefined;
}
