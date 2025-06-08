import { Department } from "@inversifyjs/domain";
import { DepartmentRepository } from "@inversifyjs/infrastructure";
import { injectable } from "inversify";
import { AbstractService } from "./abstract-service";
import { DepartmentService } from "./department-service.interface";

@injectable()
export class DepartmentServiceImpl extends AbstractService<Department, DepartmentRepository> implements DepartmentService {
    
    public getRepositoryName(): string {
        return "DepartmentRepositoryImpl";
    }
}
