import { ClassStudent } from "@inversifyjs/domain";
import { ClassStudentRepository } from "@inversifyjs/infrastructure";
import { injectable } from "inversify";
import { AbstractService } from "./abstract-service";
import { ClassStudentService } from "./class-student-service.interface";
import { Like } from "typeorm";
import { Variables } from "../constants/variables";

@injectable()
export class ClassStudentServiceImpl extends AbstractService<ClassStudent, ClassStudentRepository> implements ClassStudentService {
    public findStudentsByCourseClassId(
        name: any,
        courseClassId: any,
        page: any,
        limit: number,
        sortBy: any,
        sort: any
    ): Promise<{
        list: ClassStudent[];
        total: number;
        page: number;
        pageSize: number;
    }> | undefined {
        if (sortBy) {
            this.order = { [sortBy]: sort };
        }

        let where: any = [];
        if (courseClassId && courseClassId !== Variables.ALL) {
            where.push({ courseClass: { id: courseClassId } });
        }
        if (name && name !== Variables.ALL) {
            where.push({ student: { firstName: Like(`%${name}%`) } });
        }

        return this.repository?.findAndCount(
            ["student, courseClass"],
            where,
            page && { take: limit, page: page }, 
            sortBy && this.order)?.then((result: any) => {
            return {
                list: result[0],
                total: result[1],
                page: page,
                pageSize: limit,
            };
        });
    }
    
    public getRepositoryName(): string {
        return "ClassStudentRepositoryImpl";
    }
}
