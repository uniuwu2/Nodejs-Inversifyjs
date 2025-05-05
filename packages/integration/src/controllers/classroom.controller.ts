import { controller, httpGet, httpPost } from "inversify-express-utils";
import { BaseController } from "./base-controller";
import { CourseClassService, CourseService, HttpCode, Permission, RouteHelper, TYPES, UserService, Variables } from "@inversifyjs/application";
import { inject } from "inversify";
import { checkPermissions, uploadMiddleware, verifyAuthTokenRouter } from "@inversifyjs/infrastructure";
import * as fs from "fs";
import { Response, Request } from "express";

@controller(RouteHelper.CLASSROOM)
export class ClassroomController extends BaseController {
    private courseService!: CourseService;
    private courseClassService!: CourseClassService;
    private userService!: UserService;
    public constructor(@inject(TYPES.CourseService) _courseService: CourseService, @inject(TYPES.CourseClassService) _courseClassService: CourseClassService, @inject(TYPES.UserService) _userService: UserService) {
        super();
        this.courseService = _courseService;
        this.courseClassService = _courseClassService;
        this.userService = _userService;
    }

    // Môn học
    @httpGet(RouteHelper.COURSES, verifyAuthTokenRouter,checkPermissions([Permission.ONLY_ADMIN]))
    public async getCourses(request: any, response: any): Promise<void> {
        let successMessage: string = "";
        if (request.cookies.messages) {
            successMessage = "「" + request.cookies.messages.user + "」" + request.cookies.messages.message;
            response.clearCookie("messages");
        }

        let deparment: any = request.query.departmentSelect || Variables.ALL;
        let name: any = (request.query.searchField as string)?.trim() || "";
        let page: any = request.query.page || 1;
        let sortBy: any = request.query.sortBy || "courseName";
        let sort: any = request.query.sort || "asc";
        try {
            let courses = await this.courseService.showCourseList(deparment, name, page, this.limitedItem, sortBy, sort);
            let departmentList = await this.courseService.getDepartmentList();
            if (courses) {
                response.render(this.routeHelper.getRenderPage(RouteHelper.COURSES), {
                    courses: courses.list,
                    departmentSelect: deparment,
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
            response.status(HttpCode.BAD_REQUEST).send({ message: "File not found", status: HttpCode.BAD_REQUEST });
        }
        try {
            const filePath: any = request.file?.path;
            fs.createReadStream(filePath)
                .pipe(require("csv-parser")())
                .on("data", async (row: any) => {
                    let courseExist = await this.courseService.getCourseByCode(row.code);
                    if (courseExist) {
                        this.logger.error("Course already exists: " + row.code);
                    } else {
                        let course = this.courseService.create();
                        if (course) {
                            course.courseCode = row.code;
                            course.courseName = row.name;
                            course.department = row.department;
                            course.courseDescription = row.description;
                            course.credit = row.credit;
                            this.courseService.save(course)?.then(() => {
                                this.logger.info("Course created successfully: " + row.code);
                            })
                            .catch((error: any) => {
                                this.logger.error("Error creating course: " + error.message);
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
        let sort: any = request.query.sort || "asc";
        try {
            // người đăng nhập hiện tại
            let userId = request.session.userId;
            if (userId === Permission.ONLY_TEACHER) {
                teacher = userId;
            }
            let classes = await this.courseClassService.showCourseClassList(teacher, course, group, semester, name, page, this.limitedItem, sortBy, sort);
            let courseList = await this.courseService.findAll();;
            let teacherList = await this.userService.getAllTeacher();
            let semesterList = [...new Set(classes?.list.map(item => item.semester))];
            
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
}
