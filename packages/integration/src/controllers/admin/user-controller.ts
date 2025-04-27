import { controller, httpGet } from "inversify-express-utils";
import { HttpCode, UserService } from "@inversifyjs/application";
import { BaseController } from "../base-controller";
import { inject } from "inversify";
import { TYPES } from "@inversifyjs/application";
import { Response, Request } from "express";
import { RouteHelper, Permission } from "@inversifyjs/application";
import { checkPermissions, verifyAuthTokenRouter } from "@inversifyjs/infrastructure";

@controller("/users")
export class UserController extends BaseController {
    private userService: UserService;

    public constructor(@inject(TYPES.UserService) _userService: UserService) {
        super();
        this.userService = _userService;
    }

    @httpGet("/", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN, Permission.ONLY_TEACHER]))
    public async getAllUsers(request: Request, response: Response): Promise<void> {
        try {
            let currentUser = response.locals.jwtPayload.user;
            if (currentUser.role.id === Permission.ONLY_TEACHER) {
                let users = await this.userService.findStudentByTeacherId(currentUser.id);
                response.render(this.routeHelper.getRenderPage(RouteHelper.USER_LIST), {
                    users: users,
                    title: "User List",
                });
                return;
            }
            let users = await this.userService.findAll(["role"]);
            response.render(this.routeHelper.getRenderPage(RouteHelper.USER_LIST), {
                users: users,
                title: "User List",
            });
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST});
        }
    }
}
