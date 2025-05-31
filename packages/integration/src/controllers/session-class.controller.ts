import { controller, httpGet, httpPost } from "inversify-express-utils";
import { BaseController } from "./base-controller";
import { ClassStudentService, CourseClassService, CourseService, DepartmentService, HttpCode, Messages, Permission, RouteHelper, SessionClassService, TYPES, UserService, Variables } from "@inversifyjs/application";
import { Request, Response } from "express";
import { verify } from "crypto";
import { verifyAuthTokenRouter } from "@inversifyjs/infrastructure";
import { inject } from "inversify";
import { SessionClass, User } from "@inversifyjs/domain";
import * as QRCode from "qrcode";
import * as jwt from "jsonwebtoken";
import { In } from "typeorm";
const JWT_SECRET = process.env.TOKEN_KEY || "mydevsecretkey123456";

@controller(RouteHelper.SESSION_CLASS)
export class SessionClassController extends BaseController {
    private courseClassService!: CourseClassService;
    private sessionClassService!: SessionClassService;
    private userService!: UserService;
    private classStudentService!: ClassStudentService;

    constructor(
        @inject(TYPES.CourseClassService) courseClassService: CourseClassService,
        @inject(TYPES.SessionClassService) sessionClassService: SessionClassService,
        @inject(TYPES.UserService) userService: UserService,
        @inject(TYPES.ClassStudentService) classStudentService: ClassStudentService

    ) {
        super();
        this.courseClassService = courseClassService;
        this.sessionClassService = sessionClassService;
        this.userService = userService;
        this.classStudentService = classStudentService;

    }

    @httpGet("/", verifyAuthTokenRouter)
    public async getSessionClass(request: Request, response: Response): Promise<void> {
        try {
            let courseClassList = await this.courseClassService.findAll(["course", "teacher"]
                // , {
                //     courseId: 1,
                //     teacherId: 13,
                // }
            );
            const dayOrder = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
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
            if (courseClassList && courseClassList.length > 0) {
                courseClassList.forEach((item: any) => {
                    item.schedule = sortClassSchedule(item.classSchedule);
                });
            }
            let sessionClasses: any = [];
            courseClassList?.forEach((item: any) => {
                if (item.schedule.length === 0) return;

                const schedules = item.schedule;
                const sessionNeeded = item.sessionNumber;
                const createdSessions: SessionClass[] = [];

                const startDate = new Date(item.startDate); // ngày bắt đầu môn học

                let totalCreated = 0;
                let weekOffset = 0;

                while (totalCreated < sessionNeeded) {
                    // Với mỗi tuần
                    for (let i = 0; i < schedules.length; i++) {
                        if (totalCreated >= sessionNeeded) break;

                        const schedule = schedules[i];
                        const [startTime, endTime] = schedule.times[0].split("-");
                        const dayIndex = dayOrder.indexOf(schedule.day); // ví dụ: "Thứ 2" → 1

                        if (dayIndex === -1) continue;

                        // Tính ra ngày thực tế của buổi học
                        const sessionDate = new Date(startDate);
                        const baseDay = sessionDate.getDay(); // chủ nhật = 0, thứ 2 = 1,...
                        const offsetToDay = (dayIndex + 7 - baseDay) % 7 + weekOffset * 7;
                        sessionDate.setDate(sessionDate.getDate() + offsetToDay);

                        const sessionClass = new SessionClass();
                        sessionClass.courseClassId = item.id;
                        sessionClass.sessionDate = sessionDate;
                        sessionClass.sessionStartTime = startTime;
                        sessionClass.sessionEndTime = endTime;
                        sessionClass.teacherId = item.teacher.id;
                        sessionClass.room = "";
                        sessionClass.status = 1;
                        sessionClass.reason = "";

                        createdSessions.push(sessionClass);
                        totalCreated++;
                    }

                    weekOffset++;
                }

                createdSessions.forEach(sc => {
                    sessionClasses.push(sc);
                });
            });
            // Kiểm tra xem trong danh sách sessionClasses đã có buổi nào đã tồn tại trong DB chưa
            const existingSessions = await this.sessionClassService.findAll(["courseClass", "teacher", "courseClass.course"]);
            // Kiểm tra courseClassId, teacherId, sessionDate, sessionStartTime, sessionEndTime
            const newSessionClasses = sessionClasses.filter((sessionClass: SessionClass) => {
                return !existingSessions?.some((existingSession: SessionClass) => {
                    return (
                        existingSession.courseClassId === sessionClass.courseClassId &&
                        existingSession.teacherId === sessionClass.teacherId &&
                        existingSession.sessionStartTime === sessionClass.sessionStartTime &&
                        sessionClass.sessionDate.toISOString().split("T")[0] == (existingSession.sessionDate + "") &&
                        existingSession.sessionEndTime === sessionClass.sessionEndTime
                    );
                });
            });
            // Lưu danh sách sessionClasses mới vào DB
            if (newSessionClasses.length > 0) {
                await this.sessionClassService.saveMulti(newSessionClasses);
            }

            // Lấy danh sách đã lưu
            const savedSessionClasses = await this.sessionClassService.findAll(["courseClass", "teacher", "courseClass.course"]);
            // danh sách giáo viên
            let teacherList = await this.userService.getAllTeacher();
            response.render(this.routeHelper.getRenderPage(RouteHelper.SESSION_CLASS), {
                courseClasses: JSON.stringify(savedSessionClasses),
                teachers: teacherList,
            });
        } catch (error: any) {
            this.logger.error(error);
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
        }
    }


