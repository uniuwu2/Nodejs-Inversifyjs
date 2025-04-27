import { injectable } from "inversify";

/**
 * Route Helper to get the route path
 */
@injectable()
export class RouteHelper {
    public static readonly UNAUTHORIZATION: string = "unauthorization";
    public static readonly USER_LIST: string = "/user-list";
    public static readonly LOGIN: string = "/login";
    public static readonly LOGOUT: string = "/logout";
    public static readonly COMING_SOON: string = "coming-soon";
    public static readonly INDEX: string = "/";
    public static readonly INTERNAL_SERVER_ERROR: string = "pages-500";
    public static readonly NOT_FOUND: string = "pages-404";
    public static readonly ALL_PAGE: string = "*";
    public static readonly HOME: string = "home";
    public static readonly DEFAULT: string = "default";

    private routeMap: Map<string, string> = new Map<string, string>();

    constructor() {
        this.routeMap.set(RouteHelper.UNAUTHORIZATION, "pages-unauthorization/index");
        this.routeMap.set(RouteHelper.INTERNAL_SERVER_ERROR, "pages-500/index");
        this.routeMap.set(RouteHelper.NOT_FOUND, "pages-404/index");
        this.routeMap.set(RouteHelper.COMING_SOON, "coming-soon/index");
        this.routeMap.set(RouteHelper.USER_LIST, "users-list/index");
        this.routeMap.set(RouteHelper.LOGIN, "authentication/login");
        this.routeMap.set(RouteHelper.LOGOUT, "/logout");
        this.routeMap.set(RouteHelper.INDEX, "index");
        this.routeMap.set(RouteHelper.HOME, "home");
        this.routeMap.set(RouteHelper.DEFAULT, "default");
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
