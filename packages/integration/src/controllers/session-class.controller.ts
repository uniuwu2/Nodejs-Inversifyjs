import { controller, httpGet, httpPost } from "inversify-express-utils";
import { BaseController } from "./base-controller";
import { AttendanceService, ClassStudentService, CourseClassService, CourseService, DepartmentService, HttpCode, Messages, Permission, RouteHelper, SessionClassService, TYPES, UserService, Variables } from "@inversifyjs/application";
import { Request, Response } from "express";
import { verify } from "crypto";
import { verifyAuthTokenRouter } from "@inversifyjs/infrastructure";
import { inject } from "inversify";
import { Attendance, SessionClass, User } from "@inversifyjs/domain";
import * as QRCode from "qrcode";
import * as jwt from "jsonwebtoken";
import { Brackets, In } from "typeorm";
const JWT_SECRET = process.env.TOKEN_KEY || "mydevsecretkey123456";

@controller(RouteHelper.SESSION_CLASS)
export class SessionClassController extends BaseController {
    private courseClassService!: CourseClassService;
    private sessionClassService!: SessionClassService;
    private userService!: UserService;
    private classStudentService!: ClassStudentService;
    private attendanceService!: AttendanceService;

    constructor(
        @inject(TYPES.CourseClassService) courseClassService: CourseClassService,
        @inject(TYPES.SessionClassService) sessionClassService: SessionClassService,
        @inject(TYPES.UserService) userService: UserService,
        @inject(TYPES.ClassStudentService) classStudentService: ClassStudentService,
        @inject(TYPES.AttendanceService) attendanceService: AttendanceService

    ) {
        super();
        this.courseClassService = courseClassService;
        this.sessionClassService = sessionClassService;
        this.userService = userService;
        this.classStudentService = classStudentService;
        this.attendanceService = attendanceService;
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


            const attendance = await this.attendanceService.findOne([], {
                sessionId: sessionId,
            })
            const attendanceList: {
                student_id: number;
                status: string | null;
                note: string;
            }[] = attendance?.studentAttendance || [];

            // Lấy ra tất cả student_id trong attendanceList
            let studentIds = attendanceList.map((s) => s.student_id);
            // // Nếu có name filter, lọc danh sách studentIds theo tên/email/student_number
            if (name.trim()) {
                const keyword = `%${name.toLowerCase()}%`;

                const filteredUsers = await this.userService
                    .createQueryBuilder("user")
                    .leftJoinAndSelect("user.student", "student")
                    .where("user.id IN (:...studentIds)", { studentIds })
                    .andWhere(
                        new Brackets(qb => {
                            qb.where("LOWER(user.firstName) LIKE :keyword", { keyword })
                                .orWhere("LOWER(user.lastName) LIKE :keyword", { keyword })
                                .orWhere("LOWER(user.email) LIKE :keyword", { keyword })
                                .orWhere("student.student_number LIKE :keyword", { keyword });
                        })
                    )
                    .getMany();

                studentIds = filteredUsers.map((u: { id: any; }) => u.id);
            }
            // Lấy danh sách sinh viên trong cùng lớp có thể khác nhóm
            let courseId = courseClass.course?.id || 0;
            let studentsInCourse = await this.classStudentService.findAll(["student", "courseClass", "courseClass.course", "student.student"], {
                courseClass: {
                    course: {
                        id: courseId,
                    },
                }
            });

            let studentsInSession = await this.attendanceService.findAll([], {
                sessionId: sessionId,
            });

            if (!studentsInSession || studentsInSession.length === 0) {
                studentsInSession = [];
            }

            let studentsInSessionIds = [];
            if (studentsInSession.length > 0) {
                studentsInSessionIds = studentsInSession[0].studentAttendance.map((attendance: any) => attendance.student_id);
            }

            // Lọc ra danh sách sinh viên trong buổi học
            let studentsNotInSession = studentsInCourse?.filter((student: any) => {
                return !studentsInSessionIds.includes(student.student.id);
            });

            if (!attendance?.studentAttendance || attendance?.studentAttendance.length === 0) {
                // Nếu không có sinh viên nào trong buổi học, trả về danh sách rỗng
                return response.render(this.routeHelper.getRenderPage(RouteHelper.SESSION_CLASS_DETAIL), {
                    sessionClass: sessionClass,
                    courseClass: courseClass,
                    students: [],
                    total: 0,
                    page: page,
                    limit: this.limitedItem,
                    searchField: name,
                    lastPage: 0,
                    sortBy,
                    sort,
                    qrImageUrl: qrImageUrl,
                    qrExpiresIn: 30, // 60 giây
                    studentsInCourse: studentsInCourse,
                    studentsNotInSession: studentsNotInSession,
                });
            }
            // Query lại userRepo lấy user đã lọc, áp dụng phân trang + sort
            const qb = this.userService
                .createQueryBuilder("user")
                .leftJoinAndSelect("user.student", "student")
                .where("user.id IN (:...studentIds)", { studentIds });

            // Xử lý sortBy
            let orderColumn = "";
            switch (sortBy) {
                case "firstName":
                    orderColumn = "user.firstName";
                    break;
                case "lastName":
                    orderColumn = "user.lastName";
                    break;
                case "email":
                    orderColumn = "user.email";
                    break;
                case "studentNumber":
                    orderColumn = "student.student_number";
                    break;
                default:
                    orderColumn = "user.firstName";
                    break;
            }
            qb.orderBy(orderColumn, sort.toUpperCase() === "DESC" ? "DESC" : "ASC");
            // Phân trang
            qb.skip((page - 1) * this.limitedItem).take(this.limitedItem);

            const [students, total] = await qb.getManyAndCount();

            // Ghép thông tin điểm danh (status, note) từ attendanceList vào
            const resultList = students.map((student: any) => {
                const attendanceInfo = attendanceList.find((a: any) => a.student_id === student.id);
                return {
                    ...student,
                    status: attendanceInfo ? attendanceInfo.status : null,
                    note: attendanceInfo ? attendanceInfo.note : null,
                };
            });


            response.render(this.routeHelper.getRenderPage(RouteHelper.SESSION_CLASS_DETAIL), {
                sessionClass: sessionClass,
                courseClass: courseClass,
                students: resultList,
                total: total,
                page: page,
                limit: this.limitedItem,
                searchField: name,
                lastPage: Math.ceil(total / this.limitedItem),
                sortBy,
                sort,
                qrImageUrl: qrImageUrl,
                qrExpiresIn: 60, // 60 giây
                studentsInCourse: studentsInCourse,
                studentsNotInSession: studentsNotInSession,
            });
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

        const attendanceUrl = `https://3577-2402-800-63b7-a742-f89a-6e98-2647-ca94.ngrok-free.app/api/v1/attendance/${token}`;
        return response.json({ token, url: attendanceUrl });
    }