    @httpPost("/sessions/create")
    public async createSessionClass(request: Request, response: Response) {
        try {
            let courseId = Number(request.body.createsubject);
            let teacherId = Number(request.body.createTeacher);
            let sessionDate = request.body.createDate;
            let sessionStartTime = request.body.createStartTime;
            let sessionEndTime = request.body.createEndTime;
            let room = request.body.createRoom;
            let reason = request.body.description;
            let status = 1;
            if (request.body.createisMakeup) {
                status = 2; // Buổi học bù
            }
            let loopDay = Number(request.body.createLoopDay);
            let courseClass = await this.courseClassService.findAll([], {
                courseId: courseId,
                teacherId: teacherId,
            })
            if (!courseClass || courseClass.length === 0) {
                return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
            }

            let sessionClass = new SessionClass();
            sessionClass.courseClassId = courseClass[0].id;
            sessionClass.sessionDate = sessionDate;
            sessionClass.sessionStartTime = sessionStartTime;
            sessionClass.sessionEndTime = sessionEndTime;
            sessionClass.teacherId = teacherId;
            sessionClass.room = room;
            sessionClass.status = status;
            sessionClass.reason = reason;
            // Kiểm tra xem buổi học đã tồn tại chưa
            if (loopDay && loopDay > 0) {
                // Nếu có lặp lại thì tạo các buổi học cách tuần theo đủ số ngày lặp lại
                let loopSessions: SessionClass[] = [];
                for (let i = 0; i < loopDay; i++) {
                    let newSessionClass = new SessionClass();
                    newSessionClass.courseClassId = courseClass[0].id;
                    newSessionClass.sessionDate = new Date(sessionDate);
                    newSessionClass.sessionDate.setDate(newSessionClass.sessionDate.getDate() + i * 7); // Cách nhau 7 ngày
                    newSessionClass.sessionStartTime = sessionStartTime;
                    newSessionClass.sessionEndTime = sessionEndTime;
                    newSessionClass.teacherId = teacherId;
                    newSessionClass.room = room;
                    newSessionClass.status = status;
                    newSessionClass.reason = reason;
                    // Kiểm tra xem buổi học đã tồn tại chưa

                    let existingSession = await this.sessionClassService.findAll([], {
                        courseClassId: courseClass[0].id,
                        teacherId: teacherId,
                        sessionDate: new Date(newSessionClass.sessionDate),
                        sessionStartTime: sessionStartTime,
                        sessionEndTime: sessionEndTime,
                    });
                    if (existingSession && existingSession.length > 0) {
                        return response.status(HttpCode.BAD_REQUEST).json({
                            code: HttpCode.BAD_REQUEST,
                            message: Messages.SESSION_CLASS_EXISTED,
                        });
                    }
                    loopSessions.push(newSessionClass);
                }
                // Lưu các buổi học lặp lại
                await this.sessionClassService.saveMulti(loopSessions);
                return response.status(HttpCode.SUCCESSFUL).redirect(RouteHelper.SESSION_CLASS);
            }

            let existingSession = await this.sessionClassService.findAll([], {
                courseClassId: courseClass[0].id,
                teacherId: teacherId,
                sessionDate: new Date(sessionDate),
                sessionStartTime: sessionStartTime,
                sessionEndTime: sessionEndTime,
            });
            if (existingSession && existingSession.length > 0) {
                return response.status(HttpCode.BAD_REQUEST).json({
                    code: HttpCode.BAD_REQUEST,
                    message: Messages.SESSION_CLASS_EXISTED,
                });
            }
            // Lưu buổi học
            await this.sessionClassService.save(sessionClass);
            return response.status(HttpCode.SUCCESSFUL).redirect(RouteHelper.SESSION_CLASS);
        } catch (error: any) {
            this.logger.error(error);
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
        }
    }

