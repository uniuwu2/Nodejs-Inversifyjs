import { Student } from "@inversifyjs/domain";
import { injectable } from "inversify";
import { AbstractRepository } from "./abstract-repository";
import { StudentRepository } from "./student-repository.interface";

/**
 * User Repository
 */
@injectable()
export class StudentRepositoryImpl extends AbstractRepository<Student> implements StudentRepository {
    public getEntityType(): any {
        return Student;
    }

    public getRepositoryName(): string {
        return "StudentRepositoryImpl";
    }
}
