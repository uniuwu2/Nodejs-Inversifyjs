import { controller, httpGet } from "inversify-express-utils";
import { HttpCode, UserService } from "@inversifyjs/application";
import { BaseController } from "../base-controller";
import { inject } from "inversify";
import { TYPES } from "@inversifyjs/application";
import { Response, Request } from "express";
import { RouteHelper } from "@inversifyjs/application";

@controller("/admin/user")
export class UserController extends BaseController {
    private userService: UserService;

    public constructor(@inject(TYPES.UserService) _userService: UserService) {
        super();
        this.userService = _userService;
    }

    @httpGet("/")
    public async getAllUsers(request: Request, response: Response): Promise<void> {
        try {
            let users = await this.userService.findAll(["role"]);
            response.render(this.routeHelper.getRenderPage(RouteHelper.USER_LIST), {
                users: users,
                title: "User List",
            });
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({
                message: error.message,
                status: HttpCode.BAD_REQUEST,
                });
        }
    }
}