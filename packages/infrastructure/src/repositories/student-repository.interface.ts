import { Student } from "@inversifyjs/domain";
import { GenericRepository } from "./generic-repository.interface";

export interface StudentRepository extends GenericRepository<Student> {
}