    @httpPost("/session/:classId/student/add", verifyAuthTokenRouter)
    public async addStudentToSession(request: Request, response: Response) {
        try {
            const studentIds: number[] = request.body.students;
            const sessionId = Number(request.body.sessionId);
            const attendance = await this.attendanceService.findOne([], {
                sessionId: sessionId
            });

            if (!attendance) {
                return response.status(HttpCode.NOT_FOUND).json({
                    code: HttpCode.NOT_FOUND,
                    message: "Buổi học không tồn tại",
                });
            }
            let currentList = attendance.studentAttendance || [];

            // Loại bỏ những studentId đã tồn tại
            const existingIds = currentList.map((s: any) => s.student_id);
            const newStudents = studentIds.filter(id => !existingIds.includes(id));
            if (newStudents.length === 0) {
                return response.status(HttpCode.BAD_REQUEST).json({
                    code: HttpCode.BAD_REQUEST,
                    message: "Tất cả sinh viên đã có trong buổi học",
                });
            }
            // Tạo danh sách mới cần thêm
            const newEntries = newStudents.map(id => ({
                student_id: id,
                status: null,
                note: "",
            }));
            // Gộp danh sách cũ + mới
            const updatedList = [...currentList, ...newEntries];
            attendance.studentAttendance = updatedList;
            // Cập nhật lại attendance
            await this.attendanceService.save(attendance)
            return response.status(HttpCode.SUCCESSFUL).json({
                code: HttpCode.SUCCESSFUL,
                message: "Thêm sinh viên vào buổi học thành công",
                added: newEntries.length,
                sessionId: sessionId,
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
            let sessionId = Number(request.body.sessionId);
            let courseClassId = Number(request.body.courseClassId);

            if (!sessionId) {
                return response.status(HttpCode.BAD_REQUEST).json({
                    code: HttpCode.BAD_REQUEST,
                    message: "Missing sessionId",
                });
            }

            const attendance = await this.attendanceService.findOne([], {
                sessionId: sessionId
            });

            if (!attendance) {
                return response.status(HttpCode.NOT_FOUND).json({
                    code: HttpCode.NOT_FOUND,
                    message: "Attendance record not found for this session",
                });
            }

            let currentList: {
                student_id: number;
                status: string | null;
                note: string;
            }[] = attendance.studentAttendance || [];
            if (studentIds == "all") {
                // Xóa toàn bộ sinh viên khỏi mảng
                attendance.studentAttendance = [];
            } else if (Array.isArray(studentIds)) {
                // Xóa theo danh sách id
                const idsToDelete = studentIds.map((id: any) => Number(id));
                attendance.studentAttendance = currentList.filter(
                    s => !idsToDelete.includes(s.student_id)
                );
            } else {
                return response.status(HttpCode.BAD_REQUEST).json({
                    code: HttpCode.BAD_REQUEST,
                    message: "Invalid studentIds",
                });
            }

            await this.attendanceService.save(attendance);
            return response.status(HttpCode.SUCCESSFUL).json({
                code: HttpCode.SUCCESSFUL,
                message: "Student(s) removed from session attendance successfully",
            });

        } catch (error: any) {
            this.logger.error(error);
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
        }
    }

    @httpPost("/session/student/edit-status", verifyAuthTokenRouter)
    public async editStudentStatusInSession(request: Request, response: Response) {
        try {
            const sessionId = Number(request.body.sessionId);
            const studentId = Number(request.body.id);
            const status = request.body.status;
            const note = request.body.note;

            if (!sessionId || !studentId) {
                return response.status(HttpCode.BAD_REQUEST).json({
                    code: HttpCode.BAD_REQUEST,
                    message: "Missing sessionId or studentId",
                });
            }

            const attendance = await this.attendanceService.findOne([], {
                sessionId: sessionId
            });

            if (!attendance) {
                return response.status(HttpCode.NOT_FOUND).json({
                    code: HttpCode.NOT_FOUND,
                    message: "Attendance record not found for this session",
                });
            }

            // Tìm sinh viên trong danh sách điểm danh
            const studentAttendance = attendance.studentAttendance.find((s: any) => s.student_id === studentId);
            if (!studentAttendance) {
                return response.status(HttpCode.NOT_FOUND).json({
                    code: HttpCode.NOT_FOUND,
                    message: "Student not found in this session attendance",
                });
            }
            // // Cập nhật trạng thái và ghi chú
            studentAttendance.status = status;
            studentAttendance.note = note;

            await this.attendanceService.save(attendance);

            return response.status(HttpCode.SUCCESSFUL).json({
                code: HttpCode.SUCCESSFUL,
                message: "Student status updated successfully",
                studentId: studentId,
                status: status,
                note: note,
            });
        } catch (error: any) {
            this.logger.error(error);
            return response.status(HttpCode.BAD_REQUEST).render(this.routeHelper.getRenderPage(RouteHelper.NOT_FOUND));
        }
    }
}