    @httpPost("/schedule/:id/edit", verifyAuthTokenRouter)
    public async editSchedule(request: Request, response: Response) {
        let eventId = Number(request.body.eventId);
        let teacherId = Number(request.body.teacherId);
        let courseClassId = Number(request.body.courseClassId);
        let courseId = Number(request.body.courseId);
        let startTime = request.body.startTime;
        let endTime = request.body.endTime;
        let room = request.body.room;
        let isMakeup = Number(request.body.isMakeup);
        let isCancelled = Number(request.body.isCancelled);
        let syncRoom = Number(request.body.syncRoom);
        let reason = request.body.reason;
        try {
            let status = 1; // Buổi học đang diễn ra
            if (isCancelled === 1) {
                status = 0; // Buổi học bị hủy
            } else if (isMakeup === 1) {
                status = 2; // Buổi học bù
            }
            let sessionClass = await this.sessionClassService.findById(eventId, ["courseClass", "teacher"]);
            if (!sessionClass) {
                return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
            }

            // Khi đồng bộ phòng học
            if (syncRoom === 1) {
                // Lấy danh sách các buổi học cùng giáo viên và lớp học
                let sessionClasses = await this.sessionClassService.findAll(["courseClass", "teacher"], {
                    courseClassId: courseClassId,
                    teacherId: teacherId,
                });
                // Cập nhật phòng học cho tất cả các buổi học cùng giáo viên và lớp học
                if (sessionClasses && sessionClasses.length > 0) {
                    for (let i = 0; i < sessionClasses.length; i++) {
                        sessionClasses[i].room = room;
                        await this.sessionClassService.save(sessionClasses[i]);
                    }
                }
            }

            // Cập nhật buổi học
            sessionClass.teacherId = teacherId;
            sessionClass.courseClassId = courseClassId;
            sessionClass.sessionStartTime = startTime;
            sessionClass.sessionEndTime = endTime;
            sessionClass.status = status;
            sessionClass.reason = reason;
            sessionClass.room = room
            await this.sessionClassService.save(sessionClass);
            return response
                .status(HttpCode.SUCCESSFUL)
                .cookie("messages", { message: Messages.EDIT_SESSION_CLASS_SUCCESS })
                .json({
                    code: HttpCode.SUCCESSFUL,
                    message: Messages.EDIT_SESSION_CLASS_SUCCESS,
                    sessionClass: sessionClass,
                });

        } catch (error: any) {
            this.logger.error(error);
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
        }
    }

    @httpGet("/schedule/detail/:id", verifyAuthTokenRouter)
    public async getSessionClassDetail(request: Request, response: Response) {
        try {
            let sessionId = Number(request.params.id);
            let name: any = (request.query.searchField as string)?.trim() || "";
            let page: any = request.query.page || 1;
            let sortBy: any = request.query.sortBy;
            let sort: any = request.query.sort || "ASC";
            // get courseclassid from sessionClassId
            let sessionClass = await this.sessionClassService.findAll(
                ["courseClass", "courseClass.course", "courseClass.teacher"],
                {
                    id: sessionId,
                }
            )
            if (!sessionClass) {
                return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
            }
            let courseClass = sessionClass[0].courseClass;
            if (!courseClass) {
                return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
            }
            const payload = { sessionId: sessionId };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1m" });

            // Tạo URL điểm danh chứa token
            const attendanceUrl = `http://localhost:9999/api/v1/attendance/${token}`;

            // Tạo QR code dạng data URL
            const qrImageUrl = await QRCode.toDataURL(attendanceUrl);

            // Lấy danh sách sinh viên trong lớp học cùng nhóm
            let studentList = await this.classStudentService.findStudentsByCourseClassId(name, courseClass.id, page, this.limitedItem, sortBy, sort);

            // Lấy danh sách sinh viên trong cùng lớp có thể khác nhóm
            let courseId = courseClass.course?.id || 0;
            let studentsInCourse = await this.classStudentService.findAll(["student", "courseClass", "courseClass.course", "student.student"], {
                courseClass: {
                    course: {
                        id: courseId,
                    },
                }
            });
            // Lọc ra những sinh viên không có trong lớp hiện tại
            let studentsNotInSession = studentsInCourse?.filter((student: any) => {
                return !studentList?.list.some((s: any) => s.studentId === student.student.id);
            });
            

            if (studentList) {
                response.render(this.routeHelper.getRenderPage(RouteHelper.SESSION_CLASS_DETAIL), {
                    sessionClass: sessionClass,
                    courseClass: courseClass,
                    students: studentList.list,
                    total: studentList.total,
                    page: studentList.pageSize,
                    limit: this.limitedItem,
                    searchField: name,
                    lastPage: Math.ceil(studentList.total / this.limitedItem),
                    sortBy,
                    sort,
                    qrImageUrl: qrImageUrl,
                    qrExpiresIn: 60, // 60 giây
                    studentsInCourse: studentsInCourse,
                    studentsNotInSession: studentsNotInSession,
                });
            }
        } catch (error: any) {
            this.logger.error(error);
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
        }
    }

