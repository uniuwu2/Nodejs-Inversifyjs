import { injectable } from "inversify";

/**
 * Route Helper to get the route path
 */
@injectable()
export class RouteHelper {
    public static readonly UNAUTHORIZATION: string = "unauthorization";
    public static readonly USER_LIST: string = "/users";
    public static readonly LOGIN: string = "/login";
    public static readonly LOGOUT: string = "/logout";
    public static readonly COMING_SOON: string = "coming-soon";
    public static readonly INDEX: string = "/";
    public static readonly INTERNAL_SERVER_ERROR: string = "pages-500";
    public static readonly NOT_FOUND: string = "pages-404";
    public static readonly ALL_PAGE: string = "*";
    public static readonly HOME: string = "home";
    public static readonly DEFAULT: string = "default";
    public static readonly COURSES: string = "/courses";
    public static readonly CLASSROOM: string = "/classroom";
    public static readonly CLASSES: string = "/classes";
    public static readonly COURSE_UPLOAD_CSV: string = "/classroom/course-upload-csv";
    public static readonly USER_PROFILE: string = "/profile";
    public static readonly SIGNUP: string = "/signup";
    public static readonly CLASS_DETAIL: string = "/class-detail";
    public static readonly SESSION_CLASS: string = "/session-class";
    public static readonly SESSION_CLASS_DETAIL: string = "/schedule/detail";
    public static readonly EVENT: string = "/events";
    public static readonly EVENT_DETAIL: string = "/event";

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
        this.routeMap.set(RouteHelper.COURSES, "classroom/courses");
        this.routeMap.set(RouteHelper.CLASSES, "classroom/classes");
        this.routeMap.set(RouteHelper.USER_PROFILE, "profile/index");
        this.routeMap.set(RouteHelper.SIGNUP, "signup/index");
        this.routeMap.set(RouteHelper.CLASS_DETAIL, "class-detail/index");
        this.routeMap.set(RouteHelper.SESSION_CLASS, "session-class/index");
        this.routeMap.set(RouteHelper.SESSION_CLASS_DETAIL, "session-detail");
        this.routeMap.set(RouteHelper.EVENT, "event/index");
        this.routeMap.set(RouteHelper.EVENT_DETAIL, "event/detail");
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
