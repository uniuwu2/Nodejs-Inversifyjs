import { SessionClass } from "@inversifyjs/domain";
import { GenericService } from "./generic-service.interface";

export interface SessionClassService extends GenericService<SessionClass> {
    getStatisticDays(
        startDate: any,
        endDate: any,
        page: any,
        sortBy?: any,
        sort?: any,
        limit?: number)
        : | Promise<{
            list: SessionClass[];
            total: number;
            page: number;
            pageSize: number;
        }> | undefined;
}
