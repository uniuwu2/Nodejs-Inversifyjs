import { User } from "@inversifyjs/domain";
import { UserRepository } from "@inversifyjs/infrastructure";
import { injectable } from "inversify";
import { Like } from "typeorm";
import { Variables } from "../constants/variables";

import { AbstractService } from "./abstract-service";
import { UserService } from "./user-service.interface";

@injectable()
export class UserServiceImpl extends AbstractService<User, UserRepository> implements UserService {

    public findByEmail(email: string): Promise<User> | undefined {
        if (this.repository != undefined) {
            return this.repository.findOneByFieldName({ email });
        }
        return undefined;
    }

    public createFromGoogle(profile: any): Promise<User> | undefined {
        if (this.repository != undefined) {
            let user = this.repository.create();
            if (user) {
                user.email = profile.emails[0].value;
                user.firstName = profile._json.given_name;
                user.lastName = profile._json.family_name;
                user.roleId = 3;
                user.active = 1;
                user.oauthId = profile.id;
                user.oauthProvider = profile.provider;
                return this.repository.save(user);
            }
        }
        return undefined;
    }

    public getRepositoryName(): string {
        return "UserRepositoryImpl";
    }

}