    @httpGet("/schedule/qr/:id", verifyAuthTokenRouter)
    public async generateQrToken(request: Request, response: Response) {
        const sessionClassId = Number(request.params.sessionClassId);

        const payload = {
            sessionId: sessionClassId,
            createdAt: Date.now()
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30s" });

        const attendanceUrl = `http://localhost:9999/api/v1/attendance/${token}`;
        return response.json({ token, url: attendanceUrl });
    }

    @httpPost("/session/:classId/student/add", verifyAuthTokenRouter)
    public async addStudentToSession(request: Request, response: Response) {
        try {
            let studentIds = request.body.students; // Mảng ID sinh viên
            let sessionId = Number(request.body.sessionId);
            let courseClassId = Number(request.body.courseClassId);
            // Kiểm tra xem sinh viên này có trong lớp học này không
            let sessionClass = await this.classStudentService.findAll(["student", "courseClass"], {
                courseClassId: courseClassId,
                studentId: In(studentIds),
            });
            if (sessionClass && sessionClass.length > 0) {
                // Sinh viên đã có trong lớp học này
                return response.status(HttpCode.BAD_REQUEST).json({
                    code: HttpCode.BAD_REQUEST,
                    message: Messages.STUDENT_EXISTED_IN_CLASS,
                });
            }
            // Lưu danh sách sinh viên vào buổi học
            let sessionStudents: any[] = [];
            for (let i = 0; i < studentIds.length; i++) {
                let sessionStudent = {
                    courseClassId: courseClassId,
                    studentId: studentIds[i],
                    addByClass: 0, // 0: Thêm từ buổi học, 1: Thêm từ lớp học
                };
                sessionStudents.push(sessionStudent);
            }
            if (sessionStudents.length > 0) {
                await this.classStudentService.saveMulti(sessionStudents);
            }
            return response.status(HttpCode.SUCCESSFUL).json({
                status: HttpCode.SUCCESSFUL,
                message: Messages.ADD_STUDENT_TO_SESSION_SUCCESS,
                sessionId: sessionId,
                courseClassId: courseClassId,
                students: sessionStudents,
            }); 

        } catch (error: any) {
            this.logger.error(error);
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
        }
    }

    @httpPost("/session/:sessionId/student/delete", verifyAuthTokenRouter)
    public async deleteStudentFromSession(request: Request, response: Response) {
        try {
            let studentIds = request.body.ids;
            console.log("studentIds", studentIds);
            let sessionId = Number(request.body.sessionId);
            let courseClassId = Number(request.body.courseClassId);
            // Kiểm tra xem sinh viên này có trong buổi học này không
            let sessionClass = await this.classStudentService.findAll(["student", "courseClass"], {
                courseClassId: courseClassId,
                studentId: In(studentIds),
            });
            if (!sessionClass || sessionClass.length === 0) {
                // Sinh viên không có trong buổi học này
                return response.status(HttpCode.BAD_REQUEST).json({
                    code: HttpCode.BAD_REQUEST,
                    message: Messages.STUDENT_NOT_EXISTED_IN_SESSION,
                });
            }
            // Xóa sinh viên khỏi buổi học
            if (studentIds && studentIds == "all") {
                // Xóa tất cả sinh viên khỏi buổi học
                await this.classStudentService.deleteByCourseClassId(courseClassId);
            } else {
                
            }
        } catch (error: any) {
            this.logger.error(error);
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
        }
    }
}