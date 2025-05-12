import { HttpCode, RouteHelper, TYPES, UserPermission, UserService, Variables } from "@inversifyjs/application";
import { controller, httpGet, httpPost } from "inversify-express-utils";
import { BaseController } from "./base-controller";
import { uploadMiddleware, verifyAuthTokenRouter } from "@inversifyjs/infrastructure";
import { inject } from "inversify";
import { Response, Request } from "express";
import * as fs from "fs";
import * as path from "path";
@controller("/profile")
export class UserProfileController extends BaseController {
    private userService!: UserService
    private imgDir!: string;

    constructor(@inject(TYPES.UserService) userService: UserService) {
        super();
        this.userService = userService;
        this.imgDir = process.env.IMAGE_PATH!;
    }

    @httpGet("/:id", verifyAuthTokenRouter)
    public async index(request: Request, response: Response, message?: string): Promise<void> {
        let successMessage: string = "";
        let userId = Number(request.params.id);
        try {
            if (!userId) {
                return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
            }
            let user = await this.userService.findById(userId,["role", "student", "department"]);

            if (user?.id !== response.locals.jwtPayload.user.id && response.locals.jwtPayload.user.roleId !== UserPermission.admin)
            {
                return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.UNAUTHORIZATION));
            }

            if (request.cookies.messages) {
                successMessage = "「" + request.cookies.messages.user + "」" + request.cookies.messages.message;
                response.clearCookie("messages");
            }
            if (!user) {
                return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
            }

            return response.render(this.routeHelper.getRenderPage(RouteHelper.USER_PROFILE), { user_info: user, successMessage, errorMessage: message});
        } catch (error: any) {
            this.logger.error(error);
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));

        }
    }

    @httpPost("/:id/updateAvatar", verifyAuthTokenRouter, uploadMiddleware.single("avatar"))
    public async updateAvatar(request: Request, response: Response): Promise<void> {
        let userId = Number(request.params.id);
        let user = await this.userService.findById(userId);
        let imagePath = `${user?.id}/${request.file?.originalname}`;
        try {
            this.logger.info(`user: ${JSON.stringify(user)}`);


            if (!request.file) {
                console.log("File not found");
                return this.index(request, response, "Please select an image");
            }

            // Check file type
            if (request.file && request.file?.size > Variables.UPLOAD_IMAGE_MAX) {
                await fs.unlink(path.join(this.imgDir, request.file?.filename), (err: any) => {
                    if (err) throw err;
                });
                return this.index(request, response, "Image size is too large");
            }

            // // Remove Old Path When imagePath field is exists
            if (user?.imagePath) {
                await fs.unlink(path.join(this.imgDir, user.imagePath), (err: any) => {
                    if (err) {
                        user?.imagePath;
                    }
                });
            }

            // Move file is correct user folder
            if (user && request.file) {
                // Create folder If directory is not exists
                if (!fs.existsSync(path.join(this.imgDir, String(user.id)))) fs.mkdirSync(path.join(this.imgDir, String(user.id)));

                let oldPath = path.join(this.imgDir, request.file?.filename);
                let newPath = path.join(this.imgDir, imagePath);
                fs.rename(oldPath, newPath, (err: any) => {
                    if (err) throw err;
                });
            }

            // Save user in db
            if (user) {
                user.imagePath = imagePath;
                
                await this.userService.save(user);
            }
            return response.cookie("messages", "User updated successfully").redirect(RouteHelper.USER_PROFILE + "/" + userId);

        } catch (error: any) {
            this.logger.error(error);
            return this.index(request, response, error.message);
        }
    }
}