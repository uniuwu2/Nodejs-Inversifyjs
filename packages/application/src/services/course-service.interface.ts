import { Course } from "@inversifyjs/domain";
import { GenericService } from "./generic-service.interface";

export interface CourseService extends GenericService<Course> {
    showCourseList(department: any, name: any, page: any, limit: number, sortBy: any, sort: any)
    : Promise<{ list: Course[]; total: number; pageSize: number }> 
    | undefined;
    getDepartmentList(): Promise<string[]> | undefined;
    getCourseByCode(code: string): Promise<Course> | undefined;
}
