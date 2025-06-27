import { controller, httpGet, httpPost } from "inversify-express-utils";
import { Request, Response } from "express";
import { verifyAuthTokenRouter } from "@inversifyjs/infrastructure";
import { ActivityStudent, Role, User } from "@inversifyjs/domain";
import { ClassStudentService, HttpCode, TYPES, UserService, Variables, RouteHelper, Message, EncryptHelper, AttendanceService, Messages, CourseClassService, ActivityStudentService } from "@inversifyjs/application";
import { inject } from "inversify";
import * as jwt from "jsonwebtoken";
import * as randToken from "rand-token";
import * as bcrypt from "bcryptjs";
import { BaseController } from "./base-controller";
@controller("/api/v1")
export class ApiController extends BaseController {
    private userService!: UserService;
    private classStudentService!: ClassStudentService;
    private expiredSession: number;
    private tokenKey: string;
    private refreshTokenSize: string;
    private attendanceService!: AttendanceService;
    private courseClassService!: CourseClassService;
    private activityStudent!: ActivityStudentService;

    constructor(
        @inject(TYPES.UserService) userService: UserService,
        @inject(TYPES.ClassStudentService) classStudentService: ClassStudentService,
        @inject(TYPES.AttendanceService) attendanceService: AttendanceService,
        @inject(TYPES.CourseClassService) courseClassService: CourseClassService,
        @inject(TYPES.ActivityStudentService) activityStudent: ActivityStudentService
    ) {
        super();
        this.userService = userService;
        this.expiredSession = Variables.EXPIRED_SESSION;
        this.tokenKey = process.env.TOKEN_KEY!;
        this.refreshTokenSize = process.env.REFRESH_TOKEN_SIZE!;
        this.classStudentService = classStudentService;
        this.attendanceService = attendanceService;
        this.courseClassService = courseClassService;
        this.activityStudent = activityStudent;
    }

    @httpGet("/attendance/:token")
    public async checkAttendanceFromQr(req: Request, res: Response) {
        console.log("Checking attendance from QR code");
        // trả về điểm danh thành công
        return res.status(200).json({
            message: "Điểm danh thành công",
            data: {
                userId: req.params.token, // Giả sử token là userId
                timestamp: new Date().toISOString(),
            },
        });
    }

    @httpPost("/react-native-login")
    public async reactNativeLogin(req: Request, res: Response) {
        // Xử lý đăng nhập từ React Native
        const { googleId, name, email, picture, givenName, familyName } = req.body;

        let user: User | undefined | null = await this.userService.findByEmail(email);

        if (!user) {
            // Nếu người dùng chưa tồn tại, tạo mới người dùng
            let newUser = await this.userService.createFromReactNative(name, email, picture, givenName, familyName);
            if (newUser) {
                user = await this.userService.findOneById(newUser.id);
            }
        }
        let accessToken: string = jwt.sign({ userId: user?.id }, this.tokenKey, { expiresIn: `${process.env.REMEMBER_TOKEN!}s` });
        let refreshToken = randToken.generate(parseInt(this.refreshTokenSize));
        try {
            if (user) {
                user.refreshToken = refreshToken;
                user.role = { id: user.roleId } as Role;
                if ("student" in user) {
                    delete (user as any).student;
                }
                await this.userService.save(user);
            }
        } catch (error) {
            console.error("Error saving user refresh token:", error);
        }

        res.json({
            message: "Đăng nhập thành công",
            user: {
                id: user?.id,
                name: user?.firstName + " " + user?.lastName,
                email: user?.email,
                picture: user?.imagePath,
                role: user?.roleId,
            },
            token: accessToken,
        });
    }

    @httpGet("/get-student-schedule/:id")
    public async getStudentSchedule(req: Request, res: Response) {
        const studentId = req.params.id;
        console.log("Fetching schedule for student ID:", studentId);

        let getStudentSchedule = await this.classStudentService.getStudentSchedule(studentId);
        if (!getStudentSchedule) {
            return res.status(404).json({
                message: "Không tìm thấy lịch học cho sinh viên này",
            });
        }

        //
        let schedule: any[] = [];

        getStudentSchedule.forEach((item: any) => {
            // random color for each course
            let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
            item.courseClass.sessionClass.forEach((session: any) => {
                schedule.push({
                    subject: item.courseClass.course.courseName,
                    startTime: session.sessionStartTime,
                    endTime: session.sessionEndTime,
                    room: session.room,
                    teacher: item.courseClass.teacher.firstName + " " + item.courseClass.teacher.lastName,
                    date: session.sessionDate,
                    color: color,
                    courseId: item.courseClass.course.id,
                });
            });
        });
        return res.status(200).json({
            message: "Lịch học đã được lấy thành công",
            data: schedule,
        });
    }

