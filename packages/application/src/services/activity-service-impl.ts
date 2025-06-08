import { Activity } from "@inversifyjs/domain";
import { ActivityRepository } from "@inversifyjs/infrastructure";
import { injectable } from "inversify";
import { AbstractService } from "./abstract-service";
import { ActivityService } from "./activity-service.interface";
import { Between, Like } from "typeorm";
import { DateTimeHelper } from "../helpers/datetime-helper";


@injectable()
export class ActivityServiceImpl extends AbstractService<Activity, ActivityRepository> implements ActivityService {

    public showActivityList(
        name: any,
        page: any,
        limit: number,
        sortBy?: any,
        sort?: any,
        startDate?: any,
        endDate?: any,
        status?: any,
        user?: any
    ):
        | Promise<{
            list: Activity[];
            total: number;
            page: number;
            pageSize: number;
        }>
        | undefined {
        let activityDate: any;

        // Sort by field name
        if (sortBy && sortBy === "user") {
            this.order = { user: { firstName: sort, lastName: sort } };
        } else {
            this.order = { [sortBy]: sort };
        }

        if (startDate && endDate) {
            activityDate = { activityDate: Between(new Date(DateTimeHelper.formatFirstTime(startDate)), new Date(DateTimeHelper.formatLastTime(endDate))) };
        }
        if (activityDate || name || user || status) {
            this.where = [
                {
                    activityName: Like(`%${name}%`),
                    ...activityDate,
                    // nếu status là 1 hoặc 0 thì gán, còn bằng all thì không gán
                    active: status === "ALL" ? undefined : Number(status),
                    userId: user === "ALL" ? undefined : user
                },
                {
                    location: Like(`%${name}%`),
                    ...activityDate,
                    active: status === "ALL" ? undefined : Number(status),
                    userId: user === "ALL" ? undefined : user
                },
                {
                    user: {
                        firstName: Like(`%${name}%`),
                    },
                    ...activityDate,
                    active: status === "ALL" ? undefined : Number(status),
                    userId: user === "ALL" ? undefined : user
                },
                {
                    user: {
                        lastName: Like(`%${name}%`),
                    },
                    ...activityDate,
                    active: status === "ALL" ? undefined : Number(status),
                    userId: user === "ALL" ? undefined : user
                }
            ];
        }

        return this.repository?.findAndCount(
            ["user"],
            this.where,
            page && { take: limit, page: page },
            sortBy && this.order)?.then((item: any) => {
                return {
                    list: item.list,
                    total: item.count,
                    page: item.page,
                    pageSize: item.pageSize,
                }
            }) as Promise<{
                list: Activity[];
                total: number;
                page: number;
                pageSize: number;
            }>;
    }

    public activeEvent(activityId: number, active: number): Promise<Activity> | undefined {
        if (!this.repository) {
            return undefined;
        }
        return this.repository.updateById(activityId, { active: active });
    }

    public deleteEvent(id: number): Promise<Activity> | undefined {
        if (!this.repository) {
            return undefined;
        }
        return this.repository.deleteById(id);
    }

    

    public getRepositoryName(): string {
        return "ActivityRepositoryImpl";
    }
}
