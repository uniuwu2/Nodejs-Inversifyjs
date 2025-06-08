import { Attendance } from "@inversifyjs/domain";
import { injectable } from "inversify";
import { AbstractRepository } from "./abstract-repository";
import { AttendanceRepository } from "./attendance-repository.interface";

/**
 * User Repository
 */
@injectable()
export class AttendanceRepositoryImpl extends AbstractRepository<Attendance> implements AttendanceRepository {
    public getEntityType(): any {
        return Attendance;
    }

    public createQueryBuilder(alias: string) {
        if (!this.repository) throw new Error("Repository not initialized");
        return this.repository.createQueryBuilder(alias);
    }

    public getRepositoryName(): string {
        return "AttendanceRepositoryImpl";
    }
}