    @httpGet("/get-student-events/:id")
    public async getStudentEvents(req: Request, res: Response) {
        const studentId = req.params.id;
        console.log("Fetching events for student ID:", studentId);

        let getStudentEvents = await this.activityStudent.find(["activity"], {
            studentId: studentId,
        });

        if (!getStudentEvents) {
            return res.status(404).json({
                message: "Không tìm thấy sự kiện cho sinh viên này",
            });
        }

        let events: any[] = [];
        getStudentEvents.forEach((item: any) => {
            // random color for each event
            let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
            events.push({
                id: item.id,
                title: item.activity.activityName,
                description: item.activity.activityDescription,
                startTime: item.activity.startTime,
                endTime: item.activity.endTime,
                location: item.activity.location,
                date: item.activity.activityDate.toISOString().split("T")[0], // Chỉ lấy ngày
                color: color,
            });
        });
        return res.status(200).json({
            message: "Sự kiện đã được lấy thành công",
            data: events,
        });
    }

    @httpPost("/app/login")
    public async appLogin(req: any, res: any) {
        let email: string = req.body.email;
        let password: string = req.body.password;
        let remember: string = req.body.remember;

        if (remember === "on") {
            this.expiredSession = Variables.REMEMBER_SESSION;
            req.session.cookie.maxAge = Variables.REMEMBER_SESSION;
        }

        let user: User | undefined | null = await this.userService.findByEmail(email);
        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.active) {
                return res.status(HttpCode.BAD_REQUEST).json({ message: Message.USER_IS_BLOCKED });
            }

            /** Create access token */
            let accessToken: string = jwt.sign({ userId: user.id, remember }, this.tokenKey, { expiresIn: `${process.env.REMEMBER_TOKEN!}s` });
            let refreshToken = randToken.generate(parseInt(this.refreshTokenSize));

            user.refreshToken = refreshToken;
            // Save user with refresh token to DB
            await this.userService.save(user);

