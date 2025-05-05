import { Course } from "@inversifyjs/domain";
import { GenericRepository } from "./generic-repository.interface";

export interface CourseRepository extends GenericRepository<Course> {
    createQueryBuilder(alias: string): any;
}
