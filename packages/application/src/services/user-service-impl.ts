import { User } from "@inversifyjs/domain";
import { UserRepository } from "@inversifyjs/infrastructure";
import { injectable } from "inversify";
import { Like } from "typeorm";
import { Variables } from "../constants/variables";

import { AbstractService } from "./abstract-service";
import { UserService } from "./user-service.interface";

@injectable()
export class UserServiceImpl extends AbstractService<User, UserRepository> implements UserService {
    public getRepositoryName(): string {
        return "UserRepositoryImpl";
    }

}
