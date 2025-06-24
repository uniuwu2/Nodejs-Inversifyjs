import { controller } from "inversify-express-utils";
import { BaseController } from "./base-controller";
import { Request, Response } from "express";
import { inject } from "inversify";
import { CourseClassService, CourseService, DateTimeHelper, Permission, RouteHelper, SessionClassService, SortHelper, TYPES, UserService, Variables } from "@inversifyjs/application";
import { httpGet } from "inversify-express-utils";
import { verifyAuthTokenRouter } from "@inversifyjs/infrastructure";
import { CourseClass, SessionClass, User } from "@inversifyjs/domain";
import { Between } from "typeorm";

@controller(RouteHelper.STATISTIC)
export class StatisticController extends BaseController {
    private sessionClassService!: SessionClassService;
    private courseClassService!: CourseClassService;
    private courseService!: CourseService;
    private userService!: UserService;

    constructor(
        @inject(TYPES.SessionClassService) sessionClassService: SessionClassService,
        @inject(TYPES.CourseClassService) courseClassService: CourseClassService,
        @inject(TYPES.CourseService) courseService: CourseService,
        @inject(TYPES.UserService) userService: UserService
    ) {
        super();
        this.sessionClassService = sessionClassService;
        this.courseClassService = courseClassService;
        this.courseService = courseService;
        this.userService = userService;
    }

    @httpGet("/class/days", verifyAuthTokenRouter)
    public async getStatisticDays(request: Request, response: Response): Promise<void> {
        try {
            let startDate: any = request.query.startDate || DateTimeHelper.getPrevDay();
            let endDate: any = request.query.endDate || DateTimeHelper.getPrevDay();
            let page: any = request.query.page || 1;
            let sortBy: any = request.query.sortBy || "date";
            let sort: any = request.query.sort || "ASC";
            let userId = response.locals.jwtPayload.user;
            let teacher: any = null;
            if (userId.roleId === Permission.ONLY_TEACHER) {
                teacher = userId.id;
            }
            let statistic: SessionClass[] | undefined = [];
            if (teacher) {
                // Nếu là giáo viên, chỉ lấy các buổi học của lớp mà giáo viên đó dạy
                statistic = await this.sessionClassService.find(
                    ["attendance", "courseClass"],
                    startDate && endDate ? {
                        sessionDate: Between(new Date(DateTimeHelper.formatFirstTime(startDate)), new Date(DateTimeHelper.formatLastTime(endDate))),
                        courseClass: {
                            teacher: {
                                id: teacher
                            }
                        }
                    } : {
                        courseClass: {
                            teacher: {
                                id: teacher
                            }
                        }
                    }
                );
            } else {
                statistic = await this.sessionClassService.find(
                    ["attendance", "courseClass"],
                    startDate && endDate ? {
                        sessionDate: Between(new Date(DateTimeHelper.formatFirstTime(startDate)), new Date(DateTimeHelper.formatLastTime(endDate)))
                    } : {}
                );
            }
            if (statistic) {
                // Gom nhóm theo ngày
                const groupedByDate: { [date: string]: SessionClass[] } = {};

                statistic.forEach((session: any) => {
                    const dateKey = session.sessionDate;
                    if (!groupedByDate[dateKey]) {
                        groupedByDate[dateKey] = [];
                    }
                    groupedByDate[dateKey].push(session);
                });

                let dailyStatistics: any[] = [];

                for (const [date, sessions] of Object.entries(groupedByDate) as [string, any[]][]) {
                    let totalSessions = sessions.length;
                    let totalStudents = 0;
                    let attended = 0;
                    let absent = 0;
                    let attendanceRate: number = 0;

                    sessions.forEach((session) => {
                        totalStudents += session.courseClass.currentStudent;
                        session.attendance.forEach((attendanceRecord: any) => {
                            attendanceRecord.studentAttendance.forEach((attendance: any) => {
                                if (attendance.status === "1" || attendance.status === "2") {
                                    attended++;
                                } else if (attendance.status === "0" || attendance.status === null) {
                                    absent++;
                                }
                            });
                        });
                    });
                    // Tính tỷ lệ không điểm danh
                    attendanceRate = Number(((attended / totalStudents) * 100).toFixed(2));

                    dailyStatistics.push({
                        date,
                        totalSessions,
                        totalStudents,
                        attended,
                        absent,
                        attendanceRate
                    });
                }
                // Sort 
                SortHelper.sortDailyStatistics(dailyStatistics, sortBy, sort);
                // Pagination
                const limit = this.limitedItem;
                const totalPages = Math.ceil(dailyStatistics.length / limit);
                page = Math.max(1, Math.min(page, totalPages)); // Ensure page is within bounds
                const startIndex = (page - 1) * limit;
                const total = dailyStatistics.length;
                dailyStatistics = dailyStatistics.slice(startIndex, startIndex + limit);
                response.status(200).render(this.routeHelper.getRenderPage(RouteHelper.STATISTIC_DAYS), {
                    statistics: dailyStatistics,
                    startDate: startDate,
                    endDate: endDate,
                    sortBy: sortBy,
                    sort: sort,
                    page: page,
                    total: total,
                    limit: limit,
                    lastPage: totalPages,
                });
            }
        } catch (error) {
            this.logger.error(error);
            response.status(500).render(this.routeHelper.getRenderPage(RouteHelper.INTERNAL_SERVER_ERROR));
        }
    }

