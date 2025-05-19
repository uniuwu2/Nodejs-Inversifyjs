import { controller, httpGet, httpPost } from "inversify-express-utils";
import { BaseController } from "./base-controller";
import { ClassStudentService, CourseClassService, CourseService, DepartmentService, HttpCode, Messages, Permission, RouteHelper, TYPES, UserService, Variables } from "@inversifyjs/application";
import { Request, Response } from "express";
import { verify } from "crypto";
import { verifyAuthTokenRouter } from "@inversifyjs/infrastructure";
import { inject } from "inversify";
@controller(RouteHelper.SESSION_CLASS)
export class SessionClassController extends BaseController {
    private courseClassService!: CourseClassService;
    constructor(@inject(TYPES.CourseClassService) courseClassService: CourseClassService) {
        super();
        this.courseClassService = courseClassService;
    }

    @httpGet("/", verifyAuthTokenRouter)
    public async getSessionClass(request: Request, response: Response): Promise<void> {
        try {
            let courseClassList = await this.courseClassService.findAll(["course","teacher"]);
            if (this.routeHelper != undefined) {
                response.render(this.routeHelper.getRenderPage(RouteHelper.SESSION_CLASS), {
                    courseClasses: JSON.stringify(courseClassList),
                });
            }
        } catch (error: any) {
            this.logger.error(error);
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
        }
    }
}