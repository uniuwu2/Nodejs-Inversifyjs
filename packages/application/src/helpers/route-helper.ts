import { injectable } from "inversify";

/**
 * Route Helper to get the route path
 */
@injectable()
export class RouteHelper {
    public static readonly UNAUTHORIZATION: string = "unauthorization";
    public static readonly USER_LIST: string = "user-list";
    public static readonly INTERNAL_SERVER_ERROR: string = "pages-500";
    public static readonly INDEX: string = "/";


    private routeMap: Map<string, string> = new Map<string, string>();

    constructor() {
        this.routeMap.set(RouteHelper.UNAUTHORIZATION, "pages-unauthorization/index");
        this.routeMap.set(RouteHelper.USER_LIST, "user-list/index");
        this.routeMap.set(RouteHelper.INTERNAL_SERVER_ERROR, "pages-500/index");
        this.routeMap.set(RouteHelper.INDEX, "index");
    }

    /**
     * Get the render page which show the browser
     * @param route -> string name
     * @returns render path string
     */
    public getRenderPage(route: string): string {
        let page = this.routeMap.get(route);
        if (page != undefined) {
            return page;
        }
        return "";
    }
}
