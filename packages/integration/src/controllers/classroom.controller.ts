import { controller, httpGet, httpPost } from "inversify-express-utils";
import { BaseController } from "./base-controller";
import { CourseClassService, CourseService, DepartmentService, HttpCode, Messages, Permission, RouteHelper, TYPES, UserService, Variables } from "@inversifyjs/application";
import { inject } from "inversify";
import { checkPermissions, uploadMiddleware, verifyAuthTokenRouter } from "@inversifyjs/infrastructure";
import * as fs from "fs";
import { Response, Request } from "express";

@controller(RouteHelper.CLASSROOM)
export class ClassroomController extends BaseController {
    private courseService!: CourseService;
    private courseClassService!: CourseClassService;
    private userService!: UserService;
    private departmentService!: DepartmentService;
    public constructor(
        @inject(TYPES.CourseService) _courseService: CourseService, 
        @inject(TYPES.CourseClassService) _courseClassService: CourseClassService, 
        @inject(TYPES.UserService) _userService: UserService,
        @inject(TYPES.DepartmentService) _departmentService: DepartmentService
    ) {
        super();
        this.courseService = _courseService;
        this.courseClassService = _courseClassService;
        this.userService = _userService;
        this.departmentService = _departmentService;
    }

    // Môn học
    @httpGet(RouteHelper.COURSES, verifyAuthTokenRouter,checkPermissions([Permission.ONLY_ADMIN]))
    public async getCourses(request: any, response: any): Promise<void> {
        let successMessage: string = "";
        if (request.cookies.messages) {
            successMessage = "「"+ request.cookies.messages.message + "」";
            response.clearCookie("messages");
        }

        let department: any = request.query.departmentSelect || Variables.ALL;
        let name: any = (request.query.searchField as string)?.trim() || "";
        let page: any = request.query.page || 1;
        let sortBy: any = request.query.sortBy;
        let sort: any = request.query.sort || "ASC";
        try {
            let courses = await this.courseService.showCourseList(department, name, page, this.limitedItem, sortBy, sort);
            let departmentList = await this.departmentService.findAll();
            if (courses) {
                response.render(this.routeHelper.getRenderPage(RouteHelper.COURSES), {
                    courses: courses.list,
                    departmentSelect: department,
                    departmentList: departmentList,
                    searchField: name,
                    limit: this.limitedItem,
                    total: courses.total,
                    successMessage,
                    page: courses?.pageSize,
                    lastPage: Math.ceil(courses.total / this.limitedItem),
                    sortBy,
                    sort,
                });
            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    @httpPost("/course-upload-csv", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN]), uploadMiddleware.single("file"))
    public async uploadCourseCSV(request: Request, response: Response): Promise<void> {
        if (!request.file) {
            response.status(HttpCode.BAD_REQUEST).send({ message: Messages.FILE_NOT_FOUND, status: HttpCode.BAD_REQUEST });
        }
        try {
            let departments = await this.departmentService.findAll();
            const filePath: any = request.file?.path;
            fs.createReadStream(filePath)
                .pipe(require("csv-parser")())
                .on("data", async (row: any) => {
                    let courseExist = await this.courseService.getCourseByCode(row.course_code);
                    if (courseExist) {
                        this.logger.error(Messages.COURSE_EXISTED + ": " + row.course_code);
                    } else {
                        let course = this.courseService.create();
                        if (course) {
                            course.courseCode = row.course_code;
                            course.courseName = row.course_name;
                            course.courseDescription = row.course_description;
                            course.credit = row.credit;
                            departments?.forEach((department: any) => {
                                if (department.departmentName === row.department) {
                                    course.departmentId = department.id;
                                }
                            });
                            if (departments?.length === 0) {
                                course.departmentId = 0;
                            }
                            this.courseService.save(course)?.then(() => {
                                this.logger.info(Messages.IMPORT_COURSE_SUCCESS + ": " + row.course_name);
                            })
                            .catch((error: any) => {
                                this.logger.error(Messages.IMPORT_COURSE_FAILED + ": " + row.course_name + " - " + error.message);
                            });
                        }
                    }

                })
                .on("end", () => {
                    fs.unlinkSync(filePath);
                });
            response.status(HttpCode.IMPORT_SUCCESS).cookie("messages", { message: Messages.IMPORT_COURSE_SUCCESS }).send({ status: HttpCode.IMPORT_SUCCESS });
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    @httpPost("/course-class-upload-csv", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN]), uploadMiddleware.single("file"))
    public async uploadCourseClassCSV(request: Request, response: Response): Promise<void> {
        if (!request.file) {
            response.status(HttpCode.BAD_REQUEST).send({ message: Messages.FILE_NOT_FOUND, status: HttpCode.BAD_REQUEST });
        }
        try {
            const filePath: any = request.file?.path;
            fs.createReadStream(filePath)
                .pipe(require("csv-parser")())
                .on("data", async (row: any) => {
                    console.log("row", row);
                    // let courseClassExist = await this.courseClassService.getCourseClassByCode(row.class_code);
                    // if (courseClassExist) {
                        // this.logger.error(Messages.COURSE_EXISTED + ": " + row.class_code);
                    // } else {
                        // let courseClass = this.courseClassService.create();
                        // if (courseClass) {
                        //     courseClass.classCode = row.class_code;
                        //     courseClass.className = row.class_name;
                        //     courseClass.semester = row.semester;
                        //     courseClass.group = row.group;
                        //     courseClass.startDate = row.start_date;
                        //     courseClass.endDate = row.end_date;
                        //     courseClass.schedule = JSON.parse(row.schedule);
                        //     this.courseClassService.save(courseClass)?.then(() => {
                        //         this.logger.info(Messages.IMPORT_COURSE_SUCCESS + ": " + row.class_name);
                        //     })
                        //     .catch((error: any) => {
                        //         this.logger.error(Messages.IMPORT_COURSE_FAILED + ": " + row.class_name + " - " + error.message);
                        //     });
                        // }
                    // }

                })
                .on("end", () => {
                    fs.unlinkSync(filePath);
                });
            response.status(HttpCode.IMPORT_SUCCESS).cookie("messages", { message: Messages.IMPORT_COURSE_SUCCESS }).send({ status: HttpCode.IMPORT_SUCCESS });
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    // Lớp học
    @httpGet(RouteHelper.CLASSES, verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN, Permission.ONLY_TEACHER]))
    public async getClasses(request: any, response: any): Promise<void> {
        let successMessage: string = "";
        if (request.cookies.messages) {
            successMessage = "「" + request.cookies.messages.user + "」" + request.cookies.messages.message;
            response.clearCookie("messages");
        }
        
        let teacher: any = request.query.teacherSelect || Variables.ALL;
        let course: any = request.query.courseSelect || Variables.ALL;
        let group: any = request.query.groupSelect || Variables.ALL;
        let semester: any = request.query.semesterSelect || Variables.ALL;
        let name: any = (request.query.searchField as string)?.trim() || "";
        // console.log("name", name);
        let page: any = request.query.page || 1;
        let sortBy: any = request.query.sortBy || "id";
        let sort: any = request.query.sort || "ASC";
        try {
            // người đăng nhập hiện tại
            let userId = request.session.userId;
            if (userId === Permission.ONLY_TEACHER) {
                teacher = userId;
            }
            let classes = await this.courseClassService.showCourseClassList(teacher, course, group, semester, name, page, this.limitedItem, sortBy, sort);
            let courseList = await this.courseService.findAll();;
            let teacherList = await this.userService.getAllTeacher();
            let semesterList = await this.courseClassService.getSemesterList();
            if (classes) {
                
                    
                const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
                const dayMap: any = {
                    monday: "Thứ 2",
                    tuesday: "Thứ 3",
                    wednesday: "Thứ 4",
                    thursday: "Thứ 5",
                    friday: "Thứ 6",
                    saturday: "Thứ 7",
                    sunday: "Chủ nhật"
                };
                function sortClassSchedule(schedule: Record<string, string[]>): { day: string, label: string, times: string[] }[] {
                    return Object.entries(schedule)
                      .sort(([a], [b]) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
                      .map(([day, times]) => ({
                        day,
                        label: dayMap[day],
                        times
                      }));
                  }
                classes.list.forEach((item: any) => {
                    item.schedule = sortClassSchedule(item.classSchedule);
                });

                response.render(this.routeHelper.getRenderPage(RouteHelper.CLASSES), {
                    classes: classes.list,
                    courseSelect: course,
                    groupSelect: group,
                    semesterSelect: semester,
                    teacherSelect: teacher,
                    courseList: courseList,
                    teacherList: teacherList,
                    semesterList: semesterList,
                    searchField: name,
                    limit: this.limitedItem,
                    total: classes.total,
                    successMessage,
                    page: classes?.pageSize,
                    lastPage: Math.ceil(classes.total / this.limitedItem),
                    sortBy,
                    sort,
                });
            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
        
    }

    // Trả về thông tin course được chọn
    @httpGet("/course/info/:id", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN, Permission.ONLY_TEACHER]))
    public async getCourseInfo(request: any, response: any): Promise<void> {
        let courseId = request.params.id;
        try {
            let course = await this.courseService.findById(courseId,["department"]);
            if (course) {
                response.status(HttpCode.SUCCESSFUL).json(course);
            } else {
                response.status(HttpCode.NOT_FOUND).send({ message: Messages.COURSE_NOT_FOUND, status: HttpCode.NOT_FOUND });
            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    @httpPost("/course/:id/edit", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN]), uploadMiddleware.single("file"))
    public async editCourse(request: any, response: any): Promise<void> {
        let courseId = Number(request.params.id);
        let name: string = request.body.courseName;
        let code: string = request.body.courseCode;
        let credit: number = request.body.credit;
        let url: string = request.body.url;
        let oldCourse = await this.courseService.findById(courseId,["department"]);
        try {
            if (!name) this.errors = {...this.errors, courseName: Messages.COURSE_NAME_REQUIRED };
            if (!code) this.errors = {...this.errors, courseCode: Messages.COURSE_CODE_REQUIRED };
            if (!credit) this.errors = {...this.errors, credit: Messages.COURSE_CREDITS_REQUIRED };

            if (this.errors) {
                return response.status(HttpCode.SUCCESSFUL).send({ errors: this.errors });
            }

            delete request.body.id;

            let newCourse = {
                id: courseId,
                ...request.body,
            }
            if (newCourse) {
                this.courseService.save(newCourse);
            }

            return response.status(HttpCode.SUCCESSFUL).cookie("messages", { message: Messages.UPDATE_COURSE_SUCCESS, course: newCourse}).send({ url: url });
            
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    @httpPost("/course/:id/delete", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN]))
    public async deleteCourse(request: any, response: any): Promise<void> {
        let courseId = Number(request.params.id);
        let url = request.body.href || "";
        try {
            let course = await this.courseService.findById(courseId);
            if (course) {
                await this.courseService.delete(courseId);
                return response.status(HttpCode.SUCCESSFUL).cookie("messages", { message: Messages.DELETE_COURSE_SUCCESS, user: course.courseName}).redirect(RouteHelper.CLASSROOM + RouteHelper.COURSES + url);
            } else {
                return response.status(HttpCode.NOT_FOUND).send({ message: Messages.COURSE_NOT_FOUND, status: HttpCode.NOT_FOUND });
            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    @httpPost("/course/create", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN]))
    public async createCourse(request: any, response: any): Promise<void> {
        let name: string = request.body.courseName;
        let code: string = request.body.courseCode;
        let credit: number = request.body.credit;
        let url: string = request.body.url;
        try {
            if (!name) this.errors = {...this.errors, courseName: Messages.COURSE_NAME_REQUIRED };
            if (!code) this.errors = {...this.errors, courseCode: Messages.COURSE_CODE_REQUIRED };
            if (!credit) this.errors = {...this.errors, credit: Messages.COURSE_CREDITS_REQUIRED };

            if (this.errors) {
                return response.status(HttpCode.SUCCESSFUL).send({ errors: this.errors });
            }
            // check if course already exists
            let courseExist = await this.courseService.getCourseByCode(code);
            if (courseExist) {
                this.errors = {...this.errors, courseCode: Messages.COURSE_EXISTED };
                return response.status(HttpCode.SUCCESSFUL).send({ errors: this.errors });
            }
            let course = {
                ...request.body,
            }

            if (course) {
                this.courseService.save(course);
            }
            return response.status(HttpCode.SUCCESSFUL).cookie("messages", { message: Messages.CREATE_COURSE_SUCCESS, course: course}).send({ url: url });
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }


}
