import { ClassStudent } from "@inversifyjs/domain";
import { GenericRepository } from "./generic-repository.interface";

export interface ClassStudentRepository extends GenericRepository<ClassStudent> {
    createQueryBuilder(alias: string): any;
}
