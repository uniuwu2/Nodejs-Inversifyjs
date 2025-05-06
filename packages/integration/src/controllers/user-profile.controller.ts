import { HttpCode, RouteHelper, TYPES, UserPermission, UserService } from "@inversifyjs/application";
import { controller, httpGet } from "inversify-express-utils";
import { BaseController } from "./base-controller";
import { verifyAuthTokenRouter } from "@inversifyjs/infrastructure";
import { inject } from "inversify";
import { Response, Request } from "express";

@controller("/profile")
export class UserProfileController extends BaseController {
    private userService!: UserService
    private imgDir!: string;

    constructor(@inject(TYPES.UserService) userService: UserService) {
        super();
        this.userService = userService;
        this.imgDir = process.env.IMAGE_PATH!;
    }

    @httpGet("/:id", verifyAuthTokenRouter)
    public async getUserProfile(request: Request, response: Response): Promise<void> {
        let successMessage: string = "";
        let userId = Number(request.params.id);
        try {
            if (!userId) {
                return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
            }
            let user = await this.userService.findById(userId,["role"]);
            if (
                (user?.id !== response.locals.jwtPayload.user.id && response.locals.jwtPayload.user.roleId !== UserPermission.admin) ||
                (response.locals.jwtPayload.user.roleId === UserPermission.admin && user?.id !== response.locals.jwtPayload.user.id)
            ) {
                return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.UNAUTHORIZATION));
            }

            if (request.cookies.messages) {
                successMessage = "「" + request.cookies.messages.user + "」" + request.cookies.messages.message;
                response.clearCookie("messages");
            }

            if (!user) {
                return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
            }
            return response.render(this.routeHelper.getRenderPage(RouteHelper.USER_PROFILE), { user_info: user, successMessage});
        } catch (error: any) {
            this.logger.error(error);
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));

        }
    }
}