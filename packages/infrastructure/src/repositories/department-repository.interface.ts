import { Department } from "@inversifyjs/domain";
import { GenericRepository } from "./generic-repository.interface";

export interface DepartmentRepository extends GenericRepository<Department> {
}
