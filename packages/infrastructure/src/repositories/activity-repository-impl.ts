import { Activity } from "@inversifyjs/domain";
import { injectable } from "inversify";
import { AbstractRepository } from "./abstract-repository";
import { ActivityRepository } from "./activity-repository.interface";

/**
 * User Repository
 */
@injectable()
export class ActivityRepositoryImpl extends AbstractRepository<Activity> implements ActivityRepository {
    public getEntityType(): any {
        return Activity;
    }

    public createQueryBuilder(alias: string) {
        if (!this.repository) throw new Error("Repository not initialized");
        return this.repository.createQueryBuilder(alias);
    }

    public getRepositoryName(): string {
        return "ActivityRepositoryImpl";
    }
}
