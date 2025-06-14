import { User } from "@inversifyjs/domain";
import { GenericService } from "./generic-service.interface";

export interface UserService extends GenericService<User> {
    findByEmail(email: string): Promise<User> | undefined;
    createFromGoogle(profile: any): Promise<User> | undefined;
    findStudentByTeacherId(teacherId: number): Promise<User[]> | undefined;
    showUserList(
        roleId: any,
        valid: any,
        name: any,
        page: any,
        limitedItem: number,
        sortBy: any,
        sort: any,
        // isSuperAdmin: boolean
    ):
        | Promise<{
              list: User[];
              total: number;
              page: number;
              pageSize: number;
          }>
        | undefined;
    getAllTeacher(): Promise<User[]> | undefined;
    getTeacherByEmail(email: string): Promise<User> | undefined;
    findStudentBySelect2(search: string, departmentId?: number, currentStudentIdList?: number[]): Promise<User[]> | undefined;
    createQueryBuilder(alias: string): any;
    getStaffList(): Promise<User[]> | undefined;
    createFromReactNative(name: string, email: string, picture: string, givenName: string, familyName: string): Promise<User> | undefined;
}
