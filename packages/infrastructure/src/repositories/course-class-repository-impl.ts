import { CourseClass } from "@inversifyjs/domain";
import { injectable } from "inversify";
import { AbstractRepository } from "./abstract-repository";
import { CourseClassRepository } from "./course-class-repository.interface";

/**
 * User Repository
 */
@injectable()
export class CourseClassRepositoryImpl extends AbstractRepository<CourseClass> implements CourseClassRepository {
    public getEntityType(): any {
        return CourseClass;
    }

    public createQueryBuilder(alias: string) {
        if (!this.repository) throw new Error("Repository not initialized");
        return this.repository.createQueryBuilder(alias);
    }

    public getRepositoryName(): string {
        return "CourseClassRepositoryImpl";
    }
}
