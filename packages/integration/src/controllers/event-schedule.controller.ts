import { controller, httpGet } from "inversify-express-utils";
import { ActivityService, ActivityStudentService, HttpCode, Permission, RouteHelper, TYPES } from "@inversifyjs/application";
import { BaseController } from "./base-controller";
import { checkPermissions, verifyAuthTokenRouter } from "@inversifyjs/infrastructure";
import { Request, Response } from "express";
import { inject } from "inversify";
@controller(RouteHelper.EVENT_SCHEDULE)
export class EventScheduleController extends BaseController {
    private activityStudentService!: ActivityStudentService;
    private activityService!: ActivityService;
    public constructor(
        @inject(TYPES.ActivityStudentService) activityStudentService: ActivityStudentService,
        @inject(TYPES.ActivityService) activityService: ActivityService
    ) {
        super();
        this.activityStudentService = activityStudentService;
        this.activityService = activityService;
    }

    @httpGet("/", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_STAFF, Permission.ONLY_ADMIN]))
    public async getEventSchedule(request: Request, response: Response): Promise<void> {
        try {
            let activities = await this.activityService.findAll();
            response.render(this.routeHelper.getRenderPage(RouteHelper.EVENT_SCHEDULE), {
                activities: activities,
            });
        } catch (error) {
            console.error("Error fetching event schedule:", error);
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
        }

    }

}