import { Student } from "@inversifyjs/domain";
import { StudentRepository } from "@inversifyjs/infrastructure";
import { injectable } from "inversify";
import { AbstractService } from "./abstract-service";
import { StudentService } from "./student-service.interface";

@injectable()
export class StudentServiceImpl extends AbstractService<Student, StudentRepository> implements StudentService {
    
    public getRepositoryName(): string {
        return "StudentRepositoryImpl";
    }
}
