import { ClassStudent } from "@inversifyjs/domain";
import { GenericService } from "./generic-service.interface";

export interface ClassStudentService extends GenericService<ClassStudent> {
    findStudentsByCourseClassId(
        name: any,
        courseClassId: any,
        page: any,
        limit: number,
        sortBy: any,
        sort: any,
    ): Promise<{
        list: ClassStudent[];
        total: number;
        page: number;
        pageSize: number;
    }> | undefined;

    findByCourseClassId(courseClassId: any, studentArray?: any) : Promise<ClassStudent[]> | undefined;
}
