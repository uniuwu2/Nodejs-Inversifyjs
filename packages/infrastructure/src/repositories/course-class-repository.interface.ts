import { CourseClass } from "@inversifyjs/domain";
import { GenericRepository } from "./generic-repository.interface";

export interface CourseClassRepository extends GenericRepository<CourseClass> {
    createQueryBuilder(alias: string): any;
}