    @httpGet("/class", verifyAuthTokenRouter)
    public async getStatisticClass(request: Request, response: Response): Promise<void> {

        try {
            let userId = response.locals.jwtPayload.user;
            let teacher: any = null;
            if (userId.roleId === Permission.ONLY_TEACHER) {
                teacher = userId.id;
            }
            let courses = await this.courseService.findAll();
            let courseClasses: CourseClass[] | undefined = [];
            if (teacher) {
                // Nếu là giáo viên, chỉ lấy các lớp học mà giáo viên đó dạy
                courseClasses = await this.courseClassService.find(["course", "teacher"], {
                    teacher: {
                        id: teacher
                    }
                });
                courses = courses?.filter((course: any) => {
                    return courseClasses?.some((courseClass: any) => courseClass.course.id === course.id);
                });
            } else {
                courseClasses = await this.courseClassService.findAll(["course", "teacher"]);
            }
            let semesters: string[] = [];
            let groups: string[] = [];

            courseClasses?.forEach((courseClass: any) => {
                if (courseClass.semester && !semesters.includes(courseClass.semester)) {
                    semesters.push(courseClass.semester);
                }
                if (courseClass.group && !groups.includes(courseClass.group)) {
                    groups.push(courseClass.group);
                }
            });

            // Sort semesters and groups
            semesters.sort((a, b) => a.localeCompare(b));
            groups.sort((a, b) => a.localeCompare(b));


            response.status(200).render(this.routeHelper.getRenderPage(RouteHelper.STATISTIC_CLASS), {
                courses: courses,
                courseClasses: courseClasses,
                semesters: semesters,
                groups: groups,
            });
        } catch (error) {
            this.logger.error(error);
            response.status(500).render(this.routeHelper.getRenderPage(RouteHelper.INTERNAL_SERVER_ERROR));
        }
    }

