import { controller, httpGet, httpPost } from "inversify-express-utils";
import { HttpCode, UserService, StudentService, RoleService, Variables, DepartmentService } from "@inversifyjs/application";
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
    private departmentService: DepartmentService
    public constructor(
        @inject(TYPES.UserService) _userService: UserService, 
        @inject(TYPES.StudentService) _studentService: StudentService, 
        @inject(TYPES.RoleService) _roleService: RoleService,
        @inject(TYPES.DepartmentService) _departmentService: DepartmentService
    ) {
        super();
        this.userService = _userService;
        this.studentService = _studentService;
        this.roleService = _roleService;
        this.departmentService = _departmentService;
    }

    @httpGet("/", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN, Permission.ONLY_TEACHER]))
    public async getAllUsers(request: Request, response: Response): Promise<void> {
        let successMessage: string = "";
        if (request.cookies.messages) {
            successMessage = "「" + request.cookies.messages.user + "」" + request.cookies.messages.message;
            response.clearCookie("messages");
        }
        // Có thể search theo tên, email, số điện thoại, mã sinh viên, phòng ban,
        let roleId: any = request.query.roleSelect || Variables.ALL;
        let name: any = (request.query.searchField as string)?.trim() || "";
        let valid: any = request.query.validSelect || Variables.ALL;
        let page: any = request.query.page || 1;
        let sortBy: any = request.query.sortBy;
        let sort: any = request.query.sort || "ASC";

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
            let departments = await this.departmentService.findAll();
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
                            departments?.forEach((department: any) => {
                                if (department.departmentName === row.department) {
                                    user.departmentId = department.id;
                                }
                            });
                            if (departments?.length === 0) {
                                user.departmentId = null;
                            }
                            this.userService.save(user)?.then((user: any) => {
                                let student = this.studentService.create();
                                if (student) {
                                    student.student_number = row.student_number;
                                    student.studentId = user.id;
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
    
    @httpPost("/:id/delete" , verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN]))
    public async deleteUser(request: Request, response: Response): Promise<void> {
        let userId = Number(request.params.id);
        let user = await this.userService.findById(userId);
        let pathHref = String(request.body.href);
        try {
            if (user?.imagePath) {
                let path = `${process.env.IMAGE_PATH}/${user.imagePath}`;
                fs.rmSync(path, { recursive: true, force: true });
            }

            await this.userService.delete(userId);

            return response.cookie("messages", "User deleted successfully").redirect(RouteHelper.USER_LIST + pathHref);
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

}
