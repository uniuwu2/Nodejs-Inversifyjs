import { Activity } from "@inversifyjs/domain";
import { GenericService } from "./generic-service.interface";

export interface ActivityService extends GenericService<Activity> {
    showActivityList(
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
        | undefined;
    activeEvent(activityId: number, active: number): Promise<Activity> | undefined;
    deleteEvent(activityId: number): Promise<Activity> | undefined;
}