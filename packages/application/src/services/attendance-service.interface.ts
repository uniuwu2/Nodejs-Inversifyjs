import { Attendance, ClassStudent } from "@inversifyjs/domain";
import { GenericService } from "./generic-service.interface";

export interface AttendanceService extends GenericService<Attendance> { 

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
    
}
