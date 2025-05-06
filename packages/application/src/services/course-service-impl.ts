import { Course } from "@inversifyjs/domain";
import { CourseRepository } from "@inversifyjs/infrastructure";
import { injectable } from "inversify";
import { AbstractService } from "./abstract-service";
import { CourseService } from "./course-service.interface";
import { Like } from "typeorm";
import { Variables } from "../constants/variables";

@injectable()
export class CourseServiceImpl extends AbstractService<Course, CourseRepository> implements CourseService {
    public getDepartmentList(): Promise<string[]> | undefined {
        if (!this.repository) return undefined;

        const result = this.repository.createQueryBuilder("course").select("DISTINCT course.department", "department").orderBy("course.department", "ASC").getRawMany();
        return result;
    }

    public showCourseList(
        department: any,
        name: any,
        page: any,
        limit: number,
        sortBy: any,
        sort: any
    ):
        | Promise<{
              list: Course[];
              total: number;
              page: number;
              pageSize: number;
          }>
        | undefined {
        if (sortBy) {
            this.order = { [sortBy]: sort };
        }
        let where: any = [];
        if (name !== "") {
            if (!isNaN(Number(name))) {
                where.push({ credit: Number(name) });
            } else {
                where.push(
                    { courseName: Like(`%${name}%`) },
                    { courseCode: Like(`%${name}%`) },
                )
            }
        }

        if (department !== Variables.ALL) {
            where.push({ department: Like(`%${department}%`) });
        }

        return this.repository?.findAndCount([], (name || department) && where, page && { take: limit, page: page }, sortBy && this.order)?.then((result: any) => {
            return {
                list: result.list,
                total: result.count,
                pageSize: result.pageSize,
                page: result.page,
            };
        }) as Promise<{
            list: Course[];
            total: number;
            page: number;
            pageSize: number;
        }>;
    }

    public getCourseByCode(courseCode: string): Promise<Course> | undefined {
        if (this.repository != undefined) {
            return this.repository.findOneByFieldName({ courseCode });
        }
        return undefined;
    }

    public getRepositoryName(): string {
        return "CourseRepositoryImpl";
    }
}
