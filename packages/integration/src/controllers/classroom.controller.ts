import { controller, httpGet, httpPost } from "inversify-express-utils";
import { BaseController } from "./base-controller";
import { ClassStudentService, CourseClassService, CourseService, DepartmentService, HttpCode, Messages, Permission, RouteHelper, TYPES, UserService, Variables } from "@inversifyjs/application";
import { inject } from "inversify";
import { checkPermissions, uploadMiddleware, verifyAuthTokenRouter } from "@inversifyjs/infrastructure";
import * as fs from "fs";
import { Response, Request } from "express";
import { In, Like, Not } from "typeorm";
import { ClassStudent } from "@inversifyjs/domain";

@controller(RouteHelper.CLASSROOM)
export class ClassroomController extends BaseController {
    private courseService!: CourseService;
    private courseClassService!: CourseClassService;
    private userService!: UserService;
    private departmentService!: DepartmentService;
    private classStudentService!: ClassStudentService
    public constructor(
        @inject(TYPES.CourseService) _courseService: CourseService,
        @inject(TYPES.CourseClassService) _courseClassService: CourseClassService,
        @inject(TYPES.UserService) _userService: UserService,
        @inject(TYPES.DepartmentService) _departmentService: DepartmentService,
        @inject(TYPES.ClassStudentService) _classStudentService: ClassStudentService
    ) {
        super();
        this.courseService = _courseService;
        this.courseClassService = _courseClassService;
        this.userService = _userService;
        this.departmentService = _departmentService;
        this.classStudentService = _classStudentService;
    }

