import { controller, httpGet, httpPost } from "inversify-express-utils";
import { EncryptHelper, HttpCode, Message, RouteHelper, TYPES, UserService, Variables } from "@inversifyjs/application";
import { BaseController } from "./base-controller";
import { inject } from "inversify";
import { Request, Response } from "express";
import { User, Role } from "@inversifyjs/domain";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import * as randToken from "rand-token";
const passport = require("passport");
import "../auth-passport";
import { access } from "fs";
@controller(RouteHelper.LOGIN)
export class LoginController extends BaseController {
    private userService: UserService;
    private expiredSession: number;
    private tokenKey: string;
    private refreshTokenSize: string;


    constructor(@inject(TYPES.UserService) userService: UserService) {
        super();
        this.userService = userService;
        this.expiredSession = Variables.EXPIRED_SESSION;
        this.tokenKey = process.env.TOKEN_KEY!;
        this.refreshTokenSize = process.env.REFRESH_TOKEN_SIZE!;
    }

    @httpGet("/")
    public index(request: Request, response: Response): void {
        if (this.routeHelper != undefined) {
            if ((request.session as any).userId) {
                return response.redirect(RouteHelper.INDEX + RouteHelper.HOME);
            }
            (request.session as any).userId = 0;
            return response.render(this.routeHelper.getRenderPage(RouteHelper.LOGIN));
        }
    }

    @httpPost("/")
    public async handleLogin(request: Request, response: Response): Promise<void> {
        try {
            let email: string = request.body.email;
            let password: string = request.body.password;
            let remember: string = request.body.remember;
            if (this.routeHelper != undefined) {
                // Validate userName and password

                if (!email) this.errors = { ...this.errors, email: Message.INVALID_EMAIL };
                if (!password) this.errors = { ...this.errors, password: Message.INVALID_PASSWORD };
                if (this.errors) {
                    return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.LOGIN), { errorValidator: this.errors, data: request.body });
                }

                if (remember === "on") {
                    this.expiredSession = Variables.REMEMBER_SESSION;
                    request.session.cookie.maxAge = Variables.REMEMBER_SESSION;
                }

                // Validate if user exists in the database
                let user: User | undefined | null = await this.userService.findByEmail(email);
                if (user && (await bcrypt.compare(password, user.password))) {
                    if (!user.active) {
                        this.logger.error(Message.LOGIN_FAIL);
                        response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.LOGIN), { message: Message.USER_IS_BLOCKED, data: request.body });
                    }

                    /** Create access token */
                    let accessToken: string = jwt.sign({ userId: user.id, remember }, this.tokenKey, { expiresIn: `${process.env.REMEMBER_TOKEN!}s` });
                    let refreshToken = randToken.generate(parseInt(this.refreshTokenSize));

                    user.refreshToken = refreshToken;
                    // Save user with refresh token to DB
                    await this.userService.save(user);

                    this.logger.info(Message.LOGIN_SUCCESS);
                    (request.session as any).userId = user.id;
                    response.cookie("wacts", EncryptHelper.encryptToken(accessToken), { maxAge: this.expiredSession }).redirect(RouteHelper.INDEX + RouteHelper.HOME);
                }

            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.LOGIN), { message: Message.INVALID_CREDENTIAL });
        }
    }

    @httpGet("/auth/google/callback")
    public async googleCallback(request: Request, response: Response, next: any): Promise<void> {
        try {
            const userData = await new Promise<any>((resolve, reject) => {
                passport.authenticate("google", { session: true }, (err: any, data: any, info: any) => {
                    if (err) {
                        return reject(err);
                    }
                    if (!data) {
                        return reject(new Error('No user found'));
                    }
                    resolve(data);
                })(request, response, next);
            });

            // console.log(userData);

            // Kiểm tra xem người dùng đã tồn tại trong cơ sở dữ liệu chưa
            let user: User | undefined | null = await this.userService.findByEmail(userData.profile.emails[0].value);
            // console.log("user", user);
            // const accessToken: string = userData.accessToken;
            // const refreshToken = randToken.generate(parseInt(this.refreshTokenSize));
            if (!user) {
                // Nếu người dùng chưa tồn tại, tạo mới người dùng
                let newUser = await this.userService.createFromGoogle(userData.profile);
                if (newUser) {
                    user = await this.userService.findOneById(newUser.id);
                }
            }
            let accessToken: string = jwt.sign({ userId: user?.id }, this.tokenKey, { expiresIn: `${process.env.REMEMBER_TOKEN!}s` });
            let refreshToken = randToken.generate(parseInt(this.refreshTokenSize));
            if (user) {
                user.refreshToken = refreshToken;
                user.role = { id: user.roleId } as Role;
                // Lưu người dùng với refresh token vào cơ sở dữ liệu
                await this.userService.save(user);
                (request.session as any).userId = user.id;
            }
            // Lưu thông tin người dùng vào session
            response.cookie("wacts", EncryptHelper.encryptToken(accessToken), { maxAge: this.expiredSession }).redirect(RouteHelper.INDEX + RouteHelper.HOME);

        } catch (err) {
            console.error("Authentication error:", err);
            response.redirect(RouteHelper.LOGIN);
        }
    }






    @httpGet("/auth/google")
    public googleLogin(req: Request, res: Response): void {
        passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
    }
}