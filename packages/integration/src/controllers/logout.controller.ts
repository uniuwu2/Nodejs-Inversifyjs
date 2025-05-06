import { HttpCode, RouteHelper } from "@inversifyjs/application";
import { controller, httpGet } from "inversify-express-utils";
import { Request, Response } from "express";
import { destroySession } from "@inversifyjs/infrastructure";
import { BaseController } from "./base-controller";

@controller(RouteHelper.LOGOUT)
export class LogoutController extends BaseController {
    public constructor() {
        super();
    }

    /**
     * Implement Logout
     */
    @httpGet("/")
    public async handleLogout(request: Request, response: Response) {
        destroySession(request, response);
        request.session.destroy((error: any) => error);
        return response.clearCookie("wacts", { maxAge: 0 }).status(HttpCode.SUCCESSFUL).redirect(RouteHelper.LOGIN);
    }
}