    @httpGet("/class/table", verifyAuthTokenRouter)
    public async getStatisticClassTable(request: any, response: any): Promise<void> {
        let courseId: any = request.query.courseId || null;
        let semesterSelect: any = request.query.semester || null;
        let groupSelect: any = request.query.group || null;
        let sortBy: any = request.query.sortBy || null;
        let sort: any = request.query.sort || "ASC";
        let page: any = request.query.page || 1;
        let userId = response.locals.jwtPayload.user;
        let teacher: any = null;
        if (userId.roleId === Permission.ONLY_TEACHER) {
            teacher = userId.id;
        }
        try {

            let getCourseClassWithStudents;

            let students = await this.userService.find(["student"], {
                roleId: Variables.STUDENT_ROLE_ID,
            });


            if (courseId && semesterSelect && groupSelect) {
                // Lọc theo khóa học, học kỳ và nhóm
                if (teacher) {
                    // Nếu là giáo viên, chỉ lấy các lớp học mà giáo viên đó dạy
                    getCourseClassWithStudents = await this.courseClassService.findOne(
                        ["course", "teacher", "classStudent", "classStudent.student", "sessionClass", "sessionClass.attendance", "classStudent.student.student"],
                        {
                            course: { id: courseId },
                            semester: semesterSelect,
                            group: groupSelect,
                            teacher: { id: teacher }
                        });
                } else {
                    getCourseClassWithStudents = await this.courseClassService.findOne(
                        ["course", "teacher", "classStudent", "classStudent.student", "sessionClass", "sessionClass.attendance", "classStudent.student.student"],
                        {
                            course: { id: courseId },
                            semester: semesterSelect,
                            group: groupSelect
                        });
                }


            }
            if (!getCourseClassWithStudents) {
                return response.json({
                    code: 404,
                    message: "Không tìm thấy lớp học nào với tiêu chí lọc đã chọn."
                });
            }
            let studentList: any[] = [];
            let totalSessions = getCourseClassWithStudents.sessionClass.length;
            let totalStudents = getCourseClassWithStudents.currentStudent;
            let totalAttendance = 0;
            let totalAbsent = 0;
            getCourseClassWithStudents.sessionClass.forEach((session: any) => {
                session.attendance.forEach((attendance: any) => {
                    attendance.studentAttendance.forEach((attendanceRecord: any) => {
                        if (attendanceRecord.status === "1" || attendanceRecord.status === "2" || attendanceRecord.status === 1 || attendanceRecord.status === 2) {
                            totalAttendance++;
                        } else if (attendanceRecord.status === "0" || attendanceRecord.status === null || attendanceRecord.status === 0) {
                            totalAbsent++;
                        }
                    });
                });
            });
            // Tính tỷ lệ điểm danh tổng
            let totalAttendanceRate = 0;
            // Tỉ lệ điểm danh = (Tổng số điểm danh / (Tổng số buổi học * Tổng số sinh viên)) * 100
            if (totalSessions * totalStudents > 0) {
                totalAttendanceRate = Number(((totalAttendance / (totalSessions * totalStudents)) * 100).toFixed(2));
            }

            // Sắp xếp danh sách session theo ngày
            getCourseClassWithStudents.sessionClass.sort((a: any, b: any) => {
                return new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime();
            });

            let StudentAttendanceForSession: any[] = [];
            // Lấy danh sách điểm danh của tất cả sinh viên theo từng buổi học
            getCourseClassWithStudents.sessionClass.forEach((session: any) => {
                let sessionAttendance = 0;
                let sessionAbsent = 0;
                let sessionAttendanceRate = 0;

                session.attendance.forEach((attendance: any) => {
                    attendance.studentAttendance.forEach((attendanceRecord: any) => {
                        if (attendanceRecord.status === "1" || attendanceRecord.status === "2" || attendanceRecord.status === 1 || attendanceRecord.status === 2) {
                            sessionAttendance++;
                        } else if (attendanceRecord.status === "0" || attendanceRecord.status === null || attendanceRecord.status === 0) {
                            sessionAbsent++;
                        }
                    });
                });

                // Tính tỷ lệ điểm danh cho buổi học
                if (sessionAttendance + sessionAbsent > 0) {
                    sessionAttendanceRate = Number(((sessionAttendance / (sessionAttendance + sessionAbsent)) * 100).toFixed(2));
                } else {
                    sessionAttendanceRate = 0;
                }

                StudentAttendanceForSession.push({
                    sessionId: session.id,
                    sessionDate: session.sessionDate,
                    totalAttendance: sessionAttendance,
                    totalAbsent: sessionAbsent,
                    attendanceRate: sessionAttendanceRate
                });
            });
            // Lấy danh sách sinh viên từ buổi học
            getCourseClassWithStudents.sessionClass.forEach((session: any) => {
                session.attendance.forEach((attendance: any) => {
                    attendance.studentAttendance.forEach(async (attendanceRecord: any) => {
                        // Kiểm tra nếu sinh viên đã có trong danh sách
                        const existingStudent = studentList.find((s: any) => s.id === attendanceRecord.student_id);
                        if (existingStudent) {
                            // Cập nhật thông tin điểm danh của sinh viên
                            if (attendanceRecord.status === "1" || attendanceRecord.status === "2" || attendanceRecord.status === 1 || attendanceRecord.status === 2) {
                                existingStudent.attendance++;
                            } else if (attendanceRecord.status === "0" || attendanceRecord.status === null || attendanceRecord.status === 0) {
                                existingStudent.absent++;
                            }
                        } else {
                            // Thêm sinh viên mới vào danh sách
                            let student = getCourseClassWithStudents.classStudent.find((s: any) => s.student.id === attendanceRecord.student_id);

                            if (student) {
                                studentList.push({
                                    id: student.student.id,
                                    name: `${student.student.firstName} ${student.student.lastName}`,
                                    firstName: student.student.firstName,
                                    lastName: student.student.lastName,
                                    studentNumber: student.student.student.student_number,
                                    studentClass: student.student.student.student_class,
                                    email: student.student.email,
                                    attendance: (attendanceRecord.status === "1" || attendanceRecord.status === "2" || attendanceRecord.status === 1 || attendanceRecord.status === 2) ? 1 : 0,
                                    absent: (attendanceRecord.status === "0" || attendanceRecord.status === null || attendanceRecord.status === 0) ? 1 : 0,
                                    attendanceRate: 0, // Sẽ tính sau
                                });
                            }
                            // Kiểm tra sinh viên này chỉ tồn tại trong buổi học này chứ không tồn tại trong lớp học 
                            if (!student) {
                                // Sinh viên này chỉ có trong buổi học này, không có trong lớp học
                                student = students?.find((s: any) => s.id === attendanceRecord.student_id);
                                if (student) {
                                    studentList.push({
                                        id: student.id,
                                        name: `${student.firstName} ${student.lastName}`,
                                        firstName: student.firstName,
                                        lastName: student.lastName,
                                        studentNumber: student.student?.student_number || "",
                                        studentClass: student.student?.student_class || "",
                                        email: student.email,
                                        attendance: (attendanceRecord.status === "1" || attendanceRecord.status === "2" || attendanceRecord.status === 1 || attendanceRecord.status === 2) ? 1 : 0,
                                        absent: (attendanceRecord.status === "0" || attendanceRecord.status === null || attendanceRecord.status === 0) ? 1 : 0,
                                        attendanceRate: 0, // Sẽ tính sau
                                    });
                                }

                            }
                        }
                    });
                });
                // Tính tỷ lệ điểm danh cho từng sinh viên
                studentList.forEach((student: any) => {
                    if (student.attendance + student.absent > 0) {
                        student.attendanceRate = Number(((student.attendance / (student.attendance + student.absent)) * 100).toFixed(2));
                    } else {
                        student.attendanceRate = 0;
                    }
                });
            });
            // Sort student list by sortBy and sort
            if (sortBy && sort) {
                SortHelper.sortStudentList(studentList, sortBy, sort);
            }
            // Pagination
            const limit = this.limitedItem;
            const totalPages = Math.ceil(studentList.length / limit);
            const total = studentList.length;
            page = Math.max(1, Math.min(page, totalPages)); // Ensure page is within bounds
            const startIndex = (page - 1) * limit;
            studentList = studentList.slice(startIndex, startIndex + limit);

            response.status(200).json({
                code: 200,
                message: "Lấy danh sách lớp học thành công.",
                data: {
                    courseClass: getCourseClassWithStudents,
                    totalSessions: totalSessions,
                    totalStudents: totalStudents,
                    totalAttendance: totalAttendance,
                    totalAbsent: totalAbsent,
                    totalAttendanceRate: totalAttendanceRate,
                    studentList: studentList,
                    dataForChart: StudentAttendanceForSession,
                    page: page,
                    limit: this.limitedItem,
                    lastPage: totalPages,
                    sortBy: sortBy,
                    sort: sort,
                    total: total,
                }
            });

        } catch (error) {
            this.logger.error(error);
            response.status(500).render(this.routeHelper.getRenderPage(RouteHelper.INTERNAL_SERVER_ERROR));
            return;
        }

    }

