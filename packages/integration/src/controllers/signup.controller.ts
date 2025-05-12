import { controller, httpGet, httpPost } from "inversify-express-utils";
import { Request, Response } from "express";
import { inject } from "inversify";
import { BaseController } from "./base-controller";
import { HttpCode, Permission, RoleService, RouteHelper, TYPES, UserPermission, UserService, DepartmentService, EncryptHelper } from "@inversifyjs/application";
import { checkPermissions, verifyAuthTokenRouter } from "@inversifyjs/infrastructure";

@controller(RouteHelper.SIGNUP)
export class SignupController extends BaseController {
    private userService: UserService;
    private roleService: RoleService;
    private departmentService!: DepartmentService;
    constructor(@inject(TYPES.UserService) userService: UserService,
        @inject(TYPES.RoleService) roleService: RoleService,
        @inject(TYPES.DepartmentService) departmentService: DepartmentService) {
        super();
        this.userService = userService;
        this.roleService = roleService;
        this.departmentService = departmentService;
    }

    @httpGet("/", verifyAuthTokenRouter)
    public async getSignupPage(request: Request, response: Response): Promise<void> {
        let roles = await this.roleService.findAll();
        let departments = await this.departmentService.findAll();
        if (this.routeHelper != undefined) {
            response.render(this.routeHelper.getRenderPage(RouteHelper.SIGNUP), { user: null, roles, departments });
        }
    }

    @httpGet("/:id", verifyAuthTokenRouter)
    public async editUser(request: Request, response: Response): Promise<void> {
        let userId = Number(request.params.id) || 0;
        try {
            let roles = await this.roleService.findAll();
            let departments = await this.departmentService.findAll();
            let user = await this.userService.findById(userId, ["role", "student", "department"]);
            if (!user) {
                return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
            }
            if (
                (user?.id !== response.locals.jwtPayload.user.id && response.locals.jwtPayload.user.roleId !== UserPermission.admin) 
                
            ) {
                return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.UNAUTHORIZATION));
            }

            if ((response.locals.jwtPayload.user.roleId === UserPermission.admin) ||
                (response.locals.jwtPayload.user.roleId === request.params.id)
            ) {
                return response.render(this.routeHelper.getRenderPage(RouteHelper.SIGNUP), { user: { ...user, role: user?.roleId }, roles, departments });
            } 
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.UNAUTHORIZATION));
            
        } catch (error: any) {
            this.logger.error(error);
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
        }
    }

    @httpPost("/:id", verifyAuthTokenRouter)
    public async editUserPost(request: Request, response: Response): Promise<void> {
        let userId = Number(request.params.id);
        let oldUser = await this.userService.findById(userId, ["role", "student", "department"]);
        let roles = await this.roleService.findAll();
        let departments = await this.departmentService.findAll();

        // Request body
        let email: string = request.body.email;
        let password: string = request.body.password;
        let confirmPassword: string = request.body.confirmPassword;
        let roleId: number = Number(request.body.role);
        let departmentId: number = Number(request.body.department);
        let firstName: string = request.body.firstName;
        let lastName: string = request.body.lastName;
        let phoneNumber: string = request.body.phoneNumber;
        // console.log("request.body", request.body);
        try {
            this.logger.info(`body: ${JSON.stringify(request.body)}`);

            if (!firstName) this.errors = {...this.errors, firstName: "First name is required" };
            if (!lastName) this.errors = {...this.errors, lastName: "Last name is required" };
            // if (!phoneNumber) this.errors = {...this.errors, phoneNumber: "Phone number is required" };
            if ((password || confirmPassword) && password?.length < 6) this.errors = {...this.errors, password: "Password must be at least 6 characters" };
            if ((password || confirmPassword) && confirmPassword?.toLowerCase() !== password?.toLowerCase()) this.errors = {...this.errors, confirmPassword: "Password and confirm password do not match" };
            if (!roleId || isNaN(roleId)) this.errors = {...this.errors, roleId: "Role is required" };
            
            if (this.errors) {
                return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.SIGNUP), { errorValidator: this.errors, user: { id: userId, ...request.body }, roles, departments });
            }

            if (password) password = await EncryptHelper.bcryptHash(password);

            delete request.body.role;
            delete request.body.department;

            let newUser = {
                ...request.body,
                id: userId,
                password: password,
                roleId: roleId,
                departmentId: departmentId,
            }

            await this.userService.save(newUser);

            return response.cookie("messsage", "User updated successfully").status(HttpCode.CREATED).redirect(RouteHelper.USER_PROFILE + "/" + userId);
        } catch (error: any) {
            this.logger.error(error);
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.INTERNAL_SERVER_ERROR));
        }
    }

    @httpPost("/", verifyAuthTokenRouter)
    public async postSignup(request: Request, response: Response): Promise<void> {
        let roles = await this.roleService.findAll();
        let departments = await this.departmentService.findAll();

        let userEntity = this.userService.create();

        // Request body
        let email: string = request.body.email;
        let password: string = request.body.password;
        let confirmPassword: string = request.body.confirmPassword;
        let roleId: number = Number(request.body.role);
        let departmentId: number = Number(request.body.department);
        let firstName: string = request.body.firstName;
        let lastName: string = request.body.lastName;

        try {
            this.logger.info(`body: ${JSON.stringify(request.body)}`);

            if (!firstName) this.errors = {...this.errors, firstName: "First name is required" };
            if (!lastName) this.errors = {...this.errors, lastName: "Last name is required" };
            if (!email) this.errors = {...this.errors, email: "Email is required" };
             if (!password) this.errors = { ...this.errors, password: "Password is required" };
            else if (password?.length < 6) this.errors = { ...this.errors, password: "Password must be at least 6 characters" };
            if (!confirmPassword) this.errors = { ...this.errors, confirmPassword: "Confirm password is required" };
            else if (confirmPassword?.length < 6) this.errors = { ...this.errors, confirmPassword: "Confirm password must be at least 6 characters" };
            
            if (this.errors) {
                return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.SIGNUP), { errorValidator: this.errors, user: request.body, roles, departments });
            }

            let user = await this.userService.findByEmail(email);
            if (user) {
                return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.SIGNUP), { errorValidator: { email: "Email already exists" }, user: request.body, roles, departments });
            }

            password = await EncryptHelper.bcryptHash(password);


            userEntity = {
                ...request.body,
                createdBy: "admin",
                password: password,
                roleId: roleId,
                departmentId: departmentId,
                active: true,
            }

            if (userEntity) {
                await this.userService.save(userEntity);
            }

            return response.cookie("messsage", "User created successfully").status(HttpCode.CREATED).redirect(RouteHelper.USER_LIST);
        } catch (error: any) {
            console.log("error", error);
            this.logger.error(error);
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.INTERNAL_SERVER_ERROR));
        }
    }
}

