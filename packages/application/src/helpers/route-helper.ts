import { injectable } from "inversify";

/**
 * Route Helper to get the route path
 */
@injectable()
export class RouteHelper {
    public static readonly UNAUTHORIZATION: string = "unauthorization";
    public static readonly CALL_LIST: string = "/call-records-list";
    public static readonly SEARCH_LIST: string = "/search-list";
    public static readonly WORD_LIST: string = "/word-list";
    public static readonly LOG_LIST: string = "/logs-list";
    public static readonly USER_LIST: string = "/users-list";
    public static readonly SIGNUP: string = "/signup";
    public static readonly CONTACTS_PROFILE: string = "/profile";
    public static readonly LOGIN: string = "/login";
    public static readonly LOGOUT: string = "/logout";
    public static readonly REFRESH: string = "/refresh";
    public static readonly COMING_SOON: string = "coming-soon";
    public static readonly INDEX: string = "/";
    public static readonly INTERNAL_SERVER_ERROR: string = "pages-500";
    public static readonly NOT_FOUND: string = "pages-404";
    public static readonly ALL_PAGE: string = "*";
    public static readonly HOME: string = "home";
    public static readonly DEFAULT: string = "default";
    public static readonly DETAIL_RECORD: string = "/detail-record";

    private routeMap: Map<string, string> = new Map<string, string>();

    constructor() {
        this.routeMap.set(RouteHelper.UNAUTHORIZATION, "pages-unauthorization/index");
        this.routeMap.set(RouteHelper.CALL_LIST, "call-records-list/index");
        this.routeMap.set(RouteHelper.INTERNAL_SERVER_ERROR, "pages-500/index");
        this.routeMap.set(RouteHelper.NOT_FOUND, "pages-404/index");
        this.routeMap.set(RouteHelper.COMING_SOON, "coming-soon/index");
        this.routeMap.set(RouteHelper.SEARCH_LIST, "search-list/index");
        this.routeMap.set(RouteHelper.WORD_LIST, "word-list/index");
        this.routeMap.set(RouteHelper.LOG_LIST, "logs-list/index");
        this.routeMap.set(RouteHelper.USER_LIST, "users-list/index");
        this.routeMap.set(RouteHelper.SIGNUP, "signup/index");
        this.routeMap.set(RouteHelper.CONTACTS_PROFILE, "profile/index");
        this.routeMap.set(RouteHelper.LOGIN, "authentication/login");
        this.routeMap.set(RouteHelper.LOGOUT, "/logout");
        this.routeMap.set(RouteHelper.REFRESH, "/refresh");
        this.routeMap.set(RouteHelper.INDEX, "index");
        this.routeMap.set(RouteHelper.HOME, "home");
        this.routeMap.set(RouteHelper.DEFAULT, "default");
        this.routeMap.set(RouteHelper.DETAIL_RECORD, "detail-record/index");
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
