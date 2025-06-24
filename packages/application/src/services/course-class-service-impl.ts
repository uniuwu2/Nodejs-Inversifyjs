import { CourseClass, User } from "@inversifyjs/domain";
import { CourseClassRepository } from "@inversifyjs/infrastructure";
import { injectable } from "inversify";
import { AbstractService } from "./abstract-service";
import { CourseClassService } from "./course-class-service.interface";
import { Like } from "typeorm";
import { Variables } from "../constants/variables";

@injectable()
export class CourseClassServiceImpl extends AbstractService<CourseClass, CourseClassRepository> implements CourseClassService {
    public showCourseClassList(
        teacher: any,
        course: any,
        group: any,
        semester: any,
        name: any,
        page: any,
        limit: number,
        sortBy: any,
        sort: any
    ):
        | Promise<{
              list: CourseClass[];
              total: number;
              page: number;
              pageSize: number;
          }>
        | undefined {
        // if (sortBy) {
        //     this.order = { [sortBy]: sort };
        // }

        if (sortBy) {
            if (sortBy === "courseName") {
                this.order = { course: { courseName: sort } };
            } else if (sortBy === "teacherName") {
                this.order = {
                    teacher: {
                        lastName: sort,
                        firstName: sort,
                    },
                };
            } else {
                this.order = { [sortBy]: sort };
            }
        }

        if (name || teacher || course || group || semester) {
            this.where = [
                {
                    course: { 
                        id: course !== Variables.ALL ? course : undefined,
                        courseName: Like(`%${name}%`)
                    },
                    teacher: {
                        id: teacher !== Variables.ALL ? teacher : undefined,
                        firstName: Like(`%${name}%`),
                        lastName: Like(`%${name}%`),
                    },
                    group: group !== Variables.ALL ? group : undefined,
                    semester: semester !== Variables.ALL ? semester : undefined,
                },
               
            ];
        }
        return this.repository?.findAndCount(
            ["course", "teacher"], 
            (name || teacher || course || group || semester) && this.where, 
            page && { take: limit, page: page }, 
            sortBy && this.order)?.then((result: any) => {

            return {
                list: result.list,
                total: result.count,
                page: result.page,
                pageSize: result.pageSize,
            };
        }) as Promise<{
            list: CourseClass[];
            total: number;
            page: number;
            pageSize: number;
        }>;
    }

    public getSemesterList(): Promise<any[]> | undefined {
        if (!this.repository) return undefined;
        return this.repository
            .createQueryBuilder("course_class")
            .select("DISTINCT course_class.semester", "semester")
            .orderBy("course_class.semester", "ASC")
            .getRawMany()
            .then((result: any) => {
                return result.map((item: any) => item.semester);
            });
    }

    public findAllClassesByTeacherId(teacherId: number): Promise<CourseClass[]> | undefined {
        if (!this.repository) return undefined;
        return this.repository
            .createQueryBuilder("course_class")
            .leftJoinAndSelect("course_class.course", "course")
            .leftJoinAndSelect("course_class.teacher", "teacher")
            .where("course_class.teacherId = :teacherId", { teacherId })
            .orderBy("course.course_name", "ASC")
            .getMany();
    }

    public getRepositoryName(): string {
        return "CourseClassRepositoryImpl";
    }
}
