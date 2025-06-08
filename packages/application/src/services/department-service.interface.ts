import { Department } from "@inversifyjs/domain";
import { GenericService } from "./generic-service.interface";

export interface DepartmentService extends GenericService<Department> { }
