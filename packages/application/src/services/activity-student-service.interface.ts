import { ActivityStudent } from "@inversifyjs/domain";
import { GenericService } from "./generic-service.interface";

export interface ActivityStudentService extends GenericService<ActivityStudent> {
    showActivityStudentList(
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
        pageSize: number
    }>
        | undefined;
}
