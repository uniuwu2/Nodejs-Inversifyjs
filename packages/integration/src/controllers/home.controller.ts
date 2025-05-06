import { RouteHelper } from "@inversifyjs/application";
import { controller, httpGet } from "inversify-express-utils";
import { Request, Response } from "express";
import { verifyAuthTokenRouter } from "@inversifyjs/infrastructure";
import { BaseController } from "./base-controller";

/**
 * View Dashboard
 */
@controller(RouteHelper.INDEX)
export class HomeController extends BaseController {
    public constructor() {
        super();
    }

    @httpGet(RouteHelper.INDEX, verifyAuthTokenRouter)
    public index(request: Request, response: Response): void {
        if (this.routeHelper != undefined) {
            response.redirect(RouteHelper.INDEX + RouteHelper.HOME);
        }
    }

    @httpGet(RouteHelper.HOME, verifyAuthTokenRouter)
    public home(request: Request, response: Response): void {
        response.render(this.routeHelper.getRenderPage(RouteHelper.HOME));
    }

    @httpGet(RouteHelper.DEFAULT, verifyAuthTokenRouter)
    public default(request: Request, response: Response): void {
        this.index(request, response);
    }

    @httpGet(RouteHelper.INTERNAL_SERVER_ERROR, verifyAuthTokenRouter)
    public serverError(request: Request, response: Response): void {
        response.render(this.routeHelper.getRenderPage(RouteHelper.INTERNAL_SERVER_ERROR));
    }

    @httpGet(RouteHelper.UNAUTHORIZATION, verifyAuthTokenRouter)
    public unAuthorization(request: Request, response: Response): void {
        response.render(this.routeHelper.getRenderPage(RouteHelper.UNAUTHORIZATION));
    }

    @httpGet(RouteHelper.NOT_FOUND)
    public notFound(request: Request, response: Response): void {
        response.render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
    }

    @httpGet(RouteHelper.ALL_PAGE)
    public allPage(request: Request, response: Response): void {
        return this.notFound(request, response);
    }

    @httpGet(RouteHelper.COMING_SOON, verifyAuthTokenRouter)
    public comingSoon(request: Request, response: Response): void {
        response.render(this.routeHelper.getRenderPage(RouteHelper.COMING_SOON));
    }
}
