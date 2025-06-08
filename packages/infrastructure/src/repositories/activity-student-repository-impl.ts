import { ActivityStudent } from "@inversifyjs/domain";
import { injectable } from "inversify";
import { AbstractRepository } from "./abstract-repository";
import { ActivityStudentRepository } from "./activity-student-repository.interface";

/**
 * User Repository
 */
@injectable()
export class ActivityStudentRepositoryImpl extends AbstractRepository<ActivityStudent> implements ActivityStudentRepository {
    public getEntityType(): any {
        return ActivityStudent;
    }

    public createQueryBuilder(alias: string) {
        if (!this.repository) throw new Error("Repository not initialized");
        return this.repository.createQueryBuilder(alias);
    }

    public getRepositoryName(): string {
        return "ActivityStudentRepositoryImpl";
    }
}
