import { Student } from "@inversifyjs/domain";
import { GenericService } from "./generic-service.interface";

export interface StudentService extends GenericService<Student> {}
