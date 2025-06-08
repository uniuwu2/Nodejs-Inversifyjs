import { ActivityStudent } from "@inversifyjs/domain";
import { GenericRepository } from "./generic-repository.interface";

export interface ActivityStudentRepository extends GenericRepository<ActivityStudent> {
    createQueryBuilder(alias: string): any;
}
