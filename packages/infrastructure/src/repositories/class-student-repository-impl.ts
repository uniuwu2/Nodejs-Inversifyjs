import { ClassStudent } from "@inversifyjs/domain";
import { injectable } from "inversify";
import { AbstractRepository } from "./abstract-repository";
import { ClassStudentRepository } from "./class-student-repository.interface";

/**
 * User Repository
 */
@injectable()
export class ClassStudentRepositoryImpl extends AbstractRepository<ClassStudent> implements ClassStudentRepository {
    public getEntityType(): any {
        return ClassStudent;
    }

    public createQueryBuilder(alias: string) {
        if (!this.repository) throw new Error("Repository not initialized");
        return this.repository.createQueryBuilder(alias);
    }

    public getRepositoryName(): string {
        return "ClassStudentRepositoryImpl";
    }
}