    // Môn học
    @httpGet(RouteHelper.COURSES, verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN]))
    public async getCourses(request: Request, response: Response): Promise<void> {
        let successMessage: string = "";
        if (request.cookies.messages) {
            successMessage = "「" + request.cookies.messages.message + "」";
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
                            this.courseService
                                .save(course)
                                ?.then(() => {
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
                    let courseId = await this.courseService.getCourseByCode(row.course_code);
                    if (!courseId) {
                        this.logger.error(Messages.COURSE_NOT_FOUND + ": " + row.course_code);
                        return;
                    }
                    let teacherId = await this.userService.getTeacherByEmail(row.teacher_email);
                    if (!teacherId) {
                        this.logger.error(Messages.TEACHER_NOT_FOUND + ": " + row.teacher_email);
                        return;
                    }
                    let courseClass = this.courseClassService.create();
                    if (courseClass) {
                        courseClass.group = row.group;
                        courseClass.classSchedule = JSON.parse(row.class_schedule);
                        courseClass.maxStudent = Number(row.max_student);
                        courseClass.semester = row.semester;
                        courseClass.courseId = Number(courseId.id);
                        courseClass.teacherId = Number(teacherId.id);
                        courseClass.currentStudent = Number(row.current_student);

                        this.courseClassService
                            .save(courseClass)
                            ?.then(() => {
                                this.logger.info(Messages.IMPORT_COURSE_SUCCESS + ": " + row.course_code);
                            })
                            .catch((error: any) => {
                                this.logger.error(Messages.IMPORT_COURSE_FAILED + ": " + row.course_code + " - " + error.message);
                            });
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

    // Trả về thông tin course được chọn
    @httpGet("/course/info/:id", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN, Permission.ONLY_TEACHER]))
    public async getCourseInfo(request: Request, response: Response): Promise<void> {
        let courseId = Number(request.params.id);
        try {
            let course = await this.courseService.findById(courseId, ["department"]);
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
    public async editCourse(request: Request, response: Response) {
        let courseId = Number(request.params.id);
        let name: string = request.body.courseName;
        let code: string = request.body.courseCode;
        let credit: number = request.body.credit;
        let url: string = request.body.url;
        let oldCourse = await this.courseService.findById(courseId, ["department"]);
        try {
            if (!name) this.errors = { ...this.errors, courseName: Messages.COURSE_NAME_REQUIRED };
            if (!code) this.errors = { ...this.errors, courseCode: Messages.COURSE_CODE_REQUIRED };
            if (!credit) this.errors = { ...this.errors, credit: Messages.COURSE_CREDITS_REQUIRED };

            if (this.errors) {
                return response.status(HttpCode.SUCCESSFUL).send({ errors: this.errors });
            }

            delete request.body.id;

            let newCourse = {
                id: courseId,
                ...request.body,
            };
            if (newCourse) {
                this.courseService.save(newCourse);
            }

            return response.status(HttpCode.SUCCESSFUL).cookie("messages", { message: Messages.UPDATE_COURSE_SUCCESS, course: newCourse }).send({ url: url });
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    @httpPost("/course/:id/delete", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN]))
    public async deleteCourse(request: Request, response: Response) {
        let courseId = Number(request.params.id);
        let url = request.body.href || "";
        try {
            let course = await this.courseService.findById(courseId);
            if (course) {
                await this.courseService.delete(courseId);
                return response
                    .status(HttpCode.SUCCESSFUL)
                    .cookie("messages", { message: Messages.DELETE_COURSE_SUCCESS, user: course.courseName })
                    .redirect(RouteHelper.CLASSROOM + RouteHelper.COURSES + url);
            } else {
                return response.status(HttpCode.NOT_FOUND).send({ message: Messages.COURSE_NOT_FOUND, status: HttpCode.NOT_FOUND });
            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    @httpPost("/course/create", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN]))
    public async createCourse(request: Request, response: Response) {
        let name: string = request.body.courseName;
        let code: string = request.body.courseCode;
        let credit: number = request.body.credit;
        let url: string = request.body.url;
        try {
            if (!name) this.errors = { ...this.errors, courseName: Messages.COURSE_NAME_REQUIRED };
            if (!code) this.errors = { ...this.errors, courseCode: Messages.COURSE_CODE_REQUIRED };
            if (!credit) this.errors = { ...this.errors, credit: Messages.COURSE_CREDITS_REQUIRED };

            if (this.errors) {
                return response.status(HttpCode.SUCCESSFUL).send({ errors: this.errors });
            }
            // check if course already exists
            let courseExist = await this.courseService.getCourseByCode(code);
            if (courseExist) {
                this.errors = { ...this.errors, courseCode: Messages.COURSE_EXISTED };
                return response.status(HttpCode.SUCCESSFUL).send({ errors: this.errors });
            }
            let course = {
                ...request.body,
            };

            if (course) {
                this.courseService.save(course);
            }
            return response.status(HttpCode.SUCCESSFUL).cookie("messages", { message: Messages.CREATE_COURSE_SUCCESS, course: course }).send({ url: url });
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
        let page: any = request.query.page || 1;
        let sortBy: any = request.query.sortBy;
        let sort: any = request.query.sort || "ASC";
        try {
            // người đăng nhập hiện tại
            let userId = request.session.userId;
            if (userId === Permission.ONLY_TEACHER) {
                teacher = userId;
            }
            let classes = await this.courseClassService.showCourseClassList(teacher, course, group, semester, name, page, this.limitedItem, sortBy, sort);
            let courseList = await this.courseService.findAll();
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
                    sunday: "Chủ nhật",
                };
                function sortClassSchedule(schedule: Record<string, string[]>): { day: string; label: string; times: string[] }[] {
                    return Object.entries(schedule)
                        .sort(([a], [b]) => dayOrder.indexOf(a) - dayOrder.indexOf(b))
                        .map(([day, times]) => ({
                            day,
                            label: dayMap[day],
                            times,
                        }));
                }
                classes.list.forEach((item: any) => {
                    item.schedule = sortClassSchedule(item.classSchedule);
                });
                response.render(this.routeHelper.getRenderPage(RouteHelper.CLASSES), {
                    courseClasses: classes.list,
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

    @httpGet("/class-detail/:id", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN, Permission.ONLY_TEACHER]))
    public async getClassInfo(request: Request, response: Response): Promise<void> {
        let classId = Number(request.params.id);
        try {
            let courseClass = await this.courseClassService.findById(classId, ["course", "teacher"]);
            let departmentList = await this.departmentService.findAll();
            // let studentList = await this.userService.findAll(["student"], { roleId: 4 }, { lastName: "ASC", firstName: "ASC" });
            let currentStudentList = await this.classStudentService.findByCourseClassId(classId);

            let currentStudentIdList: any = [];
            if (currentStudentList) {
                currentStudentList.forEach((student: any) => {
                    currentStudentIdList.push(student.studentId);
                });
            }
            let currentSeletStudentList: any = [];
            if (currentStudentIdList.length > 0) {
                currentSeletStudentList = await this.userService.find(
                    ["student"],
                    {
                        roleId: 4,
                        id: Not(In(currentStudentIdList))
                    },
                    { lastName: "ASC", firstName: "ASC" },
                );
            }
            let studentList = await this.userService.find(
                ["student"],
                { roleId: 4 },
                { lastName: "ASC", firstName: "ASC" },
                this.limitedItem,
            );
            response.render(this.routeHelper.getRenderPage(RouteHelper.CLASS_DETAIL), {
                courseClass: courseClass,
                classId: classId,
                departmentList: departmentList,
                studentList: studentList,
                currentSeletStudentList: currentSeletStudentList,
            });
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    @httpGet("/class/info/:id", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN, Permission.ONLY_TEACHER]))
    public async getClassInfoById(request: Request, response: Response): Promise<void> {
        let classId = request.params.id;
        let searchField = request.query.searchField || "";
        let page: any = request.query.page || 1;
        let sortBy: any = request.query.sortBy;
        let sort: any = request.query.sort || "ASC";
        try {

            let classStudent = await this.classStudentService.findStudentsByCourseClassId(searchField, classId, page, this.limitedItem, sortBy, sort);
            if (classStudent?.list.length == 0 && page > 1) {
                classStudent = await this.classStudentService.findStudentsByCourseClassId(searchField, classId, 1, this.limitedItem, sortBy, sort);
            }
            if (classStudent) {
                response.status(HttpCode.SUCCESSFUL).json({
                    classStudent: classStudent,
                    limit: this.limitedItem,
                    total: classStudent.total,
                    page: classStudent.pageSize,
                    pageSize: classStudent.pageSize,
                    lastPage: Math.ceil(classStudent.total / this.limitedItem),
                    sort,
                    searchField,
                });
            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    @httpPost("/class/:classId/student/delete", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN, Permission.ONLY_TEACHER]))
    public async deleteStudentFromClass(request: Request, response: Response) {
        let classId = Number(request.params.classId);
        let studentIdArray = request.body.ids;

        try {
            let courseClass = await this.courseClassService.findById(classId);
            if (courseClass) {
                if (studentIdArray.length > 0 && studentIdArray[0] === "all") {
                    let classStudent = await this.classStudentService.findByCourseClassId(classId);
                    if (classStudent) {
                        classStudent.forEach(async (student: any) => {
                            await this.classStudentService.delete(student.id);
                        });
                    }
                }
                studentIdArray.forEach(async (studentId: any) => {
                    let classStudent = await this.classStudentService.findByCourseClassId(classId, studentId);
                    if (classStudent) {
                        classStudent.forEach(async (student: any) => {
                            await this.classStudentService.delete(student.id);
                        });
                    }
                });
                return response
                    .status(HttpCode.SUCCESSFUL)
                    .cookie("messages", { message: Messages.DELETE_STUDENT_SUCCESS, user: studentIdArray.length })
                    .json({ status: HttpCode.SUCCESSFUL, user: studentIdArray.length });
            }

        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    @httpGet("/class/student/search", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN, Permission.ONLY_TEACHER]))
    public async searchStudent(request: any, response: any): Promise<void> {
        let search = request.query.keyword || "";
        let departmentId = request.query.departmentId || "ALL";
        let classId = request.query.classId || "ALL";
        try {
            let currentStudentList = await this.classStudentService.findByCourseClassId(classId);
            let currentStudentIdList: any = [];
            if (currentStudentList) {
                currentStudentList.forEach((student: any) => {
                    currentStudentIdList.push(student.studentId);
                });
            }
            if (departmentId === Variables.ALL) {
                departmentId = undefined;
            }
            let studentList = await this.userService.findStudentBySelect2(search, departmentId, currentStudentIdList);
            if (studentList) {
                response.status(HttpCode.SUCCESSFUL).json({
                    studentList: studentList,
                });
            } else {
                response.status(HttpCode.NOT_FOUND).json({ message: Messages.STUDENT_NOT_FOUND, status: HttpCode.NOT_FOUND });
            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    @httpGet("/class/student/department", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN, Permission.ONLY_TEACHER]))
    public async getDepartment(request: any, response: any): Promise<void> {
        let departmentId = request.query.departmentId || "ALL";
        try {
            if (departmentId === Variables.ALL) {
                let studentList = await this.userService.find(["student"], { roleId: 4 }, { lastName: "ASC", firstName: "ASC" });
                if (studentList) {
                    response.status(HttpCode.SUCCESSFUL).json({
                        studentList: studentList,
                    });
                }
            } else {
                let studentList = await this.userService.find(["student"], { roleId: 4, departmentId: departmentId }, { lastName: "ASC", firstName: "ASC" });
                if (studentList) {
                    response.status(HttpCode.SUCCESSFUL).json({
                        studentList: studentList,
                    });
                }
            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    @httpPost("/class/:classId/student/add", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN, Permission.ONLY_TEACHER]))
    public async addStudentToClass(request: any, response: any): Promise<void> {
        let classId = Number(request.params.classId);
        let studentIdArray = request.body.studentId || [];
        try {
            let classStudents: ClassStudent[] = [];
            if (studentIdArray.length === 0) {
                return response.status(HttpCode.BAD_REQUEST).send({ message: Messages.STUDENT_NOT_FOUND, status: HttpCode.BAD_REQUEST });
            }
            if (studentIdArray.length > 0 && studentIdArray[0] === "all") {
                studentIdArray.forEach(async (studentId: any) => {
                    if (studentId !== "all") {
                        let classStudent = new ClassStudent();
                        classStudent.courseClassId = classId;
                        classStudent.studentId = studentId;
                        classStudents.push(classStudent);
                    }
                });
                this.classStudentService.saveMulti(classStudents);
                return response
                    .status(HttpCode.SUCCESSFUL)
                    .cookie("messages", { message: Messages.ADD_STUDENT_SUCCESS, user: studentIdArray.length })
                    .json({ status: HttpCode.SUCCESSFUL, user: studentIdArray.length });
            }
            if (studentIdArray.length > 0) {
                studentIdArray.forEach(async (studentId: any) => {
                    let classStudent = new ClassStudent();
                    classStudent.courseClassId = classId;
                    classStudent.studentId = studentId;
                    classStudents.push(classStudent);
                });
                this.classStudentService.saveMulti(classStudents);
                return response
                    .status(HttpCode.SUCCESSFUL)
                    .cookie("messages", { message: Messages.ADD_STUDENT_SUCCESS, user: studentIdArray.length })
                    .json({ status: HttpCode.SUCCESSFUL, user: studentIdArray.length });
            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    @httpPost("/class/:id/delete", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN]))
    public async deleteClass(request: any, response: any): Promise<void> {
        let classId = Number(request.params.id);
        let url = request.body.href || "";
        try {
            let courseClass = await this.courseClassService.findById(classId);
            if (courseClass) {
                await this.courseClassService.delete(classId);
                return response
                    .status(HttpCode.SUCCESSFUL)
                    .cookie("messages", { message: Messages.DELETE_CLASS_SUCCESS, user: courseClass.id })
                    .redirect(RouteHelper.CLASSROOM + RouteHelper.CLASSES + url);
            } else {
                return response.status(HttpCode.NOT_FOUND).send({ message: Messages.CLASS_NOT_FOUND, status: HttpCode.NOT_FOUND });
            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }

    @httpGet("/teacher/:id/classes", verifyAuthTokenRouter, checkPermissions([Permission.ONLY_ADMIN, Permission.ONLY_TEACHER]))
    public async getTeacherClasses(request: Request, response: Response): Promise<void> {
        let teacherId = Number(request.params.id);
        try {
            let courseClasses = await this.courseClassService.findAllClassesByTeacherId(teacherId);
            if (courseClasses) {
                response.status(HttpCode.SUCCESSFUL).json(courseClasses);
            } else {
                response.status(HttpCode.NOT_FOUND).send({ message: Messages.CLASS_NOT_FOUND, status: HttpCode.NOT_FOUND });
            }
        } catch (error: any) {
            this.logger.error(error);
            response.status(HttpCode.BAD_REQUEST).send({ message: error.message, status: HttpCode.BAD_REQUEST });
        }
    }
}
