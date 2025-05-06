import { controller, httpGet, httpPost } from "inversify-express-utils";
import { HttpCode, UserService, StudentService, RoleService, Variables } from "@inversifyjs/application";
import { BaseController } from "./base-controller";
import { inject } from "inversify";
import { TYPES } from "@inversifyjs/application";
import { Response, Request } from "express";
import { RouteHelper, Permission } from "@inversifyjs/application";
import { checkPermissions, verifyAuthTokenRouter } from "@inversifyjs/infrastructure";
import { uploadMiddleware } from "@inversifyjs/infrastructure";
import * as fs from "fs";
@controller(RouteHelper.USER_LIST)
export class UserController extends BaseController {
    private userService: UserService;
    private studentService: StudentService;
    private roleService: RoleService;

    public constructor(@inject(TYPES.UserService) _userService: UserService, @inject(TYPES.StudentService) _studentService: StudentService, @inject(TYPES.RoleService) _roleService: RoleService) {
        super();
        this.userService = _userService;
        this.studentService = _studentService;
        this.roleService = _roleService;
    }

    @httpGet("/", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN, Permission.ONLY_TEACHER]))
    public async getAllUsers(request: Request, response: Response): Promise<void> {
        let successMessage: string = "";
        if (request.cookies.messages) {
            successMessage = "「" + request.cookies.messages.user + "」" + request.cookies.messages.message;
            response.clearCookie("messages");
        }
        // Có thể search theo tên, email, số điện thoại, mã sinh viên, phòng ban,
        let roleId: any = request.query.roleSelect || Permission.ONLY_ADMIN;
        let name: any = (request.query.searchField as string)?.trim() || "";
        let valid: any = request.query.validSelect || Permission.ONLY_ADMIN;
        let page: any = request.query.page || 1;
        let sortBy: any = request.query.sortBy || "firstName";
        let sort: any = request.query.sort || "asc";

        try {
            let users = await this.userService.showUserList(roleId, valid, name, page, this.limitedItem, sortBy, sort);
            let roleList = await this.roleService.findAll();
            if (users) {
                response.render(this.routeHelper.getRenderPage(RouteHelper.USER_LIST), {
                    users: users.list,
                    roleSelect: roleId,
                    validSelect: valid,
                    roleList,
                    validList: Variables.VALID_USER,
                    searchField: name,
                    limit: this.limitedItem,
                    total: users.total,
                    successMessage,
                    page: users?.pageSize,
                    lastPage: Math.ceil(users.total / this.limitedItem),
                    sortBy,
                    sort,
                });
            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    @httpPost("/import_csv", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN]), uploadMiddleware.single("file"))
    public async importCSV(request: Request, response: Response): Promise<void> {
        if (!request.file) {
            response.status(HttpCode.BAD_REQUEST).send({ message: "File not found", status: HttpCode.BAD_REQUEST });
        }
        try {
            const filePath: any = request.file?.path;
            fs.createReadStream(filePath)
                .pipe(require("csv-parser")())
                .on("data", async (row: any) => {
                    // check if email exists in database
                    let emailExists = await this.userService.findByEmail(row.email);
                    if (emailExists) {
                        this.logger.error("Email already exists: " + row.email);
                    } else {
                        let user = this.userService.create();
                        if (user) {
                            user.email = row.email;
                            user.firstName = row.firstname;
                            user.lastName = row.lastname;
                            user.phoneNumber = "";
                            user.roleId = 4; // 4 = student
                            user.active = 1;
                            this.userService.save(user)?.then((user: any) => {
                                let student = this.studentService.create();
                                if (student) {
                                    student.student_number = row.student_number;
                                    student.studentId = user.id;
                                    student.major = row.major;
                                    this.studentService.save(student);
                                    this.logger.info("Student created successfully");
                                }
                            });
                        }
                    }
                })
                .on("end", () => {
                    fs.unlinkSync(filePath);
                });
            response.status(HttpCode.IMPORT_SUCCESS).send({ message: "File imported successfully", status: HttpCode.IMPORT_SUCCESS });
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }
}
