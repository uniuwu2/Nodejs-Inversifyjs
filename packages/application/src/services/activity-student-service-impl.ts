import { ActivityStudent } from "@inversifyjs/domain";
import { ActivityStudentRepository } from "@inversifyjs/infrastructure";
import { injectable } from "inversify";
import { AbstractService } from "./abstract-service";
import { ActivityStudentService } from "./activity-student-service.interface";
import { Like } from "typeorm";


@injectable()
export class ActivityStudentServiceImpl extends AbstractService<ActivityStudent, ActivityStudentRepository> implements ActivityStudentService {

    public showActivityStudentList(
        activityId: any,
        name: any,
        page: any,
        limit: number,
        sortBy?: any,
        sort?: any
    ): | Promise<{
        list: ActivityStudent[];
        total: number;
        page: number;
        pageSize: number;
    }>
        | undefined {
        if (sortBy) {
            if (sortBy === "firstName") {
                this.order = { student: { firstName: sort } };
            } else if (sortBy === "lastName") {
                this.order = { student: { lastName: sort } };
            } else if (sortBy === "email") {
                this.order = { student: { email: sort } };
            } else if (sortBy === "studentNumber") {
                this.order = { student: { student: { student_number: sort } } };
            } else if (sortBy === "phoneNumber") {
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

            if (activityId) {
                nameFilter.forEach((filter: any) => {
                    where.push({
                        ...filter,
                        activity: { id: activityId },
                    });
                });
            }
        } else {
            if (activityId) {
                where.push({ activity: { id: activityId } });
            }
        }

        return this.repository?.findAndCount(
            ["student", "activity", "student.student"],
            (name || activityId) && where,
            page && { take: limit, page: page },
            sortBy && this.order
        )?.then((item: any) => {
            return {
                list: item.list,
                total: item.count,
                page: item.page,
                pageSize: item.pageSize,
            };
        }) as Promise<{
            list: ActivityStudent[];
            total: number;
            page: number;
            pageSize: number;
        }>;
    }


    public getRepositoryName(): string {
        return "ActivityStudentRepositoryImpl";
    }
}
