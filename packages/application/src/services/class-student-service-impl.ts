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
            if (sortBy === "firstName") {
                this.order = { student: { firstName: sort } };
            } else if (sortBy === "lastName") {
                this.order = { student: { lastName: sort } };
            } else if (sortBy === "email") {
                this.order = { student: { email: sort } };
            } else if (sortBy === "studentNumber") {
                this.order = { student: { student: { student_number: sort } } };
            } else if (sortBy === "phone") {
                this.order = { student: { phoneNumber: sort } };
            } else if (sortBy === "class") {
                this.order = { student: { student: { student_class: sort } } };
            } else {
                this.order = { [sortBy]: sort };
            }
        }

        let where: any = [];

        if (name !== null && name !== "") {
            const like = Like(`%${name}%`);
            const nameFilter = [
                { student: { firstName: like } },
                { student: { lastName: like } },
                { student: { email: like } },
                { student: { student: { student_number: like } } },
            ];

            if (courseClassId && courseClassId !== Variables.ALL) {
                nameFilter.forEach((filter: any) => {
                    where.push({
                        ...filter,
                        courseClass: { id: courseClassId },
                    });
                });
            }
        } else {
            if (courseClassId && courseClassId !== Variables.ALL) {
                where.push({ courseClass: { id: courseClassId } });
            }
        }
        
        return this.repository?.findAndCount(
            ["student", "courseClass", "student.student"],
            (name || courseClassId) && where,
            page && { take: limit, page: page },
            sortBy && this.order)?.then((result: any) => {
                return {
                    list: result.list,
                    total: result.count,
                    page: result.page,
                    pageSize: Number(result.pageSize),
                };
            }) as Promise<{
                list: ClassStudent[];
                total: number;
                page: number;
                pageSize: number;
            }>;
    }

    public findByCourseClassId(courseClassId: any, studentArray?: any): Promise<ClassStudent[]> | undefined {
        if (this.repository != undefined) {
            if (!studentArray) {
                return this.repository.findAll(
                    [],
                    { courseClass: { id: courseClassId } },
                );
            }
            return this.repository.findAll(
                [],
                {
                    courseClass: { id: courseClassId },
                    student: { id: studentArray },
                },
            );
        }
        return undefined;
    }

    public findStudentByCourseClassId(courseClassId: any, studentId: any): Promise<ClassStudent> | undefined {
        if (this.repository != undefined) {
            
        }
        return undefined;
    }

    public deleteByCourseClassId(courseClassId: any): Promise<void> | undefined {
        if (this.repository != undefined) {
           
        }
        return undefined;
    }

    public getRepositoryName(): string {
        return "ClassStudentRepositoryImpl";
    }
}
