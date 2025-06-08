import { Attendance } from "@inversifyjs/domain";
import { GenericRepository } from "./generic-repository.interface";

export interface AttendanceRepository extends GenericRepository<Attendance> {
    createQueryBuilder(alias: string): any;
}
