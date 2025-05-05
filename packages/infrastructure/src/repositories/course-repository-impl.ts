import { Course } from "@inversifyjs/domain";
import { injectable } from "inversify";
import { AbstractRepository } from "./abstract-repository";
import { CourseRepository } from "./course-repository.interface";

/**
 * User Repository
 */
@injectable()
export class CourseRepositoryImpl extends AbstractRepository<Course> implements CourseRepository {
    public getEntityType(): any {
        return Course;
    }

    public createQueryBuilder(alias: string) {
        if (!this.repository) throw new Error("Repository not initialized");
        return this.repository.createQueryBuilder(alias);
    }

    public getRepositoryName(): string {
        return "CourseRepositoryImpl";
    }
}
