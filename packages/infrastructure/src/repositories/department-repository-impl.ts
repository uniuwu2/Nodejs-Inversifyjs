import { Department } from "@inversifyjs/domain";
import { injectable } from "inversify";
import { AbstractRepository } from "./abstract-repository";
import { DepartmentRepository } from "./department-repository.interface";

/**
 * User Repository
 */
@injectable()
export class DepartmentRepositoryImpl extends AbstractRepository<Department> implements DepartmentRepository {
    public getEntityType(): any {
        return Department;
    }

    public createQueryBuilder(alias: string) {
        if (!this.repository) throw new Error("Repository not initialized");
        return this.repository.createQueryBuilder(alias);
    }

    public getRepositoryName(): string {
        return "DepartmentRepositoryImpl";
    }
}
