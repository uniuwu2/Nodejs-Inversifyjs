import { CourseClass } from "@inversifyjs/domain";
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
            if (sortBy === 'courseName') {
                this.order = { course: { courseName: sort } };
            } else if (sortBy === 'teacherName') {
                this.order = {
                    teacher: {
                        lastName: sort,
                        firstName: sort
                    }
                };
            } else {
                this.order = { [sortBy]: sort };
            }
        }

        let where: any = [];
        if (teacher && teacher !== Variables.ALL) {
            where.push({ teacher: { id: teacher } });
        }
        if (course && course !== Variables.ALL) {
            where.push({ course: { id: course } });
        }

        if (group && group !== Variables.ALL) {
            where.push({ group: group });
        }

        if (semester && semester !== Variables.ALL) {
            where.push({ semester: semester });
        }
        // nếu search có tồn tại thì tìm kiếm theo tên môn học, teacher
        if (name && name !== Variables.ALL) {
            where.push({ course: { courseName: Like(`%${name}%`) } });
        }
        return this.repository?.findAndCount(
            ["course","teacher"], 
            (name || teacher || course || group || semester) && where, 
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
    
    public getRepositoryName(): string {
        return "CourseClassRepositoryImpl";
    }
}