    @httpGet("/class/student", verifyAuthTokenRouter)
    public async getStatisticStudent(request: Request, response: Response): Promise<void> {
        try {
            let userId = response.locals.jwtPayload.user;
            let teacher: any = null;
            if (userId.roleId === Permission.ONLY_TEACHER) {
                teacher = userId.id;
            }
            let students: User[] | undefined = [];
            if (teacher) {
                // Nếu là giáo viên, chỉ lấy các sinh viên của lớp mà giáo viên đó dạy
                students = await this.userService.find(["student"], {
                    roleId: Variables.STUDENT_ROLE_ID,
                    classStudent: {
                        courseClass: {
                            teacher: {
                                id: teacher
                            }
                        }
                    }
                });
            } else {
                students = await this.userService.find(["student"], {
                roleId: Variables.STUDENT_ROLE_ID
            });
            }
            
            response.status(200).render(this.routeHelper.getRenderPage(RouteHelper.STATISTIC_STUDENT), {
                students: students,
            });
        } catch (error) {
            this.logger.error(error);
            response.status(500).render(this.routeHelper.getRenderPage(RouteHelper.INTERNAL_SERVER_ERROR));
        }
    }
    @httpGet("/class/student/table", verifyAuthTokenRouter)
    public async getStatisticStudentTable(request: any, response: any): Promise<void> {
        let studentId: any = request.query.studentId || null;
        let sortBy: any = request.query.sortBy || null;
        let sort: any = request.query.sort || "ASC";
        let page: any = request.query.page || 1;

        try {
            let getCoursesClassByStudent: any;
            if (studentId) {
                // Lọc theo sinh viên
                getCoursesClassByStudent = await this.courseClassService.find(
                    ["course", "teacher", "classStudent", "classStudent.student", "sessionClass", "sessionClass.attendance"],
                    {
                        classStudent: {
                            student: {
                                id: studentId
                            }
                        }
                    });
            }
            // Nếu không tìm thấy lớp học nào
            if (!getCoursesClassByStudent || getCoursesClassByStudent.length === 0) {
                return response.json({
                    code: 404,
                    message: "Không tìm thấy lớp học nào với tiêu chí lọc đã chọn."
                });
            }
            // Lấy danh sách các môn học của sinh viên
            let courseList: any[] = [];
            let totalSessions = 0;
            let totalAttendance = 0;
            let totalAbsent = 0;
            getCoursesClassByStudent.forEach((courseClass: any) => {
                totalSessions += courseClass.sessionClass.length;
                let courseAttendance = 0;
                let courseAbsent = 0;

                courseClass.sessionClass.forEach((session: any) => {
                    session.attendance.forEach((attendance: any) => {
                        attendance.studentAttendance.forEach((attendanceRecord: any) => {
                            if (attendanceRecord.status === "1" || attendanceRecord.status === "2" || attendanceRecord.status === 1 || attendanceRecord.status === 2) {
                                courseAttendance++;
                            } else if (attendanceRecord.status === "0" || attendanceRecord.status === null || attendanceRecord.status === 0) {
                                courseAbsent++;
                            }
                        });
                    });
                });

                totalAttendance += courseAttendance;
                totalAbsent += courseAbsent;

                // Tính tỷ lệ điểm danh cho môn học
                let attendanceRate = 0;
                if (courseAttendance + courseAbsent > 0) {
                    attendanceRate = Number(((courseAttendance / (courseAttendance + courseAbsent)) * 100).toFixed(2));
                }

                courseList.push({
                    id: courseClass.id,
                    name: `${courseClass.course.courseName}`,
                    semester: courseClass.semester,
                    code: courseClass.course.courseCode,
                    group: courseClass.group,
                    teacher: `${courseClass.teacher.firstName} ${courseClass.teacher.lastName}`,
                    totalSessions: courseClass.sessionClass.length,
                    totalAttendance: courseAttendance,
                    totalAbsent: courseAbsent,
                    attendanceRate: attendanceRate,
                });
            });
            // Sort course list by sortBy and sort
            if (sortBy && sort) {
                SortHelper.sortCourseList(courseList, sortBy, sort);
            }
            // Dữ liệu cho biểu đồ
            const dataForChart: any[] = courseList;

            // Pagination
            const limit = this.limitedItem;
            const totalPages = Math.ceil(courseList.length / limit);
            const total = courseList.length;
            page = Math.max(1, Math.min(page, totalPages)); // Ensure page is within bounds
            const startIndex = (page - 1) * limit;
            courseList = courseList.slice(startIndex, startIndex + limit);
            response.status(200).json({
                code: 200,
                message: "Lấy danh sách lớp học của sinh viên thành công.",
                data: {
                    courseList: courseList,
                    totalSessions: totalSessions,
                    totalAttendance: totalAttendance,
                    totalAbsent: totalAbsent,
                    page: page,
                    limit: this.limitedItem,
                    lastPage: totalPages,
                    sortBy: sortBy,
                    sort: sort,
                    total: total,
                    dataForChart: dataForChart
                }
            });

        } catch (error) {
            this.logger.error(error);
            response.status(500).render(this.routeHelper.getRenderPage(RouteHelper.INTERNAL_SERVER_ERROR));
            return;
        }

    }
}   