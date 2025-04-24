import { RouteHelper, TYPES } from "@inversifyjs/application";
import { Logger } from "@inversifyjs/infrastructure";
import { inject } from "inversify";

export class BaseController {
    /** use for logging */
    @inject(TYPES.Logger)
    protected logger!: Logger;

    /** use to handle the route path */
    @inject(TYPES.RouteHelper)
    protected routeHelper!: RouteHelper;

    protected limitedItem: number = Number(process.env.LIMITED_ITEM_DISPLAY!);

    protected errors: any;
}
