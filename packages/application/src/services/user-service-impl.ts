import { User } from "@inversifyjs/domain";
import { UserRepository } from "@inversifyjs/infrastructure";
import { injectable } from "inversify";
import { AbstractService } from "./abstract-service";
import { UserService } from "./user-service.interface";
import { Variables } from "../constants/variables";
import { Brackets, In, Like } from "typeorm";
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
                user.roleId = 4;
                user.active = 1;
                user.oauthId = profile.id;
                user.oauthProvider = profile.provider;
                user.departmentId = null;
                return this.repository.save(user);
            }
        }
        return undefined;
    }

    public createFromReactNative(
        name: string,
        email: string,
        picture: string,
        givenName: string,
        familyName: string
    ): Promise<User> | undefined {
        if (this.repository != undefined) {
            let user = this.repository.create();
            if (user) {
                user.email = email;
                user.firstName = givenName;
                user.lastName = familyName;
                user.roleId = 4; // Assuming 4 is the role ID for students
                user.active = 1;
                user.oauthId = null; // No OAuth ID for React Native login
                user.oauthProvider = null; // No OAuth provider for React Native login
                user.departmentId = null; // Assuming no department for now
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
        return this.repository?.findAndCount(["role"], 
            (name || roleId) && this.where,
            page && { take: limitedItem, page }, 
            sortBy && this.order)?.then((item: any) => {
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

    public getTeacherByEmail(email: string): Promise<User> | undefined {
        if (this.repository) {
            return this.repository.findOneByFieldName({ email, roleId: 2 });
        }
        return undefined;
    }

    public getStaffList(): Promise<User[]> | undefined {
        if (this.repository) {
            return this.repository.findByFieldName({ roleId: In([1,3])}); // Assuming 1 is super admin and 3 is staff
        }
        return undefined;
    }

    public findStudentBySelect2(search: string, departmentId?: number, currentStudentIdList?: number[]): Promise<User[]> | undefined {
        if (this.repository) {
            search = search?.trim();
            let query = this.repository
                .createQueryBuilder("user")
                .select(["user.id", "user.firstName", "user.lastName", "st.student_number"])
                .leftJoin("user.student", "st", "st.student_id = user.id")
                .where('user.roleId = :roleId', { roleId: 4 });
            if (departmentId) {
                query = query.andWhere("user.departmentId = :departmentId", { departmentId });
            }
            if (currentStudentIdList && currentStudentIdList.length > 0) {
                query = query.andWhere("user.id NOT IN (:...currentStudentIdList)", { currentStudentIdList });
            }
            query = query.andWhere(
                new Brackets((qb: any) => {
                    qb.where("LOWER(user.firstName) LIKE :search", { search: `%${search.toLowerCase()}%` })
                        .orWhere("LOWER(user.lastName) LIKE :search", { search: `%${search.toLowerCase()}%` })
                        .orWhere("LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE :search", { search: `%${search.toLowerCase()}%` })
                        .orWhere("st.student_number LIKE :search", { search: `%${search}%` });
                })
            );

            return query.getMany();
        }
        return undefined;
    }

    public createQueryBuilder(alias: string) {
        if (!this.repository) throw new Error("Repository not initialized");
        return this.repository.createQueryBuilder(alias);
    }

    public getRepositoryName(): string {
        return "UserRepositoryImpl";
    }
}