            this.logger.info(Message.LOGIN_SUCCESS);
            (req.session as any).userId = user.id;
            res.json({
                success: true,
                message: Message.LOGIN_SUCCESS,
                user: {
                    id: user.id,
                    name: user.firstName + " " + user.lastName,
                    email: user.email,
                    picture: user.imagePath,
                    role: user.roleId,
                },
                token: accessToken,
            });
        }
    }

    @httpPost("/attendance/:sessionId")
    public async attendance(req: Request, res: Response) {
        const sessionId = req.params.sessionId;
        const userId = req.body.userId;
        let sessionExpiredAt = req.body.sessionExpiredAt;
        let currentTime = Date.now();
        const annonymous = req.body.annonymous || false;
        if (annonymous) {
            sessionExpiredAt = req.body.sessionExpiredAt;
            currentTime = req.body.scannedAt || Date.now();
        }
        // Kiểm tra xem mã qr còn hạn hay không
        if (currentTime > sessionExpiredAt) {
            return res.status(HttpCode.SUCCESSFUL).json({
                status: HttpCode.BAD_REQUEST,
                message: Messages.SESSION_EXPIRED,
            });
        }
        // // Kiểm tra xem người dùng có tồn tại không
        const user = await this.userService.findOneById(userId);
        if (!user) {
            return res.status(HttpCode.SUCCESSFUL).json({
                status: HttpCode.NOT_FOUND,
                message: Message.USER_NOT_FOUND,
            });
        }
        console.log("Session ID:", sessionId);
        console.log("User ID:", userId);

        // Lấy buổi học
        const session = await this.attendanceService.findOne(["sessionClass", "sessionClass.courseClass", "sessionClass.courseClass.course"], {
            sessionId: sessionId,
        });
        // Lấy các courseClass của buổi học, có thể cùng một nhưng khác nhóm

        if (!session) {
            return res.status(HttpCode.SUCCESSFUL).json({
                status: HttpCode.NOT_FOUND,
                message: Messages.SESSION_NOT_FOUND,
            });
        }
        const courseClasses = await this.courseClassService.find(["course", "teacher", "sessionClass", "classStudent", "classStudent.student"], {
            courseId: session.sessionClass.courseClass?.courseId,
        });

        // Kiểm tra xem người dùng có tồn tại trong danh sách các lớp học không
        let studentInClass: any[] = [];
        if (courseClasses && courseClasses.length > 0) {
            courseClasses.forEach((courseClass) => {
                const classStudent = courseClass.classStudent.find((cs) => cs.studentId === userId);
                if (classStudent) {
                    studentInClass.push({
                        courseClassId: courseClass.id,
                        studentId: classStudent.studentId,
                    });
                }
            });
        }
        if (studentInClass.length === 0) {
            return res.status(HttpCode.SUCCESSFUL).json({
                status: HttpCode.NOT_FOUND,
                message: Messages.STUDENT_NOT_EXISTED_IN_SESSION,
            });
        }

        // Kiểm tra xem người dùng đã điểm danh chưa
        const attendanceRecord = session.studentAttendance.find((attendance: { student_id: any; status: number }) => {
            return attendance.student_id === userId && (attendance.status === 1 || attendance.status === 2 || attendance.status === 3);
        });
        if (attendanceRecord) {
            return res.status(HttpCode.SUCCESSFUL).json({
                status: HttpCode.NOT_FOUND,
                message: Messages.STUDENT_ATTENDED,
            });
        }

        // Điểm danh người dùng
        let count = 0;
        session.studentAttendance.forEach((attendance: { student_id: any; status: number; timestamp?: string; note?: string }) => {
            if (attendance.student_id === userId) {
                attendance.status = 1; // Đánh dấu là đã điểm danh
                attendance.timestamp = new Date().toISOString(); // Ghi lại thời gian điểm danh
                count++;
            }
        });

        if (count === 0) {
            session.studentAttendance.push({
                student_id: userId,
                status: 1, // Đánh dấu là đã điểm danh
                timestamp: new Date().toISOString(), // Ghi lại thời gian điểm danh
                note: "Điểm danh từ QR code",
            });
        }

        await this.attendanceService.save(session);

        return res.status(HttpCode.SUCCESSFUL).json({
            status: HttpCode.SUCCESSFUL,
            message: Messages.STUDENT_ATTENDED_SUCCESS,
            data: {
                userId: userId,
                sessionId: sessionId,
                timestamp: new Date().toISOString(),
            },
        });
    }

    @httpPost("/event-attendance/:eventId")
    public async attendanceEvent(req: Request, res: Response) {
        const eventId = req.params.eventId;
        const userId = req.body.userId;
        let sessionExpiredAt = req.body.sessionExpiredAt;
        let currentTime = Date.now();
        const annonymous = req.body.annonymous || false;
        if (annonymous) {
            sessionExpiredAt = req.body.sessionExpiredAt;
            currentTime = req.body.scannedAt || Date.now();
        }
        // Kiểm tra xem mã qr còn hạn hay không
        if (currentTime > sessionExpiredAt) {
            return res.status(HttpCode.SUCCESSFUL).json({
                status: HttpCode.BAD_REQUEST,
                message: Messages.SESSION_EXPIRED,
            });
        }
        // // Kiểm tra xem người dùng có tồn tại không
        const user = await this.userService.findOneById(userId);
        if (!user) {
            return res.status(HttpCode.SUCCESSFUL).json({
                status: HttpCode.NOT_FOUND,
                message: Message.USER_NOT_FOUND,
            });
        }
        console.log("Event ID:", eventId);
        console.log("User ID:", userId);

        // Lấy sự kiện
        const event = await this.activityStudent.findOne(["activity"], {
            activityId: eventId,
        });
        if (!event) {
            return res.status(HttpCode.SUCCESSFUL).json({
                status: HttpCode.NOT_FOUND,
                message: Messages.EVENT_NOT_FOUND,
            });
        }

        // Kiểm tra xem người dùng điểm danh chưa
        let attendanceRecord = await this.activityStudent.findOne(["activity"], {
            activityId: eventId,
            studentId: userId,
        });

        if (!attendanceRecord) {
            // Nguoi dung khong ton tai trong danh sach diem danh
            return res.status(HttpCode.SUCCESSFUL).json({
                status: HttpCode.NOT_FOUND,
                message: Messages.STUDENT_NOT_EXISTED_IN_EVENT,
            });
        }
        if (attendanceRecord.attendanceCheck === 1) {
            // Nguoi dung da diem danh roi
            return res.status(HttpCode.SUCCESSFUL).json({
                status: HttpCode.NOT_FOUND,
                message: Messages.STUDENT_ATTENDED,
            });
        }
        attendanceRecord.attendanceCheck = 1; // Đánh dấu là đã điểm danh
        if (annonymous) {
            attendanceRecord.attendanceTime = new Date(currentTime);
        } else {
            attendanceRecord.attendanceTime = new Date();
        }
        attendanceRecord.note = "Điểm danh từ QR code";
        await this.activityStudent.save(attendanceRecord);
        return res.status(HttpCode.SUCCESSFUL).json({
            status: HttpCode.SUCCESSFUL,
            message: Messages.STUDENT_ATTENDED_SUCCESS,
            data: {
                userId: userId,
                eventId: eventId,
                timestamp: new Date().toISOString(),
            },
        });
    }

    @httpGet("/get-student-attendance/:id")
    public async getStudentAttendance(req: Request, res: Response) {
        let studentId = req.params.id;
        let getStudentAttendance = await this.attendanceService.find(["sessionClass", "sessionClass.courseClass", "sessionClass.courseClass.course"], {
            sessionClass: {
                courseClass: {
                    classStudent: {
                        studentId: studentId,
                    }
                }
            }
        });
        if (!getStudentAttendance || getStudentAttendance.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy lịch sử điểm danh cho sinh viên này",
            });
        }
        // Chuyển đổi dữ liệu thành định dạng mong muốn
        let attendanceHistory: any[] = [];
        getStudentAttendance.forEach((attendance: any) => {
            attendance.studentAttendance.forEach((session: any) => {
                if (session.student_id === Number(studentId)) {
                    let status = "Có mặt";
                    let color = "#28a745";
                    if (session.status === 0 || session.status === null) {
                        status = "Chưa điểm danh";
                        color = "#dc3545";
                    } else if (session.status === 2) {
                        status = "Vắng";
                        color = "#dc3545";
                    } else if (session.status === 1) {
                        status = "Có mặt";
                        color = "#28a745";
                    } else if (session.status === 3) {
                        status = "Muộn";
                        color = "#ffc107";
                    }
                    attendanceHistory.push({
                        id: attendance.id,
                        subject: attendance.sessionClass.courseClass.course.courseName,
                        date: attendance.sessionClass.sessionDate,
                        startTime: attendance.sessionClass.sessionStartTime,
                        endTime: attendance.sessionClass.sessionEndTime,
                        room: attendance.sessionClass.room || " ",
                        status: status,
                        color: color,
                        checkedAt: session.timestamp ? new Date(session.timestamp).toISOString() : null,
                    });
                }
            });
        });
        // sort theo checkedAt giảm dần
        attendanceHistory.sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
        const json = {
            "message": "Lịch sử điểm danh môn học đã được lấy thành công",
            "data": attendanceHistory
        };

        return res.status(HttpCode.SUCCESSFUL).json(json);
    }

    @httpGet("/get-student-event-attendance/:id")
    public async getStudentEventAttendance(req: Request, res: Response) {
        const studentId = req.params.id;
        console.log("Fetching event attendance for student ID:", studentId);

        let getStudentEventAttendance = await this.activityStudent.find(["activity"], {
            studentId: studentId,
        });
        if (!getStudentEventAttendance || getStudentEventAttendance.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy lịch sử điểm danh sự kiện cho sinh viên này",
            });
        }
        // Chuyển đổi dữ liệu thành định dạng mong muốn
        let eventAttendanceHistory: any[] = [];
        getStudentEventAttendance.forEach((attendance: any) => {
            let status = "Có mặt";
            let color = "#28a745";
            if (attendance.attendanceCheck === 0 || attendance.attendanceCheck === null) {
                status = "Chưa điểm danh";
                color = "#dc3545";
            } else if ( attendance.status === 2) {
                status = "Vắng";
                color = "#dc3545";
            } else if (attendance.attendanceCheck === 1) {
                status = "Có mặt";
                color = "#28a745";
            } else if (attendance.attendanceCheck === 3) {
                status = "Muộn";
                color = "#ffc107";
            }
            eventAttendanceHistory.push({
                id: attendance.id,
                eventName: attendance.activity.activityName,
                date: attendance.activity.activityDate.toISOString().split("T")[0], // Chỉ lấy ngày
                startTime: attendance.activity.startTime,
                endTime: attendance.activity.endTime,
                location: attendance.activity.location || " ",
                status: status,
                checkedAt: attendance.attendanceTime ? attendance.attendanceTime.toISOString() : null,
                color: color,
            });
        });
        // sort theo checkedAt giảm dần
        eventAttendanceHistory.sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
        const json = {
            "message": "Lịch sử điểm danh sự kiện đã được lấy thành công",
            "data": eventAttendanceHistory
        };
        return res.status(HttpCode.SUCCESSFUL).json(json);
    }

}
