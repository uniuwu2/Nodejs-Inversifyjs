import { SessionClass } from "@inversifyjs/domain";
import { SessionClassRepository } from "@inversifyjs/infrastructure";
import { injectable } from "inversify";
import { AbstractService } from "./abstract-service";
import { SessionClassService } from "./session-class.interface";
import { Between } from "typeorm";
import { DateTimeHelper } from "@inversifyjs/application";

@injectable()
export class SessionClassServiceImpl extends AbstractService<SessionClass, SessionClassRepository> implements SessionClassService {

    public getStatisticDays(
        startDate: any,
        endDate: any,
        page: any,
        sortBy?: any,
        sort?: any,
        limit?: number
    ):
        | Promise<{
            list: SessionClass[];
            total: number;
            page: number;
            pageSize: number;
        }>
        | undefined {
        let sessionDate: any;
        if (startDate && endDate) {
            sessionDate = { sessionDate: Between(new Date(DateTimeHelper.formatFirstTime(startDate)), new Date(DateTimeHelper.formatLastTime(endDate))) };
        }
        if (sortBy && sortBy === "user") {
            this.order = { user: { firstName: sort, lastName: sort } };
        } else {
            this.order = { [sortBy]: sort };
        }
        if (sessionDate) {
            this.where = [
                {
                    ...sessionDate,
                }
            ];
        }
        return this.repository?.findAndCount(
            ["attendance", "courseClass"],
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
                list: SessionClass[];
                total: number;
                page: number;
                pageSize: number;
            }>;
    }

    public getRepositoryName(): string {
        return "SessionClassRepositoryImpl";
    }
}
