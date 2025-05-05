import { User } from "@inversifyjs/domain";
import { UserRepository } from "@inversifyjs/infrastructure";
import { injectable } from "inversify";
import { AbstractService } from "./abstract-service";
import { UserService } from "./user-service.interface";
import { Variables } from "../constants/variables";
import { Like } from "typeorm";
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

    public findStudentByTeacherId(teacherId: number): Promise<User[]> | undefined {
        if (!this.repository) return undefined;

        return this.repository
            .createQueryBuilder("user")
            .innerJoin("class_student", "cs", "cs.student_id = user.id")
            .innerJoin("course_class", "cc", "cs.course_class_id = cc.id")
            .where("cc.teacher_id = :teacherId", { teacherId })
            .andWhere("user.role_id = :roleId", { roleId: 4 }) // 4 = student
            .groupBy("user.id")
            .addGroupBy("user.firstName")
            .addGroupBy("user.lastName")
            .addGroupBy("user.email")
            .addGroupBy("user.phoneNumber")
            .getMany();
    }

    public showUserList(
        roleId: any,
        valid: any,
        name: any,
        page: any,
        limitedItem: number,
        sortBy: any,
        sort: any
        // isSuperAdmin: boolean
    ):
        | Promise<{
              list: User[];
              total: number;
              page: number;
              pageSize: number;
          }>
        | undefined {
        let firstName = name?.toLowerCase().split(" ")[0];
        let lastName = name?.toLowerCase().split(" ")[1];

        if (sortBy) {
            this.order = { [sortBy]: sort };
        }
        this.where = [
            { firstName: Like(`%${firstName}%`), ...(roleId !== Variables.ALL && { roleId: roleId }), ...(valid !== Variables.ALL && { active: valid }) },
            { lastName: Like(`%${firstName}%`), ...(roleId !== Variables.ALL && { roleId: roleId }), ...(valid !== Variables.ALL && { active: valid }) },
        ];
        return this.repository?.findAndCount(["role"], (name || roleId) && this.where, page && { take: limitedItem, page }, sortBy && this.order)?.then((item: any) => {
            return {
                list: item.list,
                total: item.count,
                page: item.page,
                pageSize: item.pageSize,
            };
        }) as Promise<{
            list: User[];
            total: number;
            page: number;
            pageSize: number;
        }>;
    }

    public getAllTeacher(): Promise<User[]> | undefined {
        if (this.repository) {
            return this.repository.findByFieldName({ roleId: 2 });
        }
        return undefined;
    }

    public getRepositoryName(): string {
        return "UserRepositoryImpl";
    }
}
