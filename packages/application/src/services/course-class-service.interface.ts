import { CourseClass, User } from "@inversifyjs/domain";
import { GenericService } from "./generic-service.interface";

export interface CourseClassService extends GenericService<CourseClass> {
    showCourseClassList(
        teacher: any,
        course: any,
        group: any,
        semester: any,
        name: any,
        page: any,
        limitedItem: number,
        sortBy: any,
        sort: any
    ):
        | Promise<{
              list: CourseClass[];
              total: number;
              page: number;
              pageSize: number;
          }>
        | undefined;
    getSemesterList(): Promise<any[]> | undefined;
    // findStudentsByCourseClassId(
    //     name: any,
    //     courseClassId: any,
    //     page: any,
    //     limit: number,
    //     sortBy: any,
    //     sort: any
    // ): Promise<{
    //     list: User[];
    //     total: number;
    //     page: number;
    //     pageSize: number;
    // }> | undefined;
}